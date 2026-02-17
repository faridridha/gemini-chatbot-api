const chatForm = document.getElementById('chat-form');
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');

// Initialize conversation history
let conversation = [];

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const text = userInput.value.trim();
  if (!text) return;

  // 1. Add user message to chat box
  appendMessage('user', text);

  // Update conversation history for the API
  conversation.push({ role: 'user', text: text });

  userInput.value = '';

  // Disable input while processing
  const submitButton = chatForm.querySelector('button');
  userInput.disabled = true;
  submitButton.disabled = true;

  // 2. Show temporary "Thinking..." message
  const loadingMessage = appendMessage('bot', 'Thinking...');

  try {
    // 3. Send POST request to backend
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ conversation })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    // 4. Replace "Thinking..." with AI response
    if (data.result) {
      loadingMessage.innerText = data.result;

      // Update history with model response
      conversation.push({ role: 'model', text: data.result });
    } else {
      loadingMessage.innerText = 'Sorry, no response received.';
    }

  } catch (error) {
    console.error('Error fetching chat response:', error);
    loadingMessage.innerText = 'Failed to get response from server.';
  } finally {
    // Re-enable input
    userInput.disabled = false;
    submitButton.disabled = false;
    userInput.focus();

    // Ensure we are scrolled to bottom after the text update
    scrollToBottom();
  }
});

function appendMessage(sender, text) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender);
  messageDiv.innerText = text; // using innerText for safety against HTML injection

  // Clear floats hacks if necessary, but with the current CSS 
  // (floats inside a container with overflow: auto), simply appending is fine.
  // However, because they are floated, we might want a clearing element or ensure container handles it.
  // The provided CSS has .chat-box { overflow-y: auto }, which handles floats (BFC).

  chatBox.appendChild(messageDiv);
  scrollToBottom();
  return messageDiv; // Return the element so we can update it later
}

function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}
