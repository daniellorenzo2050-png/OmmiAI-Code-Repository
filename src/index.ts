export interface Env {
  AI: any;
  DB: D1Database;
  MY_KV: KVNamespace;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
};

// Favicon em SVG Espacial Super Detalhado
const GALAXY_FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <radialGradient id="spaceBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0f0c22"/>
      <stop offset="100%" stop-color="#05030a"/>
    </radialGradient>
    <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="20%" stop-color="#ffe5a3"/>
      <stop offset="45%" stop-color="#f43f5e"/>
      <stop offset="70%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="nebulaGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.7"/>
      <stop offset="50%" stop-color="#a855f7" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <filter id="glowEffect" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <linearGradient id="spiralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22d3ee"/>
      <stop offset="50%" stop-color="#ec4899"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#spaceBg)"/>
  <!-- Partículas de Estrelas ao Fundo -->
  <circle cx="100" cy="80" r="2.5" fill="#ffffff" opacity="0.9"/>
  <circle cx="410" cy="110" r="2" fill="#67e8f9" opacity="0.85"/>
  <circle cx="85" cy="410" r="3" fill="#f472b6" opacity="0.8"/>
  <circle cx="430" cy="380" r="2.2" fill="#e0e7ff" opacity="0.9"/>
  <circle cx="230" cy="50" r="1.8" fill="#ffffff" opacity="0.95"/>
  <circle cx="460" cy="240" r="2.5" fill="#38bdf8" opacity="0.85"/>
  <circle cx="60" cy="210" r="2" fill="#f0abfc" opacity="0.8"/>
  <circle cx="310" cy="460" r="1.5" fill="#a7f3d0" opacity="0.75"/>
  <!-- Névoa da Galáxia -->
  <ellipse cx="256" cy="256" rx="210" ry="95" fill="url(#nebulaGlow)" transform="rotate(-32 256 256)" filter="url(#glowEffect)"/>
  <ellipse cx="256" cy="256" rx="170" ry="65" fill="url(#nebulaGlow)" transform="rotate(40 256 256)" filter="url(#glowEffect)"/>
  <!-- Braços Espirais -->
  <path d="M 256 256 Q 320 170, 420 200 T 430 320 Q 370 420, 260 415" fill="none" stroke="url(#spiralGrad)" stroke-width="12" stroke-linecap="round" opacity="0.85" filter="url(#glowEffect)"/>
  <path d="M 256 256 Q 192 342, 92 312 T 82 192 Q 142 92, 252 97" fill="none" stroke="url(#spiralGrad)" stroke-width="10" stroke-linecap="round" opacity="0.8" filter="url(#glowEffect)"/>
  <!-- Anel de Órbita Estelar -->
  <ellipse cx="256" cy="256" rx="215" ry="78" fill="none" stroke="url(#spiralGrad)" stroke-width="2.5" stroke-dasharray="6 10" transform="rotate(-25 256 256)" opacity="0.75"/>
  <!-- Núcleo Supermassivo Luminoso -->
  <circle cx="256" cy="256" r="95" fill="url(#coreGlow)"/>
  <circle cx="256" cy="256" r="26" fill="#ffffff" filter="url(#glowEffect)"/>
  <!-- Flares Estelares -->
  <path d="M 256 186 L 256 326 M 186 256 L 326 256" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" opacity="0.95"/>
  <path d="M 210 210 L 302 302 M 302 210 L 210 302" stroke="#e0e7ff" stroke-width="1.8" stroke-linecap="round" opacity="0.7"/>
