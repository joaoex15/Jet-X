// Load dependencies
UIManager.loadCSS();

// Create UI elements
const { chatBtn, scriptsBtn } = UIManager.createFloatingButtons();
const chatContainer = UIManager.createChatContainer();
const scriptsContainer = UIManager.createScriptsContainer();

// Load configuration
fetch(chrome.runtime.getURL('config.json'))
  .then(response => response.json())
  .then(config => {
    // Initialize chat
    ChatManager.loadChatIframe(config.chatIframeUrl);
    ChatManager.init(chatContainer, chatBtn);

    // Initialize scripts button
    scriptsBtn.addEventListener('click', () => {
      const isOpening = scriptsContainer.style.display === 'none';
      scriptsContainer.style.display = isOpening ? 'flex' : 'none';
      
      scriptsBtn.classList.toggle('active-btn', isOpening);
      
      if (isOpening) {
        new ScriptManager();
      }
    });

    // Close scripts
    scriptsContainer.querySelector('.jet-close-btn').addEventListener('click', () => {
      scriptsContainer.style.display = 'none';
      scriptsBtn.classList.remove('active-btn');
    });
  })
  .catch(console.error);