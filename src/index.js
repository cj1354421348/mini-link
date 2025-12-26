import { renderHtml } from './html.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 默认配额设为 50，防止挤占账户下其他项目的 1000 次总额度
// 可在 Cloudflare 后台环境变量 DAILY_QUOTA 中修改
const DEFAULT_QUOTA = 50;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // 获取动态配置的配额
    const DAILY_LIMIT = parseInt(env.DAILY_QUOTA) || DEFAULT_QUOTA;

    // 0. 处理 CORS 预检
    if (method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // 1. 静态资源 / 首页
    if (path === '/' || path === '/admin') {
      return new Response(renderHtml(), {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      });
    }

    // 2. API: 创建短链
    if (path === '/api/create' && method === 'POST') {
      return handleCreate(request, env);
    }

    // 3. API: 管理员列表
    if (path === '/api/list' && method === 'GET') {
      return handleList(request, env);
    }

    // 4. API: 删除短链
    if (path === '/api/delete' && method === 'DELETE') {
      return handleDelete(request, env);
    }

    // 5. 核心功能: 短链跳转 (/:slug)
    const slug = path.split('/')[1];
    if (slug && slug.length > 0) {
      return handleRedirect(slug, env);
    }

    return new Response('Not Found', { status: 404 });
  }
};

// --- Handlers ---

async function handleRedirect(slug, env) {
  // 核心路径：越快越好
  const { value, metadata } = await env.LINKS.getWithMetadata(slug);

  if (!value && !metadata) {
    return new Response('Link not found', { status: 404 });
  }

  // 兼容逻辑：优先用 metadata.url，如果没有则用 value
  const targetUrl = metadata?.url || value;

  // 记录点击统计 (可选，使用 waitUntil 不阻塞响应)
  // ctx.waitUntil(recordStats(slug)); 

  return Response.redirect(targetUrl, 302);
}

async function handleCreate(request, env) {
  try {
    const { url, customSlug } = await request.json();
    if (!url) return jsonResponse({ error: 'Missing URL' }, 400);

    // 鉴权检查
    const authHeader = request.headers.get('Authorization');
    const isAdmin = authHeader === env.SECRET_TOKEN;

    // --- 限流逻辑 (Throttling) ---
    // 计算今日 Key: USAGE:2024-05-20
    const today = new Date().toISOString().split('T')[0];
    const usageKey = `USAGE:${today}`;

    if (!isAdmin) {
      // 非管理员无法自定义 Slug
      if (customSlug) return jsonResponse({ error: 'Custom slug requires admin' }, 403);

      const limit = parseInt(env.DAILY_QUOTA) || 50;

      // 检查当前用量
      const currentUsage = parseInt(await env.LINKS.get(usageKey) || '0');
      if (currentUsage >= limit) {
        return jsonResponse({ error: 'Daily public limit reached' }, 429);
      }
    }

    // --- Slug 生成 ---
    let slug = customSlug;
    if (!slug) {
      // 循环生成直到不冲突 (极低概率循环)
      let retries = 5;
      while (retries > 0) {
        slug = generateRandomSlug(6);
        const exists = await env.LINKS.get(slug);
        if (!exists) break;
        retries--;
      }
      if (retries === 0) return jsonResponse({ error: 'Failed to generate unique slug' }, 500);
    } else {
      // 管理员指定的 slug，如果存在则覆盖 (或报错，看策略，这里选择检查防覆盖)
      const exists = await env.LINKS.get(slug);
      if (exists) return jsonResponse({ error: 'Slug already exists' }, 409);
    }

    // --- 写入数据 (利用 Metadata 存 URL 实现列表秒开) ---
    const metadata = {
      url: url,
      createdAt: Date.now()
    };

    // Key=Slug, Value=1 (占位), Metadata=RealData
    await env.LINKS.put(slug, '1', { metadata });

    // --- 增加计数 (不阻塞) ---
    // Cloudflare KV 不支持原生的原子递增，这在极端并发下稍微不准，
    // 但作为模糊的 90% 阈值控制，这是"好品味"的实用主义妥协。
    const currentCount = parseInt(await env.LINKS.get(usageKey) || '0');
    await env.LINKS.put(usageKey, (currentCount + 1).toString(), { expirationTtl: 86400 * 2 }); // 保留2天

    return jsonResponse({ slug, url });
  } catch (e) {
    return jsonResponse({ error: e.message }, 500);
  }
}

async function handleList(request, env) {
  if (!isAuthenticated(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const cursor = url.searchParams.get('cursor');

  // 列出 KV
  const list = await env.LINKS.list({ limit: 10, cursor });

  // 格式化输出，过滤掉 USAGE: 开头的系统 Key
  const cleanKeys = list.keys
    .filter(k => !k.name.startsWith('USAGE:'))
    .map(k => ({
      slug: k.name,
      url: k.metadata?.url,
      createdAt: k.metadata?.createdAt
    }));

  return jsonResponse({
    links: cleanKeys,
    cursor: list.cursor,
    list_complete: list.list_complete
  });
}

async function handleDelete(request, env) {
  if (!isAuthenticated(request, env)) return jsonResponse({ error: 'Unauthorized' }, 401);

  const { slug } = await request.json();
  if (!slug) return jsonResponse({ error: 'Missing slug' }, 400);

  await env.LINKS.delete(slug);
  return jsonResponse({ success: true });
}

// --- Utils ---

function isAuthenticated(request, env) {
  const token = request.headers.get('Authorization');
  return token && token === env.SECRET_TOKEN;
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function generateRandomSlug(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}
