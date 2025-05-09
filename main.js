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
    <!-- Listagem de Scripts -->
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
    
    <!-- Criação de Script -->
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
        </div>
      </div>
    </div>
  </div>
`;
document.body.appendChild(scriptsContainer);

// Implementação do CRUD
class ScriptManager {
  constructor() {
    this.scripts = JSON.parse(localStorage.getItem('jet-scripts')) || [];
    this.currentTab = 'list';
    this.initEvents();
    this.renderScriptList();
  }

  initEvents() {
    // Troca de abas - versão melhorada
    document.querySelectorAll('.jet-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Feedback visual imediato
        btn.style.transform = 'scale(0.98)';
        setTimeout(() => { btn.style.transform = 'scale(1)'; }, 100);

        document.querySelectorAll('.jet-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.jet-tab-pane').forEach(p => p.classList.remove('active'));
        
        btn.classList.add('active');
        this.currentTab = btn.dataset.tab;
        document.getElementById(this.currentTab).classList.add('active');
        
        // Foco no primeiro campo quando muda para a aba de criação
        if (this.currentTab === 'create') {
          setTimeout(() => {
            document.querySelector('.jet-script-title').focus();
          }, 50);
        }
      });
    });

    // Filtros
    document.querySelector('.jet-category-filter').addEventListener('change', () => {
      this.renderScriptList();
    });

    document.querySelector('.jet-search-input').addEventListener('input', () => {
      this.renderScriptList();
    });

    // Salvar script
    document.querySelector('.jet-save-script').addEventListener('click', () => {
      this.saveScript();
    });
  }

  saveScript() {
    const title = document.querySelector('.jet-script-title').value.trim();
    const content = document.querySelector('.jet-script-content').value.trim();
    const category = document.querySelector('.jet-script-category').value;

    if (!title || !content) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const newScript = {
      id: Date.now(),
      titulo: title,
      conteudo: content,
      categoria: category
    };

    this.scripts.unshift(newScript);
    this.saveToStorage();
    this.renderScriptList();
    this.clearForm();
    
    // Volta para a lista
    document.querySelector('.jet-tab-btn[data-tab="list"]').click();
  }

  deleteScript(id) {
    if (confirm('Tem certeza que deseja excluir este script?')) {
      this.scripts = this.scripts.filter(script => script.id !== id);
      this.saveToStorage();
      this.renderScriptList();
    }
  }

  useScript(content) {
    // Implemente a lógica para enviar para o chat
    console.log('Script usado:', content);
    alert(`Script pronto para uso:\n\n${content}`);
  }

  renderScriptList() {
    const categoryFilter = document.querySelector('.jet-category-filter').value;
    const searchTerm = document.querySelector('.jet-search-input').value.toLowerCase();
    
    const filteredScripts = this.scripts.filter(script => {
      const matchesCategory = !categoryFilter || script.categoria === categoryFilter;
      const matchesSearch = !searchTerm || 
        script.titulo.toLowerCase().includes(searchTerm) || 
        script.conteudo.toLowerCase().includes(searchTerm);
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
          <span class="jet-script-item-title">${script.titulo}</span>
          <span class="jet-script-item-category jet-category-${script.categoria}">
            ${this.getCategoryLabel(script.categoria)}
          </span>
        </div>
        <div class="jet-script-item-content">${script.conteudo.substring(0, 100)}${script.conteudo.length > 100 ? '...' : ''}</div>
        <div class="jet-script-item-actions">
          <button class="jet-use-btn" data-id="${script.id}">Usar</button>
          <button class="jet-delete-btn" data-id="${script.id}">Excluir</button>
        </div>
      `;
      scriptsList.appendChild(scriptItem);
    });

    // Adiciona eventos aos botões
    document.querySelectorAll('.jet-use-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const script = this.scripts.find(s => s.id === parseInt(btn.dataset.id));
        this.useScript(script.conteudo);
      });
    });

    document.querySelectorAll('.jet-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.deleteScript(parseInt(btn.dataset.id));
      });
    });
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
  }

  saveToStorage() {
    localStorage.setItem('jet-scripts', JSON.stringify(this.scripts));
  }
}

// Carrega a configuração
fetch(chrome.runtime.getURL('config.json'))
  .then(response => response.json())
  .then(config => {
    // Configura o iframe do chat
    document.querySelector('.jet-chat-iframe').src = config.chatIframeUrl;

    // Eventos do botão do Chat
    chatBtn.addEventListener('click', () => {
      const isOpening = chatContainer.style.display === 'none';
      chatContainer.style.display = isOpening ? 'flex' : 'none';
      scriptsContainer.style.display = 'none';
      
      // Remove destaque de ambos os botões
      chatBtn.classList.remove('active-btn');
      scriptsBtn.classList.remove('active-btn');
      
      // Adiciona destaque se estiver abrindo
      if (isOpening) {
        chatBtn.classList.add('active-btn');
      }
    });

    // Eventos do botão de Scripts
    scriptsBtn.addEventListener('click', () => {
      const isOpening = scriptsContainer.style.display === 'none';
      scriptsContainer.style.display = isOpening ? 'flex' : 'none';
      chatContainer.style.display = 'none';
      
      // Remove destaque de ambos os botões
      chatBtn.classList.remove('active-btn');
      scriptsBtn.classList.remove('active-btn');
      
      // Adiciona destaque se estiver abrindo
      if (isOpening) {
        scriptsBtn.classList.add('active-btn');
        chatBtn.classList.add('active-chat-btn');
        // Inicializa o gerenciador de scripts quando aberto
        new ScriptManager();
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
  .catch(error => console.error('Erro ao carregar configurações:', error));