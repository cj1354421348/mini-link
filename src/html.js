export function renderHtml() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mini Link</title>
    <style>
        :root {
            --bg-color: #0f172a;
            --card-bg: #1e293b;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --accent: #3b82f6;
            --accent-hover: #2563eb;
            --danger: #ef4444;
            --radius: 12px;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-primary);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }
        .container {
            width: 100%;
            max-width: 500px;
            background: var(--card-bg);
            padding: 2rem;
            border-radius: var(--radius);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            text-align: center;
        }
        h1 { margin-bottom: 2rem; font-weight: 800; letter-spacing: -0.025em; }
        
        /* Input Group */
        .input-group { margin-bottom: 1.5rem; text-align: left; }
        label { display: block; color: var(--text-secondary); margin-bottom: 0.5rem; font-size: 0.875rem; }
        input {
            width: 100%;
            padding: 12px 16px;
            background: #020617;
            border: 1px solid #334155;
            color: white;
            border-radius: 8px;
            font-size: 1rem;
            box-sizing: border-box; 
            outline: none;
            transition: border-color 0.2s;
        }
        input:focus { border-color: var(--accent); }

        /* Buttons */
        button {
            width: 100%;
            padding: 12px;
            background: var(--accent);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.1s, background-color 0.2s;
        }
        button:hover { background: var(--accent-hover); }
        button:active { transform: scale(0.98); }
        .btn-small { width: auto; padding: 6px 12px; font-size: 0.8rem; }
        .btn-danger { background: var(--danger); }

        /* Result Area */
        #result { margin-top: 2rem; padding: 1rem; background: #020617; border-radius: 8px; display: none; word-break: break-all; }
        .copy-btn { margin-top: 0.5rem; background: #334155; }

        /* Admin Styles */
        .admin-link { position: fixed; bottom: 20px; right: 20px; color: var(--text-secondary); text-decoration: none; font-size: 0.8rem; opacity: 0.5; }
        .admin-panel { display: none; text-align: left; }
        .link-item { 
            padding: 1rem; 
            border-bottom: 1px solid #334155; 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
        }
        .link-info { overflow: hidden; }
        .link-slug { font-weight: bold; color: var(--accent); display: block; }
        .link-url { color: var(--text-secondary); font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px; display: block; }
        
        /* Utils */
        .hidden { display: none !important; }
        .error { color: var(--danger); margin-top: 1rem; font-size: 0.9rem; }
        
        /* Loading */
        .spinner { display: inline-block; width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: white; animation: spin 1s ease-in-out infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body>

    <div class="container" id="app">
        <!-- 公共视图 -->
        <div id="view-public">
            <h1>Mini Link</h1>
            <div class="input-group">
                <input type="url" id="longUrl" placeholder="Paste a long URL here (https://...)" required>
            </div>
            <button onclick="createLink()" id="createBtn">Shorten URL</button>
            <div id="publicError" class="error"></div>
            
            <div id="result">
                <div style="color: var(--text-secondary); font-size: 0.9rem;">Your short link:</div>
                <div id="shortUrlDisplay" style="color: var(--accent); font-weight: bold; margin: 0.5rem 0;"></div>
                <button class="copy-btn" onclick="copyResult()">Copy</button>
            </div>
        </div>

        <!-- 管理视图 -->
        <div id="view-admin" class="hidden">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 2rem;">
                <h1 style="margin:0">Admin</h1>
                <button class="btn-small" onclick="logout()" style="background:#334155">Logout</button>
            </div>

            <!-- Admin Create -->
            <div class="input-group">
                <label>Admin Create</label>
                <div style="display:flex; gap:10px;">
                    <input type="text" id="adminSlug" placeholder="Custom Slug (Optional)" style="width: 30%">
                    <input type="url" id="adminUrl" placeholder="Long URL" style="flex:1">
                </div>
                <div style="margin-top:10px">
                    <button onclick="adminCreateLink()">Create Custom Link</button>
                </div>
            </div>

            <!-- Link List -->
            <div id="linkList" style="max-height: 400px; overflow-y: auto;">
                <!-- items go here -->
            </div>
            <button id="loadMoreBtn" class="hidden" onclick="loadMore()" style="margin-top:10px; background: #334155">Load More</button>
        </div>
    </div>

    <!-- Admin Login Modal -->
    <div id="loginModal" class="container hidden" style="position:fixed; z-index:100; max-width:400px;">
        <h2>Authentication</h2>
        <input type="password" id="secretToken" placeholder="Enter Secret Token">
        <button onclick="saveToken()" style="margin-top:1rem">Access Admin</button>
    </div>

    <a href="#admin" class="admin-link">Admin</a>

    <script>
        const API_BASE = window.location.origin;
        let nextCursor = null;

        // --- Routing ---
        function handleRoute() {
            const hash = window.location.hash;
            if (hash === '#admin') {
                const token = localStorage.getItem('minilink_token');
                if (!token) {
                    showLogin();
                } else {
                    showAdmin();
                }
            } else {
                showPublic();
            }
        }
        window.addEventListener('hashchange', handleRoute);
        window.addEventListener('load', handleRoute);

        // --- View Logic ---
        function showPublic() {
            document.getElementById('view-public').classList.remove('hidden');
            document.getElementById('view-admin').classList.add('hidden');
            document.getElementById('loginModal').classList.add('hidden');
        }

        function showLogin() {
            document.getElementById('view-public').classList.add('hidden');
            document.getElementById('view-admin').classList.add('hidden');
            document.getElementById('loginModal').classList.remove('hidden');
        }

        function showAdmin() {
            document.getElementById('view-public').classList.add('hidden');
            document.getElementById('view-admin').classList.remove('hidden');
            document.getElementById('loginModal').classList.add('hidden');
            loadLinks(true);
        }

        // --- Auth ---
        function saveToken() {
            const token = document.getElementById('secretToken').value;
            localStorage.setItem('minilink_token', token);
            handleRoute();
        }

        function logout() {
            localStorage.removeItem('minilink_token');
            window.location.hash = '';
        }

        // --- Actions ---

        async function createLink() {
            const url = document.getElementById('longUrl').value;
            const btn = document.getElementById('createBtn');
            const errorDiv = document.getElementById('publicError');
            
            if(!url) return;
            
            btn.innerHTML = '<div class="spinner"></div>';
            btn.disabled = true;
            errorDiv.innerText = '';
            document.getElementById('result').style.display = 'none';

            try {
                const res = await fetch('/api/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url })
                });
                const data = await res.json();
                
                if (!res.ok) throw new Error(data.error || 'Something went wrong');
                
                const shortUrl = \`\${API_BASE}/\${data.slug}\`;
                document.getElementById('shortUrlDisplay').innerText = shortUrl;
                document.getElementById('result').style.display = 'block';
                document.getElementById('longUrl').value = '';
            } catch (e) {
                errorDiv.innerText = e.message;
            } finally {
                btn.innerText = 'Shorten URL';
                btn.disabled = false;
            }
        }

        async function adminCreateLink() {
            const url = document.getElementById('adminUrl').value;
            const customSlug = document.getElementById('adminSlug').value;
            const token = localStorage.getItem('minilink_token');

            if(!url) return alert('URL required');

            try {
                const res = await fetch('/api/create', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': token 
                    },
                    body: JSON.stringify({ url, customSlug })
                });
                if(!res.ok) {
                    const d = await res.json();
                    throw new Error(d.error);
                }
                alert('Created!');
                document.getElementById('adminUrl').value = '';
                document.getElementById('adminSlug').value = '';
                loadLinks(true); // reload list
            } catch(e) {
                alert(e.message);
            }
        }

        async function loadLinks(reset = false) {
            if(reset) {
                 document.getElementById('linkList').innerHTML = '';
                 nextCursor = null;
            }
            
            const token = localStorage.getItem('minilink_token');
            let url = '/api/list';
            if(nextCursor) url += \`?cursor=\${nextCursor}\`;

            const res = await fetch(url, { headers: { 'Authorization': token }});
            if(res.status === 401) {
                logout(); return;
            }
            
            const data = await res.json();
            nextCursor = data.list_complete ? null : data.cursor;
            
            if(nextCursor) document.getElementById('loadMoreBtn').classList.remove('hidden');
            else document.getElementById('loadMoreBtn').classList.add('hidden');

            const container = document.getElementById('linkList');
            data.links.forEach(link => {
                const el = document.createElement('div');
                el.className = 'link-item';
                el.innerHTML = \`
                    <div class="link-info">
                        <a href="/\${link.slug}" target="_blank" class="link-slug">/\${link.slug}</a>
                        <span class="link-url" title="\${link.url}">\${link.url}</span>
                    </div>
                    <button class="btn-small btn-danger" onclick="deleteLink('\${link.slug}')">Del</button>
                \`;
                container.appendChild(el);
            });
        }

        async function deleteLink(slug) {
            if(!confirm('Delete ' + slug + '?')) return;
            const token = localStorage.getItem('minilink_token');
            await fetch('/api/delete', {
                method: 'DELETE',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': token 
                },
                body: JSON.stringify({ slug })
            });
            loadLinks(true);
        }

        function copyResult() {
            const text = document.getElementById('shortUrlDisplay').innerText;
            navigator.clipboard.writeText(text);
            const btn = document.querySelector('.copy-btn');
            btn.innerText = 'Copied!';
            setTimeout(() => btn.innerText = 'Copy', 2000);
        }
    </script>
</body>
</html>`;
}
