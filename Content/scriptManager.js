class ScriptManager {
    constructor() {
      this.scripts = JSON.parse(localStorage.getItem('jet-scripts')) || [];
      this.currentTab = 'list';
      this.initEvents();
      this.renderScriptList();
    }
  
    initEvents() {
      // Troca de abas
      document.querySelectorAll('.jet-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          // Feedback visual
          btn.style.transform = 'scale(0.98)';
          setTimeout(() => { btn.style.transform = 'scale(1)'; }, 100);
  
          document.querySelectorAll('.jet-tab-btn').forEach(b => b.classList.remove('active'));
          document.querySelectorAll('.jet-tab-pane').forEach(p => p.classList.remove('active'));
          
          btn.classList.add('active');
          this.currentTab = btn.dataset.tab;
          document.getElementById(this.currentTab).classList.add('active');
          
          // Foco no campo de título ao criar novo script
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
  
      document.querySelector('.jet-search-input').addEventListener('input', (e) => {
        this.renderScriptList();
      });
  
      // Salvar script (com tecla Enter)
      document.querySelector('.jet-save-script').addEventListener('click', () => {
        this.saveScript();
      });
  
      document.querySelector('.jet-script-form').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && this.currentTab === 'create') {
          this.saveScript();
        }
      });
    }
  
    saveScript() {
      const title = document.querySelector('.jet-script-title').value.trim();
      const content = document.querySelector('.jet-script-content').value.trim();
      const category = document.querySelector('.jet-script-category').value;
  
      if (!title || !content) {
        this.showAlert('Preencha todos os campos obrigatórios');
        return;
      }
  
      const newScript = {
        id: Date.now(),
        titulo: title,
        conteudo: content,
        categoria: category,
        dataCriacao: new Date().toISOString()
      };
  
      this.scripts.unshift(newScript);
      this.saveToStorage();
      this.renderScriptList();
      this.clearForm();
      
      // Volta para a lista e mostra feedback
      document.querySelector('.jet-tab-btn[data-tab="list"]').click();
      this.showAlert('Script salvo com sucesso!', 'success');
    }
  
    deleteScript(id) {
      if (confirm('Tem certeza que deseja excluir este script?')) {
        this.scripts = this.scripts.filter(script => script.id !== id);
        this.saveToStorage();
        this.renderScriptList();
        this.showAlert('Script excluído com sucesso!', 'success');
      }
    }
  
    useScript(content) {
      // Implemente conforme sua necessidade
      console.log('Script usado:', content);
      this.showAlert(`Script copiado para área de transferência:\n\n${content}`, 'info');
      
      // Copia para área de transferência
      navigator.clipboard.writeText(content).catch(err => {
        console.error('Falha ao copiar:', err);
      });
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
        scriptsList.innerHTML = `
          <div class="jet-no-scripts">
            <img src="${chrome.runtime.getURL('assets/empty.png')}" alt="Nenhum script">
            <p>Nenhum script encontrado</p>
          </div>
        `;
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
            <span class="jet-script-item-date">
              ${new Date(script.dataCriacao).toLocaleDateString()}
            </span>
          </div>
          <div class="jet-script-item-content">
            ${script.conteudo.substring(0, 120)}${script.conteudo.length > 120 ? '...' : ''}
          </div>
          <div class="jet-script-item-actions">
            <button class="jet-use-btn" data-id="${script.id}" title="Usar script">
              <img src="${chrome.runtime.getURL('assets/use-icon.png')}" alt="Usar">
            </button>
            <button class="jet-delete-btn" data-id="${script.id}" title="Excluir script">
              <img src="${chrome.runtime.getURL('assets/delete-icon.png')}" alt="Excluir">
            </button>
          </div>
        `;
        scriptsList.appendChild(scriptItem);
      });
  
      // Eventos dos botões
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
  
    showAlert(message, type = 'error') {
      const alertBox = document.createElement('div');
      alertBox.className = `jet-alert jet-alert-${type}`;
      alertBox.textContent = message;
      
      document.body.appendChild(alertBox);
      
      setTimeout(() => {
        alertBox.classList.add('fade-out');
        setTimeout(() => alertBox.remove(), 500);
      }, 3000);
    }
  }
  
  // Exportação para módulos
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScriptManager;
  } else {
    // Para uso direto no navegador
    window.ScriptManager = ScriptManager;
  }