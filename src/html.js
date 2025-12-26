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
            max-width: 550px; /* 稍微加宽以适应管理界面 */
            background: var(--glass-bg);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid var(--glass-border);
            border-radius: 24px;
            padding: 2.5rem;
            box-shadow: 0 30px 60px rgba(0,0,0,0.3);
            text-align: center;
            transition: all 0.3s ease;
        }

        h1 {
            margin: 0 0 2rem 0;
            font-weight: 700;
            letter-spacing: -0.05em;
            font-size: 1.8rem;
            background: linear-gradient(to right, #fff, #94a3b8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .input-wrapper { position: relative; margin-bottom: 1.5rem; }
        
        input {
            width: 100%;
            padding: 14px 18px;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--glass-border);
            color: white;
            border-radius: 12px;
            font-size: 0.95rem;
            outline: none;
            transition: all 0.3s;
        }
        input:focus {
            border-color: var(--accent);
            background: rgba(0, 0, 0, 0.4);
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        button {
            width: 100%;
            padding: 14px;
            background: var(--accent);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        button:hover {
            background: var(--accent-hover);
            transform: translateY(-1px);
        }
        button:disabled { opacity: 0.7; cursor: wait; }

        /* 管理界面特有 */
        .admin-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            border-bottom: 1px solid var(--glass-border);
            padding-bottom: 1rem;
        }
        
        .admin-toolbar {
            display: flex;
            gap: 10px;
            margin-bottom: 1rem;
        }

        .link-item {
            background: rgba(255,255,255,0.03);
            margin-bottom: 8px;
            padding: 12px;
            border-radius: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 1px solid transparent;
            transition: all 0.2s;
        }
        .link-item:hover { 
            background: rgba(255,255,255,0.05);
            border-color: rgba(255,255,255,0.1); 
        }
        
        .link-detail { text-align: left; overflow: hidden; flex: 1; margin-right: 10px; }
        .slug-txt { color: var(--accent); font-weight: bold; font-family: monospace; font-size: 1.1em; display: inline-block; margin-right: 8px; }
        .date-txt { font-size: 0.75rem; color: #64748b; }
        .url-txt { color: var(--text-secondary); font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; margin-top: 4px; }
        
        .btn-sm { width: auto; padding: 6px 12px; font-size: 0.8rem; box-shadow: none; }
        .btn-danger { background: rgba(239, 68, 68, 0.2); color: var(--danger); }
        .btn-danger:hover { background: var(--danger); color: white; }
        .btn-outline { background: transparent; border: 1px solid var(--glass-border); color: var(--text-secondary); }
        .btn-outline:hover { border-color: var(--text-primary); color: var(--text-primary); background: rgba(255,255,255,0.05); }

        #result {
            display: none;
            margin-top: 1.5rem;
            padding: 1rem;
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 12px;
            color: #10b981;
        }
        .short-url { font-size: 1.2rem; font-weight: bold; margin: 0.5rem 0; word-break: break-all; }

        .hidden { display: none !important; }
        .error { color: var(--danger); font-size: 0.9rem; margin-top: 10px; min-height: 1.2em; }
        
        .ghost-trigger { 
            position: fixed; 
            top: 0; 
            right: 0; 
            width: 50px; 
            height: 50px; 
            z-index: 9999;
            cursor: default; /* Keep cursor default to hide it better, or pointer if user wants hint */
            /* background: rgba(255,0,0,0.1); Debugging */
        }
    </style>
</head>
<body>

    <a href="javascript:checkAdmin()" class="ghost-trigger" title="Admin"></a>

    <div class="container" id="app">
        <!-- 页面: 首页 -->
        <div id="view-home">
            <h1>Mini Link</h1>
            <div class="input-wrapper">
                <input type="url" id="longUrl" placeholder="在此粘贴长链接 (https://...)" autocomplete="off">
            </div>
            <button onclick="createShortLink()" id="createBtn">一键生成</button>
            <div class="error" id="homeError"></div>
            
            <div id="result">
                <div>短链接已生成</div>
                <div class="short-url" id="shortUrlDisplay"></div>
                <button class="btn-sm" style="background: #10b981; margin-top:5px" onclick="copyResult()">复制</button>
            </div>
        </div>

        <!-- 页面: 登录 -->
        <div id="view-login" class="hidden">
            <h1>管理员登录</h1>
            <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:1.5rem">请输入您的 Secret Token</p>
            <div class="input-wrapper">
                <input type="password" id="tokenInput" placeholder="Password">
            </div>
            <button onclick="tryLogin()" id="loginBtn">验证并登录</button>
            <div class="error" id="loginError"></div>
            <button class="btn-outline" style="margin-top:15px" onclick="setView('home')">返回首页</button>
        </div>

        <!-- 页面: 管理后台 -->
        <div id="view-admin" class="hidden">
            <div class="admin-header">
                <div>
                    <h2 style="margin:0; font-size:1.2rem">后台管理</h2>
                    <span id="totalCount" style="font-size:0.8rem; color:var(--text-secondary)">加载中...</span>
                </div>
                <div style="display:flex; gap:8px">
                     <button class="btn-sm btn-danger" onclick="clearAllLinks()">清空所有</button>
                     <button class="btn-sm btn-outline" onclick="doLogout()">退出</button>
                </div>
            </div>

            <!-- 工具栏: 创建 + 搜索 -->
            <div class="admin-toolbar">
                <input type="text" id="searchInput" placeholder="搜索 URL 或短码..." oninput="filterLinks()" style="flex:1">
            </div>
            
            <div style="background:rgba(255,255,255,0.03); padding:10px; border-radius:10px; margin-bottom:15px; display:flex; gap:8px">
                 <input type="text" id="adminSlug" placeholder="自定义短码" style="width:30%">
                 <input type="text" id="adminUrl" placeholder="长链接" style="flex:1">
                 <button class="btn-sm" style="width:auto" onclick="adminCreate()">创建</button>
            </div>

            <div id="linkListWrapper" style="max-height: 400px; overflow-y: auto;">
                <!-- 列表容器 -->
                <div id="linkList"></div>
            </div>
            
            <!-- 简单的加载更多指示器 -->
            <div id="loadingMore" class="hidden" style="color:var(--text-secondary); font-size:0.8rem; margin-top:10px">加载中...</div>
        </div>
    </div>
    
    <script>
        // --- 状态管理 ---
        const state = {
            token: localStorage.getItem('minilink_token'),
            links: [], // 本地缓存列表用于搜索
            cursor: null,
            isLoading: false
        };

        // --- 初始化 ---
        window.addEventListener('load', () => {
            // 如果 URL 带 #admin，尝试进后台
            if (window.location.hash === '#admin') checkAdmin();
            else setView('home');
        });

        // 监听 URL 变化 (后退/前进/手动修改)
        window.addEventListener('hashchange', () => {
             if (window.location.hash === '#admin') checkAdmin();
             else setView('home');
        });
        
        // 某些浏览器(如Chrome)在地址栏直接改hash回车可能只触发 popstate
        window.addEventListener('popstate', () => {
             if (window.location.hash === '#admin') checkAdmin();
             else setView('home');
        });

        // --- 路由/视图切换 ---
        function setView(viewName) {
            ['home', 'login', 'admin'].forEach(v => {
                document.getElementById('view-'+v).classList.add('hidden');
            });
            document.getElementById('view-'+viewName).classList.remove('hidden');
            
            // 清理错误信息
            document.getElementById('loginError').innerText = '';
            document.getElementById('homeError').innerText = '';
        }

        async function checkAdmin() {
            if (!state.token) {
                setView('login');
            } else {
                // 有 Token，尝试验证一下有效性
                // 通过加载第一页数据来验证
                setView('login'); // 先显示登录页作为加载状态，或者直接转圈
                document.getElementById('loginBtn').innerText = '验证中...';
                document.getElementById('loginBtn').disabled = true;
                
                try {
                    await fetchLinks(true); // 尝试加载
                    setView('admin');
                } catch (e) {
                    console.error('Auth failed', e);
                    logout(); // Token 无效，清除并停留在登录页
                    document.getElementById('loginError').innerText = '登录已过期或密码错误';
                } finally {
                    document.getElementById('loginBtn').innerText = '验证并登录';
                    document.getElementById('loginBtn').disabled = false;
                }
            }
        }

        function doLogout() {
            logout();
            setView('home');
        }
        
        function logout() {
            state.token = null;
            localStorage.removeItem('minilink_token');
            state.links = [];
        }

        // --- 业务逻辑: 登录 ---
        async function tryLogin() {
            const input = document.getElementById('tokenInput');
            const val = input.value.trim();
            if (!val) return;

            // 临时保存，尝试请求
            state.token = val;
            
            const btn = document.getElementById('loginBtn');
            btn.innerText = '验证中...';
            btn.disabled = true;

            try {
                await fetchLinks(true); // 验证
                localStorage.setItem('minilink_token', val); // 验证通过才持久化
                setView('admin');
                input.value = '';
            } catch (e) {
                state.token = null;
                document.getElementById('loginError').innerText = '密码错误';
            } finally {
                btn.innerText = '验证并登录';
                btn.disabled = false;
            }
        }

        // --- 业务逻辑: 获取列表 ---
        async function fetchLinks(reset = false) {
            if (reset) {
                state.links = [];
                state.cursor = null;
                document.getElementById('linkList').innerHTML = '';
            }
            
            const url = \`/api/list\${state.cursor ? '?cursor='+state.cursor : ''}\`;
            const res = await fetch(url, {
                headers: { 'Authorization': state.token }
            });
            
            if (res.status === 401) throw new Error('Unauthorized');
            if (!res.ok) throw new Error('Network Error');
            
            const data = await res.json();
            
            // 合并数据
            state.links = [...state.links, ...data.links];
            state.cursor = data.list_complete ? null : data.cursor;
            
            renderList(state.links);
            document.getElementById('totalCount').innerText = \`共 \${state.links.length} 条\`;
            
            // 如果还有更多数据，自动继续加载（为了搜索功能，我们尽量加载多一点，或者做分页加载）
            // 这里简化为：每次只加载一页，用户滚动到底部加载更多（暂未实现无限滚动，用按钮代替或简单的自动加载）
            // 为了搜索体验，我们这里简单地如果数量少于 100 且还有 cursor 就自动加载下一页
            if (state.links.length < 100 && state.cursor) {
                fetchLinks(); 
            }
        }

        function renderList(links) {
            const container = document.getElementById('linkList');
            container.innerHTML = links.map(link => \`
                <div class="link-item">
                    <div class="link-detail">
                        <div>
                            <a href="/\${link.slug}" target="_blank" class="slug-txt">/\${link.slug}</a>
                            <span class="date-txt">\${new Date(link.createdAt).toLocaleDateString()}</span>
                        </div>
                        <a href="\${link.url}" target="_blank" class="url-txt">\${link.url}</a>
                    </div>
                    <button class="btn-sm btn-danger" onclick="deleteLink('\${link.slug}')">删除</button>
                </div>
            \`).join('');
        }

        // --- 业务逻辑: 搜索/过滤 ---
        function filterLinks() {
            const key = document.getElementById('searchInput').value.toLowerCase();
            if (!key) {
                renderList(state.links);
                return;
            }
            const filtered = state.links.filter(l => 
                l.slug.toLowerCase().includes(key) || 
                (l.url && l.url.toLowerCase().includes(key))
            );
            renderList(filtered);
        }

        // --- 业务逻辑: 删除 & 清空 & 创建 ---
        
        async function deleteLink(slug) {
            if (!confirm('确定删除吗？')) return;
            await fetch('/api/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': state.token },
                body: JSON.stringify({ slug })
            });
            // 本地移除
            state.links = state.links.filter(l => l.slug !== slug);
            filterLinks(); // 重新渲染
        }

        async function clearAllLinks() {
            const confirmStr = prompt("警告：这将删除所有短链接！此操作不可恢复。\\n请输入 'CONFIRM' 确认清空：");
            if (confirmStr !== 'CONFIRM') return;

            const res = await fetch('/api/clear', {
                method: 'DELETE',
                headers: { 'Authorization': state.token }
            });
            
            if (res.ok) {
                alert('已全部清空');
                fetchLinks(true);
            } else {
                alert('操作失败');
            }
        }

        async function adminCreate() {
            const url = document.getElementById('adminUrl').value;
            const slug = document.getElementById('adminSlug').value;
            if(!url) return alert('URL 不能为空');
            
            const res = await fetch('/api/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': state.token },
                body: JSON.stringify({ url, customSlug: slug })
            });
            
            if(!res.ok) {
                const d = await res.json();
                return alert(d.error);
            }
            
            // 成功，清空输入框并刷新
            document.getElementById('adminUrl').value = '';
            document.getElementById('adminSlug').value = '';
            fetchLinks(true); // 重新加载列表
        }

        // --- 首页逻辑 ---
        async function createShortLink() {
            const urlIn = document.getElementById('longUrl');
            if(!urlIn.value) return;
            
            const btn = document.getElementById('createBtn');
            btn.innerText = '生成中...';
            btn.disabled = true;
            
            try {
                const res = await fetch('/api/create', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ url: urlIn.value })
                });
                const data = await res.json();
                if(!res.ok) throw new Error(data.error || '失败');
                
                document.getElementById('shortUrlDisplay').innerText = window.location.origin + '/' + data.slug;
                document.getElementById('result').style.display = 'block';
                document.getElementById('homeError').innerText = '';
            } catch(e) {
                document.getElementById('homeError').innerText = e.message;
            } finally {
                btn.innerText = '一键生成';
                btn.disabled = false;
            }
        }

        function copyResult() {
            const txt = document.getElementById('shortUrlDisplay').innerText;
            navigator.clipboard.writeText(txt);
            alert('已复制');
        }

    </script>
</body>
</html>`;
}