</svg>`;

// Interface HTML com Tailwind CSS, Font Awesome e Google Fonts
const HTML_CONTENT = `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OmmiAI — Inteligência Cósmica Ultrarrápida</title>
  
  <!-- Favicon Galáxia SVG -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace']
          },
          colors: {
            space: {
              950: '#06050e',
              900: '#0b0a1a',
              800: '#14122b',
              700: '#1f1b3d',
              accent: '#8b5cf6',
              cyan: '#06b6d4'
            }
          }
        }
      }
    }
  </script>
  
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  
  <!-- Font Awesome 6 CDN -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

  <style>
    /* Scrollbar Personalizada */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #0b0a1a; }
    ::-webkit-scrollbar-thumb { background: #2e2a52; border-radius: 9999px; }
    ::-webkit-scrollbar-thumb:hover { background: #8b5cf6; }
    
    .glow-box {
      box-shadow: 0 0 35px -5px rgba(139, 92, 246, 0.25);
    }
    .glow-cyan {
      box-shadow: 0 0 25px -3px rgba(6, 182, 212, 0.3);
    }
  </style>
</head>
<body class="bg-space-950 text-slate-100 font-sans min-h-screen flex flex-col antialiased selection:bg-purple-500 selection:text-white">

  <!-- Header principal -->
  <header class="border-b border-space-700/60 bg-space-900/80 backdrop-blur-md sticky top-0 z-50">
    <div class="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-cyan-400 p-0.5 shadow-lg shadow-purple-500/20">
          <div class="w-full h-full bg-space-950 rounded-[10px] flex items-center justify-center">
            <img src="/favicon.svg" alt="OmmiAI Galaxy" class="w-7 h-7 transform hover:rotate-45 transition-transform duration-500">
          </div>
        </div>
        <div>
          <h1 class="text-xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            OmmiAI
            <span class="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Qwen AWQ</span>
          </h1>
          <p class="text-xs text-slate-400 font-medium">Engine da Cloudflare Edge &bull; Latência Mínima</p>
        </div>
      </div>

      <!-- Badge de Status -->
      <div class="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-space-800 border border-space-700">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span class="text-emerald-400 hidden sm:inline">Online (Turbo SSE)</span>
      </div>
    </div>
  </header>

  <!-- Conteúdo Principal -->
  <main class="flex-1 max-w-5xl w-full mx-auto px-4 py-6 flex flex-col gap-5">

    <!-- Card da API Key -->
    <div class="bg-space-900 border border-space-700/80 rounded-2xl p-4 sm:p-5 glow-box transition-all">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-sm font-bold text-slate-200">
            <i class="fa-solid fa-key text-purple-400"></i>
            <span>Sua API Key Pessoal OmmiAI</span>
          </div>
          <p class="text-xs text-slate-400">Usuário vinculado: <code class="text-purple-300 font-mono bg-space-800 px-1.5 py-0.5 rounded border border-space-700">daniellorenzopereiradasilva2027</code></p>
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <button id="btn-get-key" onclick="fetchApiKey()" class="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 active:scale-95">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
            <span>Gerar / Revelar API Key</span>
          </button>
        </div>
      </div>

      <!-- Campo da Chave -->
      <div class="mt-4 flex items-center gap-2">
        <div class="relative flex-1">
          <input type="text" id="api-key-input" readonly placeholder="Clique no botão acima para carregar sua API Key..." class="w-full bg-space-950 border border-space-700/80 rounded-xl px-4 py-2.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-purple-500 pr-10 shadow-inner">
          <i class="fa-solid fa-shield-halved absolute right-3 top-3 text-slate-600 text-sm"></i>
        </div>
        <button id="btn-copy" onclick="copyApiKey()" class="px-3.5 py-2.5 bg-space-800 hover:bg-space-700 border border-space-700 text-slate-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95">
          <i class="fa-regular fa-copy text-sm" id="copy-icon"></i>
          <span class="hidden sm:inline">Copiar</span>
        </button>
      </div>
      <div id="toast-key" class="hidden mt-2 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
        <i class="fa-solid fa-circle-check"></i>
        <span>API Key pronta e armazenada com sucesso!</span>
      </div>
    </div>

    <!-- Janela de Chat -->
    <div class="flex-1 bg-space-900 border border-space-700/80 rounded-2xl flex flex-col overflow-hidden min-h-[420px] shadow-2xl">
      
      <!-- Topo do Chat -->
      <div class="px-5 py-3.5 border-b border-space-700/60 bg-space-800/40 flex items-center justify-between">
        <div class="flex items-center gap-2 text-xs text-slate-300 font-semibold">
          <i class="fa-solid fa-comments text-cyan-400"></i>
          <span>Conversa em Tempo Real</span>
        </div>
        <button onclick="clearChat()" class="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1">
          <i class="fa-solid fa-trash-can"></i>
          <span class="hidden sm:inline">Limpar Chat</span>
        </button>
      </div>

      <!-- Área de Mensagens -->
      <div id="chat-box" class="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[500px]">
        
        <!-- Mensagem Inicial -->
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0">
            <i class="fa-solid fa-microchip text-purple-400 text-sm"></i>
          </div>
          <div class="bg-space-800/80 border border-space-700/70 rounded-2xl rounded-tl-none p-4 max-w-[85%] text-sm text-slate-200 leading-relaxed shadow-sm">
            <p>Olá, <strong>Daniel</strong>! Sou o <strong>OmmiAI</strong> com motor Qwen AWQ rodando diretamente na Cloudflare.</p>
            <p class="text-xs text-slate-400 mt-2">Como posso ajudar você hoje?</p>
          </div>
        </div>

      </div>

      <!-- Formulário de Envio -->
      <div class="p-3 sm:p-4 border-t border-space-700/60 bg-space-950/80">
        <form onsubmit="handleSend(event)" class="flex items-center gap-2">
          <input type="text" id="user-prompt" autocomplete="off" placeholder="Digite sua pergunta (resposta instantânea)..." class="flex-1 bg-space-900 border border-space-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all">
          
          <button type="submit" id="btn-send" class="px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg glow-cyan flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
            <span>Enviar</span>
            <i class="fa-solid fa-paper-plane text-xs"></i>
          </button>
        </form>
      </div>

    </div>

  </main>

  <!-- Lógica Frontend JS -->
  <script>
    const DEFAULT_USER = 'daniellorenzopereiradasilva2027';

    // Ao carregar a página, restaura a chave se existir
    window.addEventListener('DOMContentLoaded', () => {
      const savedKey = localStorage.getItem('ommi_api_key');
      if (savedKey) {
        document.getElementById('api-key-input').value = savedKey;
      } else {
        // Tenta obter automaticamente no primeiro carregamento
        fetchApiKey();
      }
    });

    async function fetchApiKey() {
      const btn = document.getElementById('btn-get-key');
      const input = document.getElementById('api-key-input');
      const toast = document.getElementById('toast-key');

      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> <span>Buscando...</span>';

      try {
        const res = await fetch('/getapikey/?username=' + encodeURIComponent(DEFAULT_USER));
        const data = await res.json();

        if (data.api_key) {
          input.value = data.api_key;
          localStorage.setItem('ommi_api_key', data.api_key);
          toast.classList.remove('hidden');
          setTimeout(() => toast.classList.add('hidden'), 4000);
        } else {
          alert('Erro ao gerar a chave: ' + (data.error || 'Tente novamente'));
        }
      } catch (err) {
        alert('Erro de conexão ao buscar a API Key.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Gerar / Revelar API Key</span>';
      }
    }

    function copyApiKey() {
      const input = document.getElementById('api-key-input');
      if (!input.value) return;

      navigator.clipboard.writeText(input.value);
      const icon = document.getElementById('copy-icon');
      icon.className = 'fa-solid fa-check text-emerald-400';
      setTimeout(() => {
        icon.className = 'fa-regular fa-copy';
      }, 2000);
    }

    function clearChat() {
      const chatBox = document.getElementById('chat-box');
      chatBox.innerHTML = \`
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0">
            <i class="fa-solid fa-microchip text-purple-400 text-sm"></i>
          </div>
          <div class="bg-space-800/80 border border-space-700/70 rounded-2xl rounded-tl-none p-4 max-w-[85%] text-sm text-slate-200 leading-relaxed shadow-sm">
            <p>Chat limpo! Envie uma nova mensagem para testar a resposta instantânea.</p>
          </div>
        </div>
      \`;
    }

    async function handleSend(e) {
      e.preventDefault();
      const input = document.getElementById('user-prompt');
      const prompt = input.value.trim();
      if (!prompt) return;

      const apiKey = localStorage.getItem('ommi_api_key') || '';
      input.value = '';

      const chatBox = document.getElementById('chat-box');

      // Adiciona mensagem do Usuário
      const userMsgDiv = document.createElement('div');
      userMsgDiv.className = 'flex items-start justify-end gap-3';
      userMsgDiv.innerHTML = \`
        <div class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl rounded-tr-none p-4 max-w-[85%] text-sm shadow-md">
          <p>\${escapeHtml(prompt)}</p>
        </div>
        <div class="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
          <i class="fa-solid fa-user text-indigo-300 text-sm"></i>
        </div>
      \`;
      chatBox.appendChild(userMsgDiv);

      // Adiciona placeholder da IA
      const aiMsgDiv = document.createElement('div');
      aiMsgDiv.className = 'flex items-start gap-3';
      const aiContentId = 'ai-res-' + Date.now();
      aiMsgDiv.innerHTML = \`
        <div class="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
          <i class="fa-solid fa-atom text-cyan-400 text-sm animate-spin-slow"></i>
        </div>
        <div class="bg-space-800/90 border border-space-700/80 rounded-2xl rounded-tl-none p-4 max-w-[85%] text-sm text-slate-100 leading-relaxed shadow-md">
          <span id="\${aiContentId}" class="inline-block"><i class="fa-solid fa-circle-notch animate-spin text-cyan-400"></i></span>
        </div>
      \`;
      chatBox.appendChild(aiMsgDiv);
      chatBox.scrollTop = chatBox.scrollHeight;

      const aiTextSpan = document.getElementById(aiContentId);

      try {
        const response = await fetch('/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
          },
          body: JSON.stringify({ prompt: prompt, api_key: apiKey })
        });

        if (!response.ok) {
          aiTextSpan.innerText = '[Erro na requisição. Verifique sua chave.]';
          return;
        }

        aiTextSpan.innerText = ''; // Limpa o loader

        // Leitura do Stream SSE
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\\n');

          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.replace('data: ', ''));
                if (data.response) {
                  fullText += data.response;
                  aiTextSpan.innerText = fullText;
                  chatBox.scrollTop = chatBox.scrollHeight;
                }
              } catch (err) {
                // Fragmento incompleto do SSE, aguarda próximo chunk
              }
            }
          }
        }

      } catch (err) {
        aiTextSpan.innerText = '[Erro ao conectar com o servidor OmmiAI.]';
      }
    }

    function escapeHtml(text) {
      return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
  </script>
</body>
</html>`;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 1. Trata CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // 2. Servir Favicon em SVG
    if (url.pathname === '/favicon.svg' || url.pathname === '/favicon.ico') {
      return new Response(GALAXY_FAVICON_SVG, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=86400'
        }
      });
    }

    // 3. Servir a Página Principal HTML
    if (url.pathname === '/' && request.method === 'GET') {
      return new Response(HTML_CONTENT, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      });
    }

    // 4. Rota para Gerar ou Buscar API Key
    if (url.pathname === '/getapikey/' || url.pathname === '/getapikey') {
      const username = url.searchParams.get('username') || 'daniellorenzopereiradasilva2027';

      try {
        let apiKey: string | null = null;

        // Tenta buscar no KV primeiro
        if (env.MY_KV) {
          apiKey = await env.MY_KV.get(`user_key:${username}`);
        }

        // Se não encontrou no KV, tenta buscar no D1
        if (!apiKey && env.DB) {
          try {
            const row = await env.DB.prepare('SELECT api_key FROM api_keys WHERE username = ?')
              .bind(username)
              .first();
            if (row && row.api_key) {
              apiKey = row.api_key as string;
            }
          } catch (e) {
            // Tabela D1 não criada ou erro de query
          }
        }

        // Se a chave ainda não existe, cria uma nova
        if (!apiKey) {
          apiKey = `ommi_live_${crypto.randomUUID().replace(/-/g, '')}`;

          // Salva no KV
          if (env.MY_KV) {
            await env.MY_KV.put(`user_key:${username}`, apiKey);
            await env.MY_KV.put(`key_owner:${apiKey}`, username);
          }

          // Salva no D1
          if (env.DB) {
            try {
              await env.DB.prepare('INSERT OR REPLACE INTO api_keys (username, api_key) VALUES (?, ?)')
                .bind(username, apiKey)
                .run();
            } catch (e) {
              // Tabela D1 opcional
            }
          }
        }

        return new Response(JSON.stringify({ success: true, username, api_key: apiKey }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });

      } catch (err: any) {
        const fallbackKey = `ommi_live_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;
        return new Response(JSON.stringify({ success: true, username, api_key: fallbackKey }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
    }

    // 5. Rota do Chat (Streaming Ultrarrápido com Qwen AWQ e Max Tokens Reduzido)
    if (url.pathname === '/chat' || url.pathname === '/api/chat') {
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Método não permitido. Use POST.' }), {
          status: 405,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }

      try {
        const body: any = await request.json();
        const userPrompt = body.prompt || body.message || 'Olá';

        // Executa o modelo Qwen AWQ altamente quantizado com Max Tokens = 256
        const aiStream = await env.AI.run('@cf/qwen/qwen1.5-7b-chat-awq', {
          messages: [
            {
              role: 'system',
              content: 'Você é o OmmiAI, um assistente inteligente, rápido e direto ao ponto. Responda com clareza em poucas frases.'
            },
            { role: 'user', content: userPrompt }
          ],
          stream: true,      // Resposta enviada em fluxo SSE (instantânea)
          max_tokens: 256    // Reduzido para tempo de resposta ultracurto
        });

        return new Response(aiStream, {
          headers: {
            ...CORS_HEADERS,
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });

      } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message || 'Erro interno no modelo' }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response('Página Não Encontrada', { status: 404, headers: CORS_HEADERS });
  },
};
