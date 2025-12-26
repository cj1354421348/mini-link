export function renderHtml() {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>极简短链 | Mini-Link</title>
    <style>
        :root {
            --bg-gradient: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            --glass-bg: rgba(255, 255, 255, 0.05);
            --glass-border: rgba(255, 255, 255, 0.1);
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --accent: #6366f1;
            --accent-hover: #4f46e5;
            --danger: #ef4444;
        }
        
        * { box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
            background: var(--bg-gradient);
            color: var(--text-primary);
            min-height: 100vh;
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            overflow-x: hidden;
        }

        /* 动态背景点缀 */
        body::before {
            content: '';
            position: absolute;
            width: 300px;
            height: 300px;
            background: var(--accent);
            filter: blur(150px);
            opacity: 0.2;
            border-radius: 50%;
            z-index: -1;
            top: -50px;
            left: -50px;
        }

        .container {
            width: 100%;
            max-width: 480px;
            background: var(--glass-bg);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid var(--glass-border);
            border-radius: 24px;
            padding: 3rem 2rem;
            box-shadow: 0 30px 60px rgba(0,0,0,0.3);
            text-align: center;
            transition: transform 0.3s ease;
        }

        h1 {
            margin: 0 0 2rem 0;
            font-weight: 700;
            letter-spacing: -0.05em;
            font-size: 2rem;
            background: linear-gradient(to right, #fff, #94a3b8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        /* 输入框容器 */
        .input-wrapper {
            position: relative;
            margin-bottom: 1.5rem;
        }

        input {
            width: 100%;
            padding: 16px 20px;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--glass-border);
            color: white;
            border-radius: 12px;
            font-size: 1rem;
            outline: none;
            transition: all 0.3s;
        }
        
        input:focus {
            border-color: var(--accent);
            background: rgba(0, 0, 0, 0.4);
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        input::placeholder { color: #475569; }

        /* 按钮 */
        button {
            width: 100%;
            padding: 16px;
            background: var(--accent);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 10px 20px -10px var(--accent);
        }

        button:hover {
            background: var(--accent-hover);
            transform: translateY(-2px);
            box-shadow: 0 15px 25px -10px var(--accent);
        }
        
        button:active { transform: translateY(0); }
        button:disabled { opacity: 0.7; cursor: not-allowed; }

        /* 结果区域 */
        #result {
            margin-top: 2rem;
            padding: 1.5rem;
            background: rgba(0,0,0,0.2);
            border-radius: 16px;
            display: none;
            animation: slideUp 0.3s ease-out;
            border: 1px solid var(--glass-border);
        }

        @keyframes slideUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .result-label { color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.5rem; }
        .short-url { 
            font-size: 1.25rem; 
            font-weight: 700; 
            color: var(--accent); 
            margin-bottom: 1rem; 
            word-break: break-all; 
            font-family: monospace;
        }

        .btn-copy {
            background: rgba(255,255,255,0.1);
            box-shadow: none;
            padding: 10px;
            font-size: 0.9rem;
        }
        .btn-copy:hover { background: rgba(255,255,255,0.2); }

        /* 管理界面 */
        .admin-link {
            position: fixed;
            bottom: 20px;
            right: 20px;
            color: rgba(255,255,255,0.2);
            text-decoration: none;
            font-size: 0.8rem;
            transition: opacity 0.3s;
        }
        .admin-link:hover { opacity: 1; }

        .link-item {
            background: rgba(0,0,0,0.2);
            margin-bottom: 10px;
            padding: 15px;
            border-radius: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 1px solid transparent;
            transition: border-color 0.2s;
        }
        .link-item:hover { border-color: var(--glass-border); }
        
        .link-detail { text-align: left; overflow: hidden; }
        .slug-txt { color: var(--accent); font-weight: bold; font-family: monospace; }
        .url-txt { color: var(--text-secondary); font-size: 0.8rem; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
        
        .btn-del {
            width: auto;
            background: rgba(239, 68, 68, 0.2);
            color: var(--danger);
            padding: 8px 12px;
            font-size: 0.8rem;
            box-shadow: none;
        }
        .btn-del:hover { background: var(--danger); color: white; }

        .error-msg { color: var(--danger); font-size: 0.9rem; margin-top: 1rem; }
        
        /* Loading Spinner */
        .spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .hidden { display: none !important; }
    </style>
</head>
<body>

    <div class="container" id="app">
        <!-- 公开页面 -->
        <div id="view-public">
            <h1>Mini Link</h1>
            <div class="input-wrapper">
                <input type="url" id="longUrl" placeholder="在此粘贴长链接 (https://...)" required autocomplete="off">
            </div>
            <button onclick="createLink()" id="createBtn">生成短链</button>
            <div id="publicError" class="error-msg"></div>
            
            <div id="result">
                <div class="result-label">您的短链接已生成</div>
                <div class="short-url" id="shortUrlDisplay"></div>
                <button class="btn-copy" onclick="copyResult()">复制链接</button>
            </div>
        </div>

        <!-- 登录弹窗 -->
        <div id="view-login" class="hidden">
            <h1>管理员验证</h1>
            <p style="color:var(--text-secondary); margin-bottom:1.5rem">请输入 Secret Token 访问管理后台</p>
            <div class="input-wrapper">
                <input type="password" id="secretToken" placeholder="Secret Token">
            </div>
            <button onclick="saveToken()">进入后台</button>
            <button onclick="showPublic()" style="margin-top:10px; background:transparent; color:var(--text-secondary); box-shadow:none">返回首页</button>
        </div>

        <!-- 管理后台 -->
        <div id="view-admin" class="hidden">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem">
                <h1 style="margin:0; font-size:1.5rem">链接管理</h1>
                <button onclick="logout()" style="width:auto; padding:8px 16px; background:rgba(255,255,255,0.1); font-size:0.8rem; box-shadow:none">退出</button>
            </div>

            <!-- 创建 -->
            <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:12px; margin-bottom:2rem">
                <div style="display:flex; gap:10px; margin-bottom:10px">
                    <input type="text" id="adminSlug" placeholder="自定义短码 (可选)" style="width:40%">
                    <input type="url" id="adminUrl" placeholder="长链接地址" style="flex:1">
                </div>
                <button onclick="adminCreateLink()">创建自定义链接</button>
            </div>

            <!-- 列表 -->
            <div id="linkList" style="max-height:400px; overflow-y:auto; padding-right:5px"></div>
            <button id="loadMoreBtn" class="hidden" onclick="loadMore()" style="margin-top:15px; background:rgba(255,255,255,0.1); box-shadow:none">加载更多</button>
        </div>
    </div>

    <a href="#admin" class="admin-link">Admin Access</a>

    <script>
        const API_BASE = window.location.origin;
        let nextCursor = null;

        // 路由逻辑
        function handleRoute() {
            const hash = window.location.hash;
            if (hash === '#admin') {
                const token = localStorage.getItem('minilink_token');
                token ? showAdmin() : showLogin();
            } else {
                showPublic();
            }
        }
        window.addEventListener('hashchange', handleRoute);
        window.addEventListener('load', handleRoute);

        // 视图切换
        function showPublic() {
            toggle('view-public');
        }
        function showLogin() {
            toggle('view-login');
        }
        function showAdmin() {
            toggle('view-admin');
            loadLinks(true);
        }
        function toggle(id) {
            ['view-public', 'view-login', 'view-admin'].forEach(v => {
                const el = document.getElementById(v);
                if (v === id) {
                    el.classList.remove('hidden');
                    // 动画重置
                    el.style.animation = 'none';
                    el.offsetHeight; /* trigger reflow */
                    el.style.animation = 'slideUp 0.4s ease-out';
                } else {
                    el.classList.add('hidden');
                }
            });
        }

        // 鉴权
        function saveToken() {
            const t = document.getElementById('secretToken').value;
            if(!t) return alert('请输入 Token');
            localStorage.setItem('minilink_token', t);
            showAdmin();
        }
        function logout() {
            localStorage.removeItem('minilink_token');
            window.location.hash = '';
        }

        // 核心功能
        async function createLink() {
            const urlIn = document.getElementById('longUrl');
            const btn = document.getElementById('createBtn');
            const err = document.getElementById('publicError');
            const resBox = document.getElementById('result');

            if (!urlIn.value) return;

            // 简单的URL校验
            if (!urlIn.value.startsWith('http')) {
                err.innerText = '链接必须以 http 或 https 开头';
                return;
            }

            btn.disabled = true;
            btn.innerHTML = '<div class="spinner"></div>';
            err.innerText = '';
            resBox.style.display = 'none';

            try {
                const res = await fetch('/api/create', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ url: urlIn.value })
                });
                const data = await res.json();
                
                if (!res.ok) throw new Error(data.error || '生成失败，请重试');

                document.getElementById('shortUrlDisplay').innerText = \`\${API_BASE}/\${data.slug}\`;
                resBox.style.display = 'block';
                urlIn.value = '';
            } catch (e) {
                err.innerText = e.message;
            } finally {
                btn.disabled = false;
                btn.innerText = '生成短链';
            }
        }

        async function adminCreateLink() {
            const url = document.getElementById('adminUrl').value;
            const slug = document.getElementById('adminSlug').value;
            const token = localStorage.getItem('minilink_token');

            if(!url) return alert('请输入链接');

            try {
                const res = await fetch('/api/create', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': token 
                    },
                    body: JSON.stringify({ url, customSlug: slug })
                });
                if(!res.ok) {
                    const d = await res.json();
                    throw new Error(d.error);
                }
                alert('创建成功');
                document.getElementById('adminUrl').value = '';
                document.getElementById('adminSlug').value = '';
                loadLinks(true);
            } catch(e) {
                alert(e.message);
            }
        }

        async function loadLinks(reset) {
            if(reset) {
                document.getElementById('linkList').innerHTML = '';
                nextCursor = null;
            }
            const token = localStorage.getItem('minilink_token');
            let url = \`/api/list\${nextCursor ? '?cursor='+nextCursor : ''}\`;
            
            try {
                const res = await fetch(url, { headers: {'Authorization': token} });
                if(res.status === 401) { logout(); return; }
                const data = await res.json();
                
                nextCursor = data.list_complete ? null : data.cursor;
                document.getElementById('loadMoreBtn').className = nextCursor ? '' : 'hidden';

                const list = document.getElementById('linkList');
                data.links.forEach(l => {
                    const date = new Date(l.createdAt).toLocaleDateString();
                    const div = document.createElement('div');
                    div.className = 'link-item';
                    div.innerHTML = \`
                        <div class="link-detail">
                            <a href="/\${l.slug}" target="_blank" class="slug-txt">/\${l.slug}</a>
                            <span class="url-txt" title="\${l.url}">\${l.url}</span>
                        </div>
                        <button class="btn-del" onclick="deleteLink('\${l.slug}')">删除</button>
                    \`;
                    list.appendChild(div);
                });
            } catch(e) {
                console.error(e);
            }
        }

        async function deleteLink(slug) {
            if(!confirm(\`确定删除 /\${slug} 吗？\`)) return;
            const token = localStorage.getItem('minilink_token');
            await fetch('/api/delete', {
                method:'DELETE', 
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':token
                },
                body: JSON.stringify({slug})
            });
            loadLinks(true);
        }

        function copyResult() {
            const txt = document.getElementById('shortUrlDisplay').innerText;
            navigator.clipboard.writeText(txt).then(() => {
                const btn = document.querySelector('.btn-copy');
                const origin = btn.innerText;
                btn.innerText = '已复制!';
                btn.style.background = '#10b981';
                setTimeout(() => {
                    btn.innerText = origin;
                    btn.style.background = '';
                }, 2000);
            });
        }
    </script>
</body>
</html>`;
}
