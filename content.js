// Cria o botão flutuante
const floatingBtn = document.createElement('div');
floatingBtn.className = 'jet-floating-btn';
floatingBtn.innerHTML = `<img src="${chrome.runtime.getURL('jetchat.png')}" alt="Jet Chat">`;
document.body.appendChild(floatingBtn);

// Cria o chat flutuante
const floatingChat = document.createElement('div');
floatingChat.className = 'jet-floating-chat';
floatingChat.innerHTML = `
    <div class="jet-chat-header">
        <img src="${chrome.runtime.getURL('jetsales.png')}" class="jet-chat-logo">
        <span>Chat JetSales</span>
        <button class="jet-close-chat">×</button>
    </div>
    <div class="jet-chat-body">
        <div class="jet-messages"></div>
    </div>
    <div class="jet-input-area">
        <input type="text" placeholder="Digite sua mensagem..." class="jet-message-input">
        <button class="jet-send-btn">Enviar</button>
    </div>
`;
document.body.appendChild(floatingChat);

// Controle de visibilidade
floatingBtn.addEventListener('click', () => {
    floatingChat.classList.toggle('active');
});

floatingChat.querySelector('.jet-close-chat').addEventListener('click', () => {
    floatingChat.classList.remove('active');
});

// Envio de mensagem
floatingChat.querySelector('.jet-send-btn').addEventListener('click', sendMessage);
floatingChat.querySelector('.jet-message-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const input = floatingChat.querySelector('.jet-message-input');
    const message = input.value.trim();
    if (message) {
        const messagesContainer = floatingChat.querySelector('.jet-messages');
        messagesContainer.innerHTML += `<div class="jet-message">${message}</div>`;
        input.value = '';
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}