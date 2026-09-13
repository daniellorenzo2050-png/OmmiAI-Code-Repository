export interface Env {
  AI: any;
  OMMI_KEYS: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // ----------------------------------------------------
    // 1. ROTA RAIZ (/): Interface Web para conversar com a OmmiAI
    // ----------------------------------------------------
    if (path === "/" || path === "") {
      const html = `<!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>OmmiAI Chat Gateway</title>
          <style>
              :root { bg: #0d1117; card: #161b22; text: #c9d1d9; accent: #58a6ff; border: #30363d; }
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0d1117; color: #c9d1d9; margin: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; }
              .container { width: 100%; max-width: 600px; background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); }
              h1 { margin-top: 0; color: #58a6ff; font-size: 24px; text-align: center; }
              .mode-selector { display: flex; gap: 10px; margin-bottom: 16px; justify-content: center; }
              .mode-btn { background: #21262d; border: 1px solid #30363d; color: #c9d1d9; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; }
              .mode-btn.active { background: #1f6feb; border-color: #388bfd; color: #fff; }
              #chat-box { height: 350px; background: #0d1117; border: 1px solid #30363d; border-radius: 8px; padding: 12px; overflow-y: auto; margin-bottom: 16px; display: flex; flex-direction: column; gap: 10px; }
              .message { padding: 10px 14px; border-radius: 8px; max-width: 80%; line-height: 1.4; word-break: break-word; }
              .user { background: #1f6feb; color: white; align-self: flex-end; }
              .assistant { background: #21262d; border: 1px solid #30363d; color: #c9d1d9; align-self: flex-start; }
              .input-group { display: flex; gap: 10px; }
              input[type="text"] { flex: 1; background: #0d1117; border: 1px solid #30363d; border-radius: 6px; padding: 12px; color: white; font-size: 14px; outline: none; }
              input[type="text"]:focus { border-color: #58a6ff; }
              button.send-btn { background: #238636; color: white; border: none; padding: 0 20px; border-radius: 6px; font-weight: bold; cursor: pointer; }
              button.send-btn:hover { background: #2ea043; }
              .api-link { text-align: center; margin-top: 15px; font-size: 13px; }
              .api-link a { color: #58a6ff; text-decoration: none; }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>OmmiAI Gateway</h1>
              <div class="mode-selector">
                  <button class="mode-btn active" id="btn-multi" onclick="setMode('multi')">OmmiAI Multi (Omni Flash 1.1)</button>
                  <button class="mode-btn" id="btn-laser" onclick="setMode('laser')">OmmiAI Laser (Gemini 3.8 Flash)</button>
              </div>
              <div id="chat-box">
                  <div class="message assistant">Olá! Sou a OmmiAI. Como posso ajudar você hoje?</div>
              </div>
              <div class="input-group">
                  <input type="text" id="user-input" placeholder="Digite sua mensagem..." onkeypress="handleKeyPress(event)">
                  <button class="send-btn" onclick="sendMessage()">Enviar</button>
              </div>
              <div class="api-link">
                  Precisa de uma chave programática? <a href="/getapikey/" target="_blank">Gerar API Key do OmmiAI</a>
              </div>
          </div>
          <script>
              let currentMode = 'multi';
              function setMode(mode) {
                  currentMode = mode;
                  document.getElementById('btn-multi').classList.toggle('active', mode === 'multi');
                  document.getElementById('btn-laser').classList.toggle('active', mode === 'laser');
              }
              function handleKeyPress(e) { if (e.key === 'Enter') sendMessage(); }
              async function sendMessage() {
                  const input = document.getElementById('user-input');
                  const chatBox = document.getElementById('chat-box');
                  const text = input.value.trim();
                  if (!text) return;
                  
                  chatBox.innerHTML += \`<div class="message user">\${escapeHtml(text)}</div>\`;
                  input.value = '';
                  chatBox.scrollTop = chatBox.scrollHeight;

                  try {
                      const res = await fetch('/' + currentMode, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ prompt: text })
                      });
                      const data = await res.json();
                      const reply = data.result?.response || data.result || JSON.stringify(data);
                      chatBox.innerHTML += \`<div class="message assistant">\${escapeHtml(typeof reply === 'string' ? reply : JSON.stringify(reply))}</div>\`;
                  } catch (err) {
                      chatBox.innerHTML += \`<div class="message assistant" style="color:#f85149;">Erro ao processar requisição.</div>\`;
                  }
                  chatBox.scrollTop = chatBox.scrollHeight;
              }
              function escapeHtml(text) {
                  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
              }
          </script>
      </body>
      </html>`;
      return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    // ----------------------------------------------------
    // 2. ROTA /getapikey/: Gera e exibe uma API Key nova
    // ----------------------------------------------------
    if (path.startsWith("/getapikey")) {
      const apiKey = "ommi_live_" + crypto.randomUUID().replace(/-/g, "");
      
      // Salva opcionalmente no KV se configurado
      if (env.OMMI_KEYS) {
        await env.OMMI_KEYS.put(apiKey, JSON.stringify({ created_at: Date.now(), role: "developer" }));
      }

      const responseBody = {
        status: "success",
        message: "Sua chave de API do OmmiAI foi gerada com sucesso. Guarde-a em local seguro!",
        api_key: apiKey,
        usage_example: {
          endpoint: "POST /multi ou /laser",
          header: "Authorization: Bearer " + apiKey,
          body: { prompt: "Seu comando aqui" }
        }
      };

      return new Response(JSON.stringify(responseBody, null, 2), {
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    }

    // ----------------------------------------------------
    // 3. ROTAS DE API: /multi e /laser
    // ----------------------------------------------------
    if (path.includes("/multi") || path.includes("/laser")) {
      const isLaser = path.includes("/laser");
      const modelId = isLaser ? "@cf/google/gemini-3.7-flash" : "@cf/google/gemini-3.5-flash";
      const systemPrompt = isLaser 
        ? "Você é a OmmiAI Laser, otimizada para alta velocidade e exatidão analítica." 
        : "Você é a OmmiAI Multi, otimizada para multimodalidade, criatividade e versatilidade geral.";

      try {
        const body: any = await request.json();
        const userMessage = body.prompt || body.message;

        if (!userMessage) {
          return new Response(JSON.stringify({ error: "O campo 'prompt' é obrigatório no corpo da requisição." }), {
            status: 400,
            headers: { "Content-Type": "application/json; charset=utf-8" }
          });
        }

        // Execução da inferência na Edge via Cloudflare Workers AI
        const aiResponse = await env.AI.run(modelId, {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
        });

        return new Response(JSON.stringify({
          gateway: "OmmiAI",
          model_variant: isLaser ? "OmmiAI Laser" : "OmmiAI Multi",
          model_id: modelId,
          result: aiResponse
        }), {
          headers: { "Content-Type": "application/json; charset=utf-8" }
        });

      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || "Erro interno no servidor." }), {
          status: 500,
          headers: { "Content-Type": "application/json; charset=utf-8" }
        });
      }
    }

    // Caso a rota não exista
    return new Response("Endpoint não encontrado. Use '/' para o Chat, '/getapikey/' para credenciais ou '/multi' e '/laser' para a API.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  },
};
