class UIManager {
    static loadCSS() {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = chrome.runtime.getURL('styles.css');
      document.head.appendChild(link);
    }
  
    static createFloatingButtons() {
      const floatingContainer = document.createElement('div');
      floatingContainer.className = 'jet-floating-container';
      document.body.appendChild(floatingContainer);
  
      // Chat Button
      const chatBtn = document.createElement('div');
      chatBtn.className = 'jet-floating-btn jet-chat-btn';
      chatBtn.innerHTML = `<img src="${chrome.runtime.getURL('assets/jetchat.png')}" alt="Chat">`;
      floatingContainer.appendChild(chatBtn);
  
      // Scripts Button
      const scriptsBtn = document.createElement('div');
      scriptsBtn.className = 'jet-floating-btn jet-scripts-btn';
      scriptsBtn.innerHTML = `<img src="${chrome.runtime.getURL('assets/setting.png')}" alt="Scripts">`;
      floatingContainer.appendChild(scriptsBtn);
  
      return { chatBtn, scriptsBtn };
    }
  
    static createChatContainer() {
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
      return chatContainer;
    }
  
    static createScriptsContainer() {
      const scriptsContainer = document.createElement('div');
      scriptsContainer.className = 'jet-scripts-container';
      scriptsContainer.style.display = 'none';
      scriptsContainer.innerHTML = `
        <!-- ... (same HTML structure as in your original) ... -->
      `;
      document.body.appendChild(scriptsContainer);
      return scriptsContainer;
    }
  }
  
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
  } else {
    window.UIManager = UIManager;
  }