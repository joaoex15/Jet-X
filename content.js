// Adiciona o CSS externo
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = chrome.runtime.getURL('styles.css');
document.head.appendChild(link);

// Cria o container principal para os botões flutuantes
const floatingContainer = document.createElement('div');
floatingContainer.className = 'jet-floating-container';
document.body.appendChild(floatingContainer);

// 1. Botão do Chat
const chatBtn = document.createElement('div');
chatBtn.className = 'jet-floating-btn jet-chat-btn';
chatBtn.innerHTML = `<img src="${chrome.runtime.getURL('jetchat.png')}" alt="Chat">`;
floatingContainer.appendChild(chatBtn);

// 2. Botão de Scripts
const scriptsBtn = document.createElement('div');
scriptsBtn.className = 'jet-floating-btn jet-scripts-btn';
scriptsBtn.innerHTML = `<img src="${chrome.runtime.getURL('setting.png')}" alt="Scripts">`;
floatingContainer.appendChild(scriptsBtn);

// Container do Chat
const chatContainer = document.createElement('div');
chatContainer.className = 'jet-chat-container';
chatContainer.style.display = 'none';
chatContainer.innerHTML = `
  <div class="jet-chat-header">
    <span>Chat JetSales</span>
    <div>
      <button class="jet-minimize-btn">−</button>
      <button class="jet-close-btn">×</button>
    </div>
  </div>
  <iframe class="jet-chat-iframe" src="" style="width:100%;height:500px;border:none"></iframe>
`;
document.body.appendChild(chatContainer);

// Container de Scripts
const scriptsContainer = document.createElement('div');
scriptsContainer.className = 'jet-scripts-container';
scriptsContainer.style.display = 'none';
scriptsContainer.innerHTML = `
  <div class="jet-scripts-header">
    <h3>Editor de Scripts</h3>
    <button class="jet-close-btn">×</button>
  </div>
  <div class="jet-scripts-body">
    <textarea placeholder="Digite seu script aqui..."></textarea>
    <div class="jet-scripts-footer">
      <button class="jet-save-btn">Salvar</button>
      <button class="jet-send-btn">Enviar para Chat</button>
    </div>
  </div>
`;
document.body.appendChild(scriptsContainer);

// Carrega a configuração
fetch(chrome.runtime.getURL('config.json'))
  .then(response => response.json())
  .then(config => {
    // Configura o iframe do chat
    document.querySelector('.jet-chat-iframe').src = config.chatIframeUrl;

    // Eventos do botão do Chat
    chatBtn.addEventListener('click', () => {
      chatContainer.style.display = chatContainer.style.display === 'none' ? 'flex' : 'none';
      scriptsContainer.style.display = 'none';
    });

    // Eventos do botão de Scripts
    scriptsBtn.addEventListener('click', () => {
      scriptsContainer.style.display = scriptsContainer.style.display === 'none' ? 'flex' : 'none';
      chatContainer.style.display = 'none';
    });

    // Fechar Chat
    chatContainer.querySelector('.jet-close-btn').addEventListener('click', () => {
      chatContainer.style.display = 'none';
    });

    // Minimizar Chat
    chatContainer.querySelector('.jet-minimize-btn').addEventListener('click', () => {
      const iframe = chatContainer.querySelector('.jet-chat-iframe');
      iframe.style.display = iframe.style.display === 'none' ? 'block' : 'none';
    });

    // Fechar Scripts
    scriptsContainer.querySelector('.jet-close-btn').addEventListener('click', () => {
      scriptsContainer.style.display = 'none';
    });

    // Salvar Script
    scriptsContainer.querySelector('.jet-save-btn').addEventListener('click', () => {
      const script = scriptsContainer.querySelector('textarea').value;
      console.log('Script salvo:', script);
      // Implementar lógica de salvamento
    });

    // Enviar para Chat
    scriptsContainer.querySelector('.jet-send-btn').addEventListener('click', () => {
      const script = scriptsContainer.querySelector('textarea').value;
      console.log('Script enviado:', script);
      // Implementar lógica de envio para o chat
    });
  })
  .catch(error => console.error('Erro ao carregar configurações:', error));