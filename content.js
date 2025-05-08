// Adiciona o CSS externo
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = chrome.runtime.getURL('styles.css');
document.head.appendChild(link);

// Cria o botão flutuante
const floatingBtn = document.createElement('div');
floatingBtn.className = 'jet-floating-btn';
floatingBtn.innerHTML = `<img src="${chrome.runtime.getURL('jetchat.png')}" alt="Jet Chat">`;
document.body.appendChild(floatingBtn);

// Cria o container do chat (já definindo display: none inicial)
const chatContainer = document.createElement('div');
chatContainer.className = 'jet-chat-container';
chatContainer.style.display = 'none'; // Definindo estado inicial como oculto
document.body.appendChild(chatContainer);

// Cabeçalho com título, botão de minimizar e fechar
const chatHeader = document.createElement('div');
chatHeader.className = 'jet-chat-header';
chatHeader.innerHTML = `
  <span>Chat JetSales</span>
  <div>
    <button class="jet-minimize-chat">−</button>
    <button class="jet-close-chat">×</button>
  </div>
`;
chatContainer.appendChild(chatHeader);

// Carrega o config.json e insere o iframe dinamicamente
fetch(chrome.runtime.getURL('config.json'))
  .then(response => response.json())
  .then(config => {
    const chatIframe = document.createElement('iframe');
    chatIframe.src = config.chatIframeUrl;
    chatIframe.style.width = "100%";
    chatIframe.style.height = "500px";
    chatIframe.style.border = "none";
    chatIframe.className = "jet-chat-iframe";
    chatContainer.appendChild(chatIframe);

    // Botão flutuante: alternar exibição (agora funciona no primeiro clique)
    floatingBtn.addEventListener('click', () => {
      chatContainer.style.display = chatContainer.style.display === 'none' ? 'block' : 'none';
      
      // Opcional: rolar para o chat quando aberto
      if (chatContainer.style.display === 'block') {
        chatContainer.scrollIntoView({ behavior: 'smooth' });
      }
    });

    // Fechar o chat
    chatHeader.querySelector('.jet-close-chat').addEventListener('click', () => {
      chatContainer.style.display = 'none';
    });

    // Minimizar/maximizar o chat
    const minimizeBtn = chatHeader.querySelector('.jet-minimize-chat');
    minimizeBtn.addEventListener('click', () => {
      const iframe = chatContainer.querySelector('.jet-chat-iframe');
      if (iframe.style.display === 'none') {
        iframe.style.display = 'block';
        minimizeBtn.textContent = '−';
      } else {
        iframe.style.display = 'none';
        minimizeBtn.textContent = '+';
      }
    });
  })
  .catch(error => {
    console.error("Erro ao carregar o config.json:", error);
    // Adicionar tratamento de erro visível para o usuário
    chatContainer.innerHTML = '<p>Não foi possível carregar o chat. Por favor, recarregue a página.</p>';
    chatContainer.style.display = 'block';
  });