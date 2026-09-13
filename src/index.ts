export interface Env {
  AI: any;
  DB: D1Database;
  API_KEYS: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 1. Rota Principal - Chat UI (HTML + Tailwind + SVG)
    if (url.pathname === '/') {
      return new Response(getChatHTML(), { 
        headers: { 'Content-Type': 'text/html;charset=UTF-8' } 
      });
    }

    // 2. Rota para gerar e resgatar a API Key (D1 e KV)
    if (url.pathname.startsWith('/getapikey/')) {
      const user = url.searchParams.get('user');
      if (!user) return new Response(JSON.stringify({ error: "Parâmetro 'user' ausente" }), { status: 400 });

      // Garante que a tabela exista (D1)
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS accounts (
          username TEXT PRIMARY KEY, 
          api_key TEXT, 
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();

      // Busca a API Key no banco D1
      let apiKey = await env.DB.prepare(`SELECT api_key FROM accounts WHERE username = ?`).bind(user).first('api_key');

      // Se a conta não tiver chave, cria a API Key apenas uma vez
      if (!apiKey) {
        apiKey = 'ommi_' + crypto.randomUUID().replace(/-/g, '');
        
        // Salva permanentemente no D1
        await env.DB.prepare(`INSERT INTO accounts (username, api_key) VALUES (?, ?)`).bind(user, apiKey).run();
        
        // Salva no KV para acesso ultrarrápido (cache-like) nas chamadas do /chat
        await env.API_KEYS.put(apiKey, user as string);
      } else {
        // Assegura que está no KV caso tenha expirado ou limpado lá, mas ainda exista no D1
        const kvCheck = await env.API_KEYS.get(apiKey as string);
        if (!kvCheck) await env.API_KEYS.put(apiKey as string, user as string);
      }

      return Response.json({ api_key: apiKey, msg: "Sua chave é secreta e foi guardada com sucesso!" });
    }

    // 3. Rota da IA (Otimizada para Qwen)
    if (url.pathname === '/chat' && request.method === 'POST') {
      const authHeader = request.headers.get('Authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: "Não Autorizado. Chave API Ausente." }), { status: 401 });
      }
      
      const token = authHeader.split(' ')[1];
      
      // Validação em Milissegundos via KV
      const isValidUser = await env.API_KEYS.get(token);
      if (!isValidUser) return new Response(JSON.stringify({ error: "API Key Inválida ou não encontrada no KV." }), { status: 403 });

      try {
        const body: any = await request.json();
        const messages = body.messages || [];

        // Otimização do Qwen na Cloudflare Workers AI
        const response = await env.AI.run('@cf/qwen/qwen1.5-14b-chat-awq', {
            messages,
            max_tokens: 150, // Reduzido drasticamente para gerar respostas mais velozes
            temperature: 0.5   // Otimizado para direções lógicas e precisas
        });

        return Response.json(response);
      } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }

    return new Response("Not Found", { status: 404 });
  }
}

// 4. Interface HTML (Oculta a API Key no LocalStorage e aciona ommi-ai.rattew.workers.dev)
function getChatHTML() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OmmiAI - Galaxy Chat</title>
    
    <!-- Favicon SVG Otimizado e Detalhado (Galáxia) -->
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3CradialGradient id='g' cx='50%25' cy='50%25' r='50%25'%3E%3Cstop offset='0%25' stop-color='%23fff'/%3E%3Cstop offset='20%25' stop-color='%238a2be2' stop-opacity='.8'/%3E%3Cstop offset='60%25' stop-color='%234b0082' stop-opacity='.4'/%3E%3Cstop offset='100%25' stop-color='%23000' stop-opacity='0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='100' height='100' fill='%230b0b1a' rx='20'/%3E%3Ccircle cx='50' cy='50' r='40' fill='url(%23g)'/%3E%3Cpath d='M50 10C70 30 90 40 90 50C70 60 60 80 50 90C30 70 10 60 10 50C30 40 40 20 50 10Z' fill='rgba(255,255,255,.1)' transform='rotate(45 50 50)'/%3E%3Cpath d='M50 20C65 35 80 45 80 50C65 55 55 70 50 80C35 65 20 55 20 50C35 45 45 30 50 20Z' fill='rgba(138,43,226,.3)' transform='rotate(-30 50 50)'/%3E%3Ccircle cx='20' cy='20' r='1.5' fill='%23fff'/%3E%3Ccircle cx='80' cy='30' r='1.5' fill='%23fff'/%3E%3Ccircle cx='70' cy='80' r='1.5' fill='%23fff'/%3E%3Ccircle cx='30' cy='70' r='1.5' fill='%23fff'/%3E%3Ccircle cx='85' cy='65' r='1' fill='%23fff'/%3E%3Ccircle cx='15' cy='50' r='1' fill='%23fff'/%3E%3C/svg%3E">
    
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Font Awesome CDN -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Google Fonts CDN (Space Grotesk - Vibe Tecnológica) -->
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;600;700&display=swap" rel="stylesheet">
    
    <style>
        body { font-family: 'Space Grotesk', sans-serif; background-color: #0b0b1a; color: #fff; }
        .chat-container { scroll-behavior: smooth; }
        .message-ai { background: rgba(138, 43, 226, 0.1); border: 1px solid rgba(138, 43, 226, 0.3); }
        .message-user { background: rgba(255, 255, 255, 0.05); }
        .glass-panel { background: rgba(11, 11, 26, 0.85); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.05); }
        
        /* Oculta scrollbar mas permite scroll */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(138, 43, 226, 0.5); border-radius: 10px; }
    </style>
</head>
<body class="h-screen flex flex-col relative overflow-hidden">
    
    <!-- Cabeçalho (Botão da Chave API Oculta) -->
    <header class="glass-panel p-4 flex justify-between items-center z-10 shadow-lg">
        <div class="flex items-center gap-3">
            <img src="data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3CradialGradient id='g' cx='50%25' cy='50%25' r='50%25'%3E%3Cstop offset='0%25' stop-color='%23fff'/%3E%3Cstop offset='20%25' stop-color='%238a2be2' stop-opacity='.8'/%3E%3Cstop offset='60%25' stop-color='%234b0082' stop-opacity='.4'/%3E%3Cstop offset='100%25' stop-color='%23000' stop-opacity='0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='100' height='100' fill='%230b0b1a' rx='20'/%3E%3Ccircle cx='50' cy='50' r='40' fill='url(%23g)'/%3E%3Cpath d='M50 10C70 30 90 40 90 50C70 60 60 80 50 90C30 70 10 60 10 50C30 40 40 20 50 10Z' fill='rgba(255,255,255,.1)' transform='rotate(45 50 50)'/%3E%3Cpath d='M50 20C65 35 80 45 80 50C65 55 55 70 50 80C35 65 20 55 20 50C35 45 45 30 50 20Z' fill='rgba(138,43,226,.3)' transform='rotate(-30 50 50)'/%3E%3Ccircle cx='20' cy='20' r='1.5' fill='%23fff'/%3E%3Ccircle cx='80' cy='30' r='1.5' fill='%23fff'/%3E%3Ccircle cx='70' cy='80' r='1.5' fill='%23fff'/%3E%3Ccircle cx='30' cy='70' r='1.5' fill='%23fff'/%3E%3Ccircle cx='85' cy='65' r='1' fill='%23fff'/%3E%3Ccircle cx='15' cy='50' r='1' fill='%23fff'/%3E%3C/svg%3E" alt="Galaxy Icon" class="w-10 h-10 rounded-full border border-purple-500 shadow-[0_0_10px_rgba(138,43,226,0.6)]">
            <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">OmmiAI</h1>
        </div>
        <button id="authBtn" class="bg-purple-600 hover:bg-purple-500 border border-purple-400 transition-all px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(138,43,226,0.4)]">
            <i class="fa-solid fa-key"></i> <span id="authText">Autenticar API Key</span>
        </button>
    </header>

    <!-- Área de Chat -->
    <main id="chatBox" class="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-5 chat-container pb-28">
        <div class="message-ai p-4 rounded-xl max-w-[85%] md:max-w-[70%] self-start flex gap-4 shadow-lg backdrop-blur-sm">
            <i class="fa-solid fa-robot mt-1 text-2xl text-purple-400 drop-shadow-md"></i>
            <div>
                <p class="leading-relaxed font-semibold text-purple-200">Bem-vindo(a) ao OmmiAI.</p>
                <p class="leading-relaxed text-sm text-gray-300 mt-1">Gere sua conta para conectar com o endpoint rápido Qwen!</p>
            </div>
        </div>
    </main>

    <!-- Barra de Input -->
    <footer class="glass-panel p-4 absolute bottom-0 w-full">
        <form id="chatForm" class="flex gap-3 max-w-5xl mx-auto relative">
            <input type="text" id="userInput" placeholder="Vincule sua conta para iniciar..." class="flex-1 bg-[#1a1a2e] border border-gray-600 text-white rounded-2xl px-5 py-4 focus:outline-none focus:border-purple-500 transition shadow-inner placeholder-gray-400" disabled>
            <button type="submit" id="sendBtn" class="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-6 py-4 rounded-2xl font-bold transition shadow-[0_0_15px_rgba(138,43,226,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-white" disabled>
                <i class="fa-solid fa-paper-plane"></i>
            </button>
        </form>
    </footer>

    <script>
        const authBtn = document.getElementById('authBtn');
        const authText = document.getElementById('authText');
        const chatForm = document.getElementById('chatForm');
        const userInput = document.getElementById('userInput');
        const sendBtn = document.getElementById('sendBtn');
        const chatBox = document.getElementById('chatBox');

        let messages = [
            { role: 'system', content: 'Você é OmmiAI, um assistente inteligente. Responda de forma extremamente objetiva e rápida.' }
        ];

        // Se a chave já existir no cache local do usuário (nunca aparece na UI)
        if (localStorage.getItem('ommi_api_key')) {
            enableChat(localStorage.getItem('ommi_username'));
        }

        authBtn.addEventListener('click', async () => {
            if (localStorage.getItem('ommi_api_key')) {
                alert('Sua conta já está ativada. A API Key opera nos bastidores de forma segura!');
                return;
            }
            
            const username = prompt('Digite seu Nome de Usuário para gravar no banco D1:');
            if (!username) return;

            try {
                authText.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Conectando...';
                const res = await fetch('/getapikey/?user=' + encodeURIComponent(username));
                const data = await res.json();
                
                if (data.api_key) {
                    // Guarda silenciosamente a chave gerada. Não será vista pelo usuário!
                    localStorage.setItem('ommi_api_key', data.api_key);
                    localStorage.setItem('ommi_username', username);
                    enableChat(username);
                }
            } catch(e) {
                alert('Erro ao conectar com o KV/D1.');
                authText.innerText = "Autenticar API Key";
            }
        });

        function enableChat(username) {
            authText.innerText = 'Conta: ' + username;
            authBtn.classList.replace('bg-purple-600', 'bg-[#10b981]');
            authBtn.classList.replace('hover:bg-purple-500', 'hover:bg-[#059669]');
            authBtn.classList.replace('border-purple-400', 'border-green-400');
            userInput.disabled = false;
            sendBtn.disabled = false;
            userInput.placeholder = "Mensagem enviada de forma super rápida via OmmiAI...";
        }

        function addMessage(text, isUser = false) {
            const div = document.createElement('div');
            div.className = \`\${isUser ? 'message-user self-end' : 'message-ai self-start'} p-4 rounded-xl max-w-[85%] md:max-w-[70%] flex gap-4 shadow-lg backdrop-blur-sm\`;
            div.innerHTML = \`
                \${isUser ? '' : '<i class="fa-solid fa-robot mt-1 text-2xl text-purple-400"></i>'}
                <p class="leading-relaxed whitespace-pre-wrap text-[15px]">\${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
                \${isUser ? '<i class="fa-solid fa-user-astronaut mt-1 text-2xl text-gray-400"></i>' : ''}
            \`;
            chatBox.appendChild(div);
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = userInput.value.trim();
            if (!text) return;

            addMessage(text, true);
            messages.push({ role: 'user', content: text });
            
            userInput.value = '';
            sendBtn.disabled = true;
            sendBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';

            try {
                // Recupera a chave oculta
                const token = localStorage.getItem('ommi_api_key');
                
                // Conectando direto no endpoint oficial como solicitado
                const res = await fetch('https://ommi-ai.rattew.workers.dev/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ messages })
                });

                if (!res.ok) throw new Error('Chave recusada ou instabilidade no endpoint HTTP.');
                
                const data = await res.json();
                const aiMsg = data.response || "Comunicação sem resposta do IA.";
                
                addMessage(aiMsg, false);
                messages.push({ role: 'assistant', content: aiMsg });
            } catch(err) {
                addMessage("ERRO: Falha ao requisitar o ommi-ai.rattew.workers.dev. Verifique as configurações CORS e sua API Key.", false);
            } finally {
                sendBtn.disabled = false;
                sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
                userInput.focus();
            }
        });
    </script>
</body>
</html>`;
}
