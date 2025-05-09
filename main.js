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
chatBtn.innerHTML = `<img src="${chrome.runtime.getURL('assets/jetchat.png')}" alt="Chat">`;
floatingContainer.appendChild(chatBtn);

// 2. Botão de Scripts
const scriptsBtn = document.createElement('div');
scriptsBtn.className = 'jet-floating-btn jet-scripts-btn';
scriptsBtn.innerHTML = `<img src="${chrome.runtime.getURL('assets/setting.png')}" alt="Scripts">`;
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
    <h3>Gerenciador de Scripts</h3>
    <button class="jet-close-btn">×</button>
  </div>
  <div class="jet-scripts-tabs">
    <button class="jet-tab-btn active" data-tab="list">
      <i class="jet-tab-icon">📋</i> Meus Scripts
    </button>
    <button class="jet-tab-btn" data-tab="create">
      <i class="jet-tab-icon">✚</i> Novo Script
    </button>
  </div>
  <div class="jet-scripts-content">
    <div class="jet-tab-pane active" id="list">
      <div class="jet-scripts-filter">
        <select class="jet-category-filter">
          <option value="">Todas categorias</option>
          <option value="vendas">Vendas</option>
          <option value="suporte">Suporte</option>
          <option value="financeiro">Financeiro</option>
          <option value="outros">Outros</option>
        </select>
        <input type="text" class="jet-search-input" placeholder="Buscar scripts...">
      </div>
      <div class="jet-scripts-list"></div>
    </div>
    
    <div class="jet-tab-pane" id="create">
      <div class="jet-script-form">
        <div class="jet-form-group">
          <label>Título</label>
          <input type="text" class="jet-script-title">
        </div>
        <div class="jet-form-group">
          <label>Categoria</label>
          <select class="jet-script-category">
            <option value="vendas">Vendas</option>
            <option value="suporte">Suporte</option>
            <option value="financeiro">Financeiro</option>
            <option value="outros">Outros</option>
          </select>
        </div>
        <div class="jet-form-group">
          <label>Conteúdo</label>
          <textarea class="jet-script-content" placeholder="Digite o conteúdo do script..."></textarea>
        </div>
        <div class="jet-form-actions">
          <button class="jet-save-script">Salvar Script</button>
          <button class="jet-cancel-edit" style="display:none; margin-left:10px;">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
