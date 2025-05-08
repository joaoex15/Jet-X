document.addEventListener('DOMContentLoaded', () => {
  document.getElementById("enviarBtn").addEventListener("click", async () => {
      const mensagem = document.getElementById("mensagens").value;

      if (!mensagem) {
          alert("Por favor, selecione uma mensagem!");
          return;
      }

      try {
          const [tab] = await chrome.tabs.query({
              active: true,
              currentWindow: true,
              url: "https://web.whatsapp.com/*"
          });

          if (!tab) {
              alert("Por favor, abra o WhatsApp Web em uma guia primeiro!");
              return;
          }

          chrome.tabs.sendMessage(tab.id, {
              action: "enviarMensagem",
              texto: mensagem
          });
      } catch (error) {
          console.error("Erro no popup:", error);
          alert("Ocorreu um erro. Verifique o console.");
      }
  });
});
