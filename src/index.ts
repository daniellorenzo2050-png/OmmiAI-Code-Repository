export interface Env {
  AI: any;
  OMMI_KEYS: KVNamespace;
  DB: D1Database;
}

// Função utilitária para hash SHA-512 no Web Crypto API (Edge)
async function hashPassword(password: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-512", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Inicialização automática das tabelas do D1 se não existirem
    try {
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE,
          password_hash TEXT,
          api_key TEXT,
          created_at INTEGER
        );
      `).run();

      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS conversations (
          id TEXT PRIMARY KEY,
          username TEXT,
          title TEXT,
          messages TEXT,
          updated_at INTEGER
        );
      `).run();
    } catch (e) {
      // Tabelas já existem ou erro de inicialização silencioso
    }

    // -----------------------------------------------------------------
    // API: REGISTRO DE CONTA (/api/signup)
    // -----------------------------------------------------------------
    if (path === "/api/signup" && request.method === "POST") {
      try {
        const { username, password } = await request.json() as any;
        if (!username || !password) {
          return new Response(JSON.stringify({ error: "Usuário e senha são obrigatórios." }), { status: 400, headers: { "Content-Type": "application/json" } });
        }
        const pwdHash = await hashPassword(password);
        await env.DB.prepare(`INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)`).bind(username, pwdHash, Date.now()).run();
        return new Response(JSON.stringify({ success: true, message: "Conta criada com sucesso!" }), { headers: { "Content-Type": "application/json" } });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: "Nome de usuário já existe ou erro interno." }), { status: 400, headers: { "Content-Type": "application/json" } });
      }
    }

    // -----------------------------------------------------------------
    // API: LOGIN (/api/login)
    // -----------------------------------------------------------------
    if (path === "/api/login" && request.method === "POST") {
      try {
        const { username, password } = await request.json() as any;
        const pwdHash = await hashPassword(password);
        const user = await env.DB.prepare(`SELECT * FROM users WHERE username = ? AND password_hash = ?`).bind(username, pwdHash).first();
        
        if (!user) {
          return new Response(JSON.stringify({ error: "Credenciais inválidas." }), { status: 401, headers: { "Content-Type": "application/json" } });
        }

        return new Response(JSON.stringify({ success: true, username: user.username }), { headers: { "Content-Type": "application/json" } });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // -----------------------------------------------------------------
    // API: GERAR OU RECUPERAR A ÚNICA API KEY DA CONTA (D1 + KV) (/getapikey/)
    // -----------------------------------------------------------------
    if (path.startsWith("/getapikey")) {
      const urlParams = new URLSearchParams(url.search);
      const username = urlParams.get("username");

      if (!username) {
        return new Response(JSON.stringify({ error: "Usuário não especificado." }), { status: 400, headers: { "Content-Type": "application/json" } });
      }

      // Verifica se o usuário já tem uma API Key salva no D1
      const userRecord: any = await env.DB.prepare(`SELECT api_key FROM users WHERE username = ?`).bind(username).first();
      
      let apiKey = userRecord?.api_key;

      if (!apiKey) {
        // Se não tiver, gera uma nova chave única para este usuário
        apiKey = "ommi_live_" + crypto.randomUUID().replace(/-/g, "");
        
        // Salva no D1
        await env.DB.prepare(`UPDATE users SET api_key = ? WHERE username = ?`).bind(apiKey, username).run();
        
        // Salva no KV
        if (env.OMMI_KEYS) {
          await env.OMMI_KEYS.put(apiKey, JSON.stringify({ username, created_at: Date.now() }));
        }
      }

      return new Response(JSON.stringify({
        status: "success",
        message: "Chave de API única da conta recuperada com sucesso.",
        api_key: apiKey,
        owner: username
      }, null, 2), {
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    }

    // -----------------------------------------------------------------
    // API: SALVAR/SINCRONIZAR CONVERSAS (/api/conversations)
    // -----------------------------------------------------------------
    if (path === "/api/conversations") {
      if (request.method === "POST") {
        const data = await request.json() as any;
        await env.DB.prepare(`
          INSERT INTO conversations (id, username, title, messages, updated_at) 
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET title=excluded.title, messages=excluded.messages, updated_at=excluded.updated_at
        `).bind(data.id, data.username, data.title, JSON.stringify(data.messages), Date.now()).run();
        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
      }
      if (request.method === "GET") {
        const username = url.searchParams.get("username");
        const { results } = await env.DB.prepare(`SELECT * FROM conversations WHERE username = ? ORDER BY updated_at DESC`).bind(username).all();
        return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
      }
    }

    // -----------------------------------------------------------------
    // API DE INFERÊNCIA IA: /multi e /laser
    // -----------------------------------------------------------------
    if (path.includes("/multi") || path.includes("/laser")) {
      const isLaser = path.includes("/laser");
      const modelId = "@cf/google/gemma-7b-it-lora";
      const systemPrompt = isLaser 
        ? "Você é a OmmiAI Laser, otimizada para alta velocidade e exatidão analítica." 
        : "Você é a OmmiAI Multi, otimizada para multimodalidade, criatividade e versatilidade geral.";

      try {
        const body: any = await request.json();
        const userMessage = body.prompt || body.message;

        const aiResponse = await env.AI.run(modelId, {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
        });

        return new Response(JSON.stringify({
          gateway: "OmmiAI",
          model_variant: isLaser ? "OmmiAI Laser" : "OmmiAI Multi",
          result: aiResponse
        }), {
          headers: { "Content-Type": "application/json; charset=utf-8" }
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // -----------------------------------------------------------------
    // ROTA RAIZ (/): Interface Web Completa (Tailwind + FontAwesome + IDB)
    // -----------------------------------------------------------------
    const html = `<!DOCTYPE html>
    <html lang="pt-BR" class="h-full bg-slate-950">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OmmiAI - Intelligent Gateway</title>
        <!-- Tailwind CSS -->
        <script src="https://cdn.tailwindcss.com"></script>
        <!-- Font Awesome -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </head>
    <body class="h-full text-slate-100 flex flex-col overflow-hidden">

        <!-- AUTH MODAL -->
        <div id="auth-modal" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div class="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
                <div class="text-center mb-6">
                    <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 mb-3 text-xl font-bold">
                        <i class="fa-solid fa-brain"></i>
                    </div>
                    <h2 class="text-2xl font-bold tracking-tight">Bem-vindo à OmmiAI</h2>
                    <p class="text-sm text-slate-400 mt-1">Faça login ou crie sua conta para continuar</p>
                </div>

                <div class="flex bg-slate-800 p-1 rounded-xl mb-6">
                    <button onclick="switchAuthTab('login')" id="tab-login" class="flex-1 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white transition">Entrar</button>
                    <button onclick="switchAuthTab('signup')" id="tab-signup" class="flex-1 py-2 text-sm font-semibold rounded-lg text-slate-400 hover:text-white transition">Criar Conta</button>
                </div>

                <div class="space-y-4">
                    <div>
                        <label class="block text-xs font-medium text-slate-400 mb-1">Usuário</label>
                        <input type="text" id="auth-user" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" placeholder="Seu nome de usuário">
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-slate-400 mb-1">Senha (Protegida com SHA-512)</label>
                        <input type="password" id="auth-pass" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" placeholder="••••••••">
                    </div>
                    <div id="auth-error" class="text-rose-400 text-xs hidden"></div>
                    <button onclick="handleAuth()" id="auth-btn" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-blue-600/20">Entrar</button>
                </div>
            </div>
        </div>

        <!-- APP CONTAINER -->
        <div id="app-container" class="flex h-full w-full hidden">
            <!-- Sidebar -->
            <div id="sidebar" class="w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 z-20 md:relative absolute inset-y-0 left-0 -translate-x-full md:translate-x-0">
                <div class="p-4 border-b border-slate-800 flex items-center justify-between">
                    <div class="flex items-center gap-2 font-bold text-lg text-blue-400">
                        <i class="fa-solid fa-brain"></i> OmmiAI
                    </div>
                    <button onclick="toggleSidebar()" class="md:hidden text-slate-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <div class="p-3">
                    <button onclick="createNewConversation()" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-md shadow-blue-600/20">
                        <i class="fa-solid fa-plus"></i> Nova Conversa
                    </button>
                </div>

                <div id="conversations-list" class="flex-1 overflow-y-auto px-3 space-y-1 py-2">
                    <!-- Dinâmico -->
                </div>

                <div class="p-4 border-t border-slate-800 flex items-center justify-between text-sm">
                    <div class="flex items-center gap-2 truncate">
                        <i class="fa-solid fa-circle-user text-slate-400 text-lg"></i>
                        <span id="current-username-display" class="truncate font-medium">User</span>
                    </div>
                    <button onclick="getApiKey()" title="Ver minha API Key única" class="text-slate-400 hover:text-blue-400 transition p-2"><i class="fa-solid fa-key"></i></button>
                    <button onclick="logout()" title="Sair" class="text-slate-400 hover:text-rose-400 transition p-2"><i class="fa-solid fa-right-from-bracket"></i></button>
                </div>
            </div>

            <!-- Main Chat Area -->
            <div class="flex-1 flex flex-col h-full bg-slate-950 relative">
                <!-- Topbar -->
                <div class="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur px-4 flex items-center justify-between z-10">
                    <div class="flex items-center gap-3">
                        <button onclick="toggleSidebar()" class="text-slate-400 hover:text-white md:hidden"><i class="fa-solid fa-bars text-lg"></i></button>
                        <div class="flex bg-slate-800 p-1 rounded-xl">
                            <button onclick="setMode('multi')" id="btn-multi" class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white transition">OmmiAI Multi</button>
                            <button onclick="setMode('laser')" id="btn-laser" class="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-400 hover:text-white transition">OmmiAI Laser</button>
                        </div>
                    </div>
                    <div class="text-xs text-slate-400 hidden sm:block">Cloudflare Workers AI + D1 + IndexedDB</div>
                </div>

                <!-- Messages Box -->
                <div id="chat-messages" class="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                    <div class="flex gap-4 max-w-3xl mx-auto items-start">
                        <div class="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0"><i class="fa-solid fa-brain"></i></div>
                        <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-slate-200 text-sm leading-relaxed shadow-sm">
                            Olá! Sou a sua assistente **OmmiAI**. Como posso ajudar você hoje? Suas conversas estão sendo sincronizadas automaticamente com o D1 e o IndexedDB.
                        </div>
                    </div>
                </div>

                <!-- Input Area -->
                <div class="p-4 border-t border-slate-800 bg-slate-900/30">
                    <div class="max-w-3xl mx-auto flex gap-3">
                        <input type="text" id="user-input" onkeypress="handleKeyPress(event)" placeholder="Digite sua mensagem para a OmmiAI..." class="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-blue-500 shadow-inner">
                        <button onclick="sendMessage()" class="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-2xl font-semibold transition shadow-lg shadow-blue-600/20 flex items-center justify-center">
                            <i class="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- SCRIPT CLIENTE -->
        <script>
            let authMode = 'login';
            let currentUser = localStorage.getItem('ommi_user') || null;
            let currentMode = 'multi';
            let currentConvId = null;
            let conversations = [];

            let dbIDB = null;
            const idbRequest = indexedDB.open("OmmiAI_LocalDB", 1);
            idbRequest.onupgradeneeded = (e) => {
                dbIDB = e.target.result;
                if (!dbIDB.objectStoreNames.contains("conversations")) {
                    dbIDB.createObjectStore("conversations", { keyPath: "id" });
                }
            };
            idbRequest.onsuccess = (e) => {
                dbIDB = e.target.result;
                loadConversations();
            };

            if (currentUser) {
                document.getElementById('auth-modal').classList.add('hidden');
                document.getElementById('app-container').classList.remove('hidden');
                document.getElementById('current-username-display').innerText = currentUser;
            }

            function switchAuthTab(mode) {
                authMode = mode;
                document.getElementById('tab-login').className = mode === 'login' ? 'flex-1 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white transition' : 'flex-1 py-2 text-sm font-semibold rounded-lg text-slate-400 hover:text-white transition';
                document.getElementById('tab-signup').className = mode === 'signup' ? 'flex-1 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white transition' : 'flex-1 py-2 text-sm font-semibold rounded-lg text-slate-400 hover:text-white transition';
                document.getElementById('auth-btn').innerText = mode === 'login' ? 'Entrar' : 'Criar Conta';
            }

            async function handleAuth() {
                const username = document.getElementById('auth-user').value.trim();
                const password = document.getElementById('auth-pass').value.trim();
                const errEl = document.getElementById('auth-error');
                if (!username || !password) {
                    errEl.innerText = "Preencha todos os campos.";
                    errEl.classList.remove('hidden');
                    return;
                }

                const endpoint = authMode === 'login' ? '/api/login' : '/api/signup';
                try {
                    const res = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });
                    const data = await res.json();
                    if (res.ok) {
                        if (authMode === 'signup') {
                            alert("Conta criada com sucesso! Faça login.");
                            switchAuthTab('login');
                        } else {
                            currentUser = data.username;
                            localStorage.setItem('ommi_user', currentUser);
                            document.getElementById('auth-modal').classList.add('hidden');
                            document.getElementById('app-container').classList.remove('hidden');
                            document.getElementById('current-username-display').innerText = currentUser;
                            loadConversations();
                        }
                    } else {
                        errEl.innerText = data.error || "Erro na autenticação.";
                        errEl.classList.remove('hidden');
                    }
                } catch(e) {
                    errEl.innerText = "Erro de conexão com o servidor.";
                    errEl.classList.remove('hidden');
                }
            }

            function logout() {
                localStorage.removeItem('ommi_user');
                location.reload();
            }

            function toggleSidebar() {
                const sb = document.getElementById('sidebar');
                sb.classList.toggle('-translate-x-full');
            }

            function setMode(mode) {
                currentMode = mode;
                document.getElementById('btn-multi').className = mode === 'multi' ? 'px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white transition' : 'px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-400 hover:text-white transition';
                document.getElementById('btn-laser').className = mode === 'laser' ? 'px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white transition' : 'px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-400 hover:text-white transition';
            }

            async function saveCurrentConversation(title, messages) {
                if (!currentConvId) {
                    currentConvId = 'conv_' + Date.now();
                    title = title || 'Nova Conversa';
                }
                const convData = { id: currentConvId, username: currentUser, title, messages, updated_at: Date.now() };

                if (dbIDB) {
                    const tx = dbIDB.transaction("conversations", "readwrite");
                    tx.objectStore("conversations").put(convData);
                }

                await fetch('/api/conversations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(convData)
                });

                loadConversations();
            }

            async function loadConversations() {
                try {
                    const res = await fetch('/api/conversations?username=' + currentUser);
                    conversations = await res.json();
                    renderConversationsList();
                    if (conversations.length > 0 && !currentConvId) {
                        selectConversation(conversations[0].id);
                    } else if (conversations.length === 0) {
                        createNewConversation();
                    }
                } catch(e) {
                    if (dbIDB) {
                        const tx = dbIDB.transaction("conversations", "readonly");
                        const req = tx.objectStore("conversations").getAll();
                        req.onsuccess = () => {
                            conversations = req.result.filter(c => c.username === currentUser);
                            renderConversationsList();
                        }
                    }
                }
            }

            function renderConversationsList() {
                const listEl = document.getElementById('conversations-list');
                listEl.innerHTML = '';
                conversations.forEach(c => {
                    const active = c.id === currentConvId ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200';
                    listEl.innerHTML += \`<div onclick="selectConversation('\${c.id}')" class="w-full text-left px-3 py-2.5 rounded-xl text-sm cursor-pointer truncate transition \${active}">
                        <i class="fa-regular fa-message mr-2"></i>\${c.title}
                    </div>\`;
                });
            }

            function createNewConversation() {
                currentConvId = 'conv_' + Date.now();
                const newConv = { id: currentConvId, username: currentUser, title: 'Nova Conversa', messages: [], updated_at: Date.now() };
                conversations.unshift(newConv);
                renderConversationsList();
                document.getElementById('chat-messages').innerHTML = \`<div class="flex gap-4 max-w-3xl mx-auto items-start">
                    <div class="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0"><i class="fa-solid fa-brain"></i></div>
                    <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-slate-200 text-sm leading-relaxed shadow-sm">Nova conversa iniciada. Como posso ajudar?</div>
                </div>\`;
            }

            function selectConversation(id) {
                currentConvId = id;
                const conv = conversations.find(c => c.id === id);
                if (!conv) return;
                renderConversationsList();
                const box = document.getElementById('chat-messages');
                box.innerHTML = '';
                if (!conv.messages || conv.messages.length === 0) {
                    box.innerHTML = \`<div class="flex gap-4 max-w-3xl mx-auto items-start">
                        <div class="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0"><i class="fa-solid fa-brain"></i></div>
                        <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-slate-200 text-sm leading-relaxed shadow-sm">Conversa carregada. Como posso ajudar?</div>
                    </div>\`;
                } else {
                    conv.messages.forEach(m => appendMessageUI(m.role, m.content));
                }
            }

            function appendMessageUI(role, content) {
                const box = document.getElementById('chat-messages');
                if (role === 'user') {
                    box.innerHTML += \`<div class="flex gap-4 max-w-3xl mx-auto items-start justify-end">
                        <div class="bg-blue-600 text-white p-4 rounded-2xl text-sm leading-relaxed shadow-sm max-w-[80%]">\${escapeHtml(content)}</div>
                        <div class="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0"><i class="fa-solid fa-user"></i></div>
                    </div>\`;
                } else {
                    box.innerHTML += \`<div class="flex gap-4 max-w-3xl mx-auto items-start">
                        <div class="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0"><i class="fa-solid fa-brain"></i></div>
                        <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-slate-200 text-sm leading-relaxed shadow-sm max-w-[80%]">\${escapeHtml(content)}</div>
                    </div>\`;
                }
                box.scrollTop = box.scrollHeight;
            }

            function handleKeyPress(e) { if (e.key === 'Enter') sendMessage(); }

            async function sendMessage() {
                const input = document.getElementById('user-input');
                const text = input.value.trim();
                if (!text) return;
                input.value = '';

                appendMessageUI('user', text);

                let conv = conversations.find(c => c.id === currentConvId);
                if (!conv) {
                    createNewConversation();
                    conv = conversations.find(c => c.id === currentConvId);
                }
                conv.messages.push({ role: 'user', content: text });
                if (conv.title === 'Nova Conversa') {
                    conv.title = text.substring(0, 25) + '...';
                }

                try {
                    const res = await fetch('/' + currentMode, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt: text })
                    });
                    const data = await res.json();
                    const reply = data.result?.response || data.result || "Sem resposta da IA.";
                    
                    conv.messages.push({ role: 'assistant', content: reply });
                    appendMessageUI('assistant', reply);

                    saveCurrentConversation(conv.title, conv.messages);
                } catch(err) {
                    appendMessageUI('assistant', 'Erro ao processar mensagem.');
                }
            }

            async function getApiKey() {
                const res = await fetch('/getapikey/?username=' + currentUser);
                const data = await res.json();
                alert("Sua única API Key vinculada à conta:\\n\\n" + data.api_key);
            }

            function escapeHtml(text) {
                return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            }
        </script>
    </body>
    </html>`;

    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  },
};
