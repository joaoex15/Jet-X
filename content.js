function escreverMensagemQuandoPronto(texto) {
    function verificarCampoDeMensagem() {
      const campoDeMensagem = document.querySelector('div[contenteditable="true"][data-tab="10"]');
  
      if (!campoDeMensagem) {
        console.log("⏳ Aguardando o campo de mensagem...");
        setTimeout(verificarCampoDeMensagem, 1000);
      } else {
        console.log("✅ Campo encontrado. Preparando para enviar mensagem...");
  
        setTimeout(() => {
          campoDeMensagem.focus();
          campoDeMensagem.innerHTML = '';
  
          // Inserir o texto no campo
          document.execCommand('insertText', false, texto);
  
          // Disparar evento input
          const eventoInput = new Event('input', {
            bubbles: true,
            cancelable: true
          });
          campoDeMensagem.dispatchEvent(eventoInput);
  
          // Simular Enter
          const enterEvent = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key: 'Enter',
            code: 'Enter',
            keyCode: 13,
            which: 13
          });
          campoDeMensagem.dispatchEvent(enterEvent);
  
          // Tentar clicar no botão de enviar imediatamente após
          setTimeout(() => {
            const botaoEnviar = document.querySelector('span[data-icon="send"]');
            if (botaoEnviar) {
              botaoEnviar.click();
              console.log("✅ Mensagem enviada clicando no botão.");
            } else {
              console.warn("⚠️ Botão de enviar não encontrado.");
            }
          }, 0); // sem atraso
  
        }, 1); // 3,5 segundos
      }
    }
  
    verificarCampoDeMensagem();
  }
  
  // Listener para receber mensagem do popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "enviarMensagem") {
      escreverMensagemQuandoPronto(request.texto);
    }
  });
  