class ChatManager {
    static init(chatContainer, chatBtn) {
      chatBtn.addEventListener('click', () => {
        const isOpening = chatContainer.style.display === 'none';
        chatContainer.style.display = isOpening ? 'flex' : 'none';
        
        chatBtn.classList.toggle('active-btn', isOpening);
      });
  
      chatContainer.querySelector('.jet-close-btn').addEventListener('click', () => {
        chatContainer.style.display = 'none';
        chatBtn.classList.remove('active-btn');
      });
  
      chatContainer.querySelector('.jet-minimize-btn').addEventListener('click', () => {
        const iframe = chatContainer.querySelector('.jet-chat-iframe');
        iframe.style.display = iframe.style.display === 'none' ? 'block' : 'none';
      });
    }
  
    static loadChatIframe(url) {
      document.querySelector('.jet-chat-iframe').src = url;
    }
  }
  
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatManager;
  } else {
    window.ChatManager = ChatManager;
  }