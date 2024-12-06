class App {
  constructor() {
    const output = document.querySelector('#messageOutput');
    const increaseButton = document.querySelector('#btn-increase');
    const decreaseButton = document.querySelector('#btn-decrease');
    const usernameLabel = document.querySelector('#username');
    const counterLabel = document.querySelector('#counter');

    // When the Devvit app sends a message with `context.ui.webView.postMessage`, this will be triggered
    window.addEventListener('message', (ev) => {
      const { type, data } = ev.data;
      console.log({ type, data })

      // Reserved type for messages sent via `context.ui.webView.postMessage`
      if (type === 'devvit-message') {
        const { message } = data;

        // Always output full message
        output.replaceChildren(JSON.stringify(message, undefined, 2));

        if (message.type === 'user') {
          usernameLabel.innerText = message.value
        }

        if (message.type === 'count') {
          counterLabel.innerText = message.value;
        }
      }
    });

    increaseButton.addEventListener('click', () => {
      // Sends a message to the Devvit app
      const newCountValue = String(Number(document.querySelector('#counter').textContent) + 1)
      counterLabel.innerText = newCountValue;
      window.parent?.postMessage(
        { type: 'updateCounter', value: newCountValue },
        '*'
      );
    });

    decreaseButton.addEventListener('click', () => {
      const newCountValue = String(Number(document.querySelector('#counter').textContent) - 1)
      counterLabel.innerText = newCountValue;
      window.parent?.postMessage(
        { type: 'updateCounter', value: newCountValue },
        '*'
      );
    });
  }
}

new App();