`;
document.body.appendChild(scriptsContainer);

class ScriptManager {
  constructor() {
    this.scripts = [];
    this.currentTab = 'list';
    this.apiBaseUrl = 'http://localhost:4000/scripts';
    this.authToken = localStorage.getItem('apiToken');
    this.isEditing = false;
    this.currentEditId = null;
    this.isSending = false;
    this.saving = false;
    this.initEvents();
    this.loadScripts();
  }

  async handleApiCall(apiCall) {
    try {
      return await apiCall();
    } catch (error) {
      console.error('Erro na API:', error);
      this.showErrorToast(this.getErrorMessage(error));
      throw error;
    }
  }

  getErrorMessage(error) {
    if (error.response) {
      if (error.response.status === 401) return 'Sessão expirada. Faça login novamente.';
      if (error.response.status === 400) return 'Dados inválidos. Verifique as informações.';
      return `Erro ${error.response.status}: ${error.response.statusText}`;
    }
    if (error.request) return 'Sem resposta do servidor. Verifique sua conexão.';
    return error.message || 'Erro ao conectar com o servidor';
  }

  getHeaders() {
    const headers = { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authToken || ''}`
    };
    return headers;
  }

  async loadScripts() {
    try {
      const response = await fetch(this.apiBaseUrl, { 
        headers: this.getHeaders() 
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      this.scripts = Array.isArray(result?.data) ? result.data : [];
      localStorage.setItem('jet-scripts-backup', JSON.stringify(this.scripts));
      this.renderScriptList();
    } catch (error) {
      console.error("Failed to load scripts:", error);
      this.showErrorToast("Falha ao carregar scripts");
      
      try {
        const backup = localStorage.getItem('jet-scripts-backup');
        this.scripts = backup ? JSON.parse(backup) : [];
      } catch (e) {
        console.error("Failed to parse backup:", e);
        this.scripts = [];
      }
      
      this.renderScriptList();
    }
  }

  async saveScript() {
    if (this.saving) return;
    this.saving = true;
    
    const title = document.querySelector('.jet-script-title').value.trim();
    const content = document.querySelector('.jet-script-content').value.trim();
    const category = document.querySelector('.jet-script-category').value;

    if (!title || !content) {
      this.showErrorToast('Preencha todos os campos obrigatórios');
      this.saving = false;
      return;
    }

    const scriptData = { titulo: title, conteudo: content, categoria: category };

    try {
      let response;
      if (this.isEditing && this.currentEditId) {
        response = await fetch(`${this.apiBaseUrl}/${this.currentEditId}`, {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify(scriptData)
        });
      } else {
        response = await fetch(this.apiBaseUrl, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(scriptData)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      await this.loadScripts();

      if (this.isEditing && this.currentEditId) {
        this.showSuccessToast('Script atualizado com sucesso!');
      } else {
        this.showSuccessToast('Script salvo com sucesso!');
      }
      
      this.clearForm();
      document.querySelector('.jet-tab-btn[data-tab="list"]').click();
    } catch (error) {
      console.error("Error saving script:", error);
      this.showErrorToast(error.message || 'Erro ao salvar script');
    } finally {
      this.saving = false;
    }
  }

  async editScript(id, updatedData) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/${id}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const updatedScript = result.data;
      
      const index = this.scripts.findIndex(s => s.id === id);
      if (index !== -1) this.scripts[index] = updatedScript;
      
      localStorage.setItem('jet-scripts-backup', JSON.stringify(this.scripts));
      
      this.renderScriptList();
      this.showSuccessToast(result.message || 'Script atualizado com sucesso!');
    } catch (error) {
      console.error("Error updating script:", error);
      this.showErrorToast(error.message || 'Erro ao atualizar script');
    }
  }

  async deleteScript(id) {
    if (!confirm('Tem certeza que deseja excluir este script?')) return;

    try {
      const response = await fetch(`${this.apiBaseUrl}/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      this.scripts = this.scripts.filter(script => script.id !== id);
      localStorage.setItem('jet-scripts-backup', JSON.stringify(this.scripts));
      
      this.renderScriptList();
      this.showSuccessToast(result.message || 'Script excluído com sucesso!');
    } catch (error) {
      console.error("Error deleting script:", error);
      this.showErrorToast(error.message || 'Erro ao excluir script');
    }
  }

  useScript(content) {
    if (this.isSending) {
      console.log('🚫 Envio bloqueado: já existe um envio em andamento');
      return;
    }
    
    console.log('Preparando para enviar script para o WhatsApp...');
    this.enviarParaWhatsApp(content);
  }

  enviarParaWhatsApp(texto, tentativa = 0) {
    const MAX_TENTATIVAS = 3;
    const TEMPO_ESPERA = 1000;

    this.isSending = true;
    console.log('🔒 Bloqueando novos envios...');

    const campoMensagem = document.querySelector('div[contenteditable="true"][data-tab="10"]');
    const botaoEnviar = document.querySelector('span[data-icon="send"]');

    if (!campoMensagem) {
      if (tentativa < MAX_TENTATIVAS) {
        console.log(`⏳ Campo não encontrado (tentativa ${tentativa + 1}/${MAX_TENTATIVAS})`);
        setTimeout(() => {
          this.enviarParaWhatsApp(texto, tentativa + 1);
        }, TEMPO_ESPERA);
        return;
      } else {
        console.warn('❌ Máximo de tentativas alcançado');
        this.showErrorToast('Não foi possível enviar a mensagem');
        this.isSending = false;
        return;
      }
    }

    try {
      console.log('✅ Campo encontrado. Enviando mensagem...');
      
      campoMensagem.focus();
      campoMensagem.innerHTML = '';
      
      document.execCommand('insertText', false, texto);
      
      const inputEvent = new Event('input', { bubbles: true });
      campoMensagem.dispatchEvent(inputEvent);
      
      setTimeout(() => {
        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
          bubbles: true,
          cancelable: true
        });
        campoMensagem.dispatchEvent(enterEvent);
        
        // Libera imediatamente após confirmar o envio
        console.log('✅ Mensagem enviada com sucesso!');
        this.showSuccessToast('Mensagem enviada!');
        this.isSending = false;
        console.log('🔓 Liberando para novos envios...');

        // Fallback opcional (não bloqueia novos envios)
        setTimeout(() => {
          if (botaoEnviar && !this.isSending) {
            botaoEnviar.click();
            console.log('✅ Confirmação adicional de envio');
          }
        }, 200);
      }, 200);
    } catch (error) {
      console.error('Erro durante envio:', error);
      this.isSending = false;
      if (tentativa < MAX_TENTATIVAS) {
        this.enviarParaWhatsApp(texto, tentativa + 1);
      } else {
        this.showErrorToast('Erro ao enviar mensagem');
      }
    }
  }

  renderScriptList() {
    try {
      const categoryFilter = document.querySelector('.jet-category-filter').value;
      const searchTerm = document.querySelector('.jet-search-input').value.toLowerCase();
      
      const filteredScripts = this.scripts.filter(script => {
        const matchesCategory = !categoryFilter || 
          (script.categoria && script.categoria.toLowerCase() === categoryFilter.toLowerCase());
        
        const matchesSearch = !searchTerm || 
          (script.titulo && script.titulo.toLowerCase().includes(searchTerm)) || 
          (script.conteudo && script.conteudo.toLowerCase().includes(searchTerm));
        
        return matchesCategory && matchesSearch;
      });

      const scriptsList = document.querySelector('.jet-scripts-list');
      scriptsList.innerHTML = '';

      if (filteredScripts.length === 0) {
        scriptsList.innerHTML = '<p class="jet-no-scripts">Nenhum script encontrado</p>';
        return;
      }

      filteredScripts.forEach(script => {
        const scriptItem = document.createElement('div');
        scriptItem.className = 'jet-script-item';
        scriptItem.innerHTML = `
          <div class="jet-script-item-header">
            <span class="jet-script-item-title">${script.titulo || 'Sem título'}</span>
            <span class="jet-script-item-category jet-category-${script.categoria || 'outros'}">
              ${this.getCategoryLabel(script.categoria)}
            </span>
          </div>
          <div class="jet-script-item-content">${(script.conteudo || '').substring(0, 100)}${script.conteudo && script.conteudo.length > 100 ? '...' : ''}</div>
          <div class="jet-script-item-actions">
            <button class="jet-use-btn" data-id="${script.id}">Usar</button>
            <button class="jet-edit-btn" data-id="${script.id}">Editar</button>
            <button class="jet-delete-btn" data-id="${script.id}">Excluir</button>
          </div>
        `;
        scriptsList.appendChild(scriptItem);
      });

      document.querySelectorAll('.jet-use-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const script = this.scripts.find(s => s.id === parseInt(btn.dataset.id));
          if (script) this.useScript(script.conteudo);
        });
      });

      document.querySelectorAll('.jet-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.setupEditScript(parseInt(btn.dataset.id));
        });
      });

      document.querySelectorAll('.jet-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.deleteScript(parseInt(btn.dataset.id));
        });
      });

    } catch (error) {
      console.error("Erro ao renderizar scripts:", error);
      this.showErrorToast("Erro ao carregar scripts");
    }
  }

  setupEditScript(scriptId) {
    const script = this.scripts.find(s => s.id === scriptId);
    if (!script) {
      this.showErrorToast("Script não encontrado para edição");
      return;
    }

    this.isEditing = true;
    this.currentEditId = scriptId;

    document.querySelector('.jet-script-title').value = script.titulo || '';
    document.querySelector('.jet-script-content').value = script.conteudo || '';
    document.querySelector('.jet-script-category').value = script.categoria || 'vendas';

    document.querySelector('.jet-cancel-edit').style.display = 'inline-block';

    document.querySelector('.jet-tab-btn[data-tab="create"]').click();

    const saveBtn = document.querySelector('.jet-save-script');
    saveBtn.textContent = 'Atualizar Script';
    saveBtn.onclick = () => this.saveScript();
  }

  cancelEdit() {
    this.isEditing = false;
    this.currentEditId = null;
    this.clearForm();
    document.querySelector('.jet-tab-btn[data-tab="list"]').click();
  }

  getCategoryLabel(category) {
    const labels = {
      'vendas': 'Vendas',
      'suporte': 'Suporte',
      'financeiro': 'Financeiro',
      'outros': 'Outros'
    };
    return labels[category] || category;
  }

  clearForm() {
    document.querySelector('.jet-script-title').value = '';
    document.querySelector('.jet-script-content').value = '';
    document.querySelector('.jet-script-category').value = 'vendas';
    
    const saveBtn = document.querySelector('.jet-save-script');
    saveBtn.textContent = 'Salvar Script';
    saveBtn.onclick = () => this.saveScript();
    
    document.querySelector('.jet-cancel-edit').style.display = 'none';
    
    this.isEditing = false;
    this.currentEditId = null;
    this.saving = false;
  }

  showSuccessToast(message) {
    const toast = document.createElement('div');
    toast.className = 'jet-toast success';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  showErrorToast(message) {
    const toast = document.createElement('div');
    toast.className = 'jet-toast error';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  }

  initEvents() {
    document.querySelectorAll('.jet-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        btn.style.transform = 'scale(0.98)';
        setTimeout(() => { btn.style.transform = 'scale(1)'; }, 100);

        document.querySelectorAll('.jet-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.jet-tab-pane').forEach(p => p.classList.remove('active'));
        
        btn.classList.add('active');
        this.currentTab = btn.dataset.tab;
        document.getElementById(this.currentTab).classList.add('active');
        
        if (this.currentTab === 'create') {
          setTimeout(() => {
            document.querySelector('.jet-script-title').focus();
          }, 50);
        }
      });
    });

    document.querySelector('.jet-category-filter').addEventListener('change', () => {
      this.renderScriptList();
    });

    document.querySelector('.jet-search-input').addEventListener('input', () => {
      this.renderScriptList();
    });

    document.querySelector('.jet-save-script').addEventListener('click', () => {
      this.saveScript();
    });

    document.querySelector('.jet-cancel-edit').addEventListener('click', () => {
      this.cancelEdit();
    });
  }
}

// Armazena a instância globalmente
window.scriptManagerInstance = new ScriptManager();

// Listener para mensagens
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "enviarMensagem" && window.scriptManagerInstance) {
    window.scriptManagerInstance.enviarParaWhatsApp(request.texto);
    sendResponse({ status: "processing" });
  }
  return true;
});

// Carrega a configuração e inicializa
fetch(chrome.runtime.getURL('config.json'))
  .then(response => response.json())
  .then(config => {
    document.querySelector('.jet-chat-iframe').src = config.chatIframeUrl;

    // Eventos do botão do Chat
    chatBtn.addEventListener('click', () => {
      const isOpening = chatContainer.style.display === 'none';
      chatContainer.style.display = isOpening ? 'flex' : 'none';
      scriptsContainer.style.display = 'none';
      
      chatBtn.classList.remove('active-btn');
      scriptsBtn.classList.remove('active-btn');
      
      if (isOpening) {
        chatBtn.classList.add('active-btn');
      }
    });

    // Eventos do botão de Scripts
    scriptsBtn.addEventListener('click', () => {
      const isOpening = scriptsContainer.style.display === 'none';
      scriptsContainer.style.display = isOpening ? 'flex' : 'none';
      chatContainer.style.display = 'none';
      
      chatBtn.classList.remove('active-btn');
      scriptsBtn.classList.remove('active-btn');
      
      if (isOpening) {
        scriptsBtn.classList.add('active-btn');
        chatBtn.classList.add('active-chat-btn');
        if (!window.scriptManagerInstance) {
          window.scriptManagerInstance = new ScriptManager();
        }
      }
    });

    // Fechar Chat
    chatContainer.querySelector('.jet-close-btn').addEventListener('click', () => {
      chatContainer.style.display = 'none';
      chatBtn.classList.remove('active-btn');
    });

    // Minimizar Chat
    chatContainer.querySelector('.jet-minimize-btn').addEventListener('click', () => {
      const iframe = chatContainer.querySelector('.jet-chat-iframe');
      iframe.style.display = iframe.style.display === 'none' ? 'block' : 'none';
    });

    // Fechar Scripts
    scriptsContainer.querySelector('.jet-close-btn').addEventListener('click', () => {
      scriptsContainer.style.display = 'none';
      scriptsBtn.classList.remove('active-btn');
      chatBtn.classList.remove('active-chat-btn');
    });
  })
  .catch(error => {
    console.error('Erro ao carregar configurações:', error);
    document.querySelector('.jet-chat-iframe').src = 'about:blank';
  });