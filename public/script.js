const chatForm = document.getElementById('chat-form');
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const themeToggle = document.getElementById('theme-toggle');
const micBtn = document.getElementById('mic-btn');
const stopMicBtn = document.getElementById('stop-mic');
const recordStatus = document.getElementById('record-status');
const body = document.body;

// Initialize conversation history
let conversation = [];
let mediaRecorder;
let audioChunks = [];

// --- Dark Mode Logic ---
const savedTheme = localStorage.getItem('theme') || 'light';
body.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
  const currentTheme = body.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
  const icon = themeToggle.querySelector('i');
  if (theme === 'dark') {
    icon.classList.replace('fa-moon', 'fa-sun');
  } else {
    icon.classList.replace('fa-sun', 'fa-moon');
  }
}

// --- Voice Recording Logic ---
micBtn.addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = () => {
        const base64Audio = reader.result.split(',')[1];
        sendChatMessage(null, base64Audio);
      };

      // Stop all tracks to free up the microphone
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.start();
    micBtn.classList.add('recording');
    recordStatus.classList.remove('hidden');
    userInput.placeholder = "Merekam suara...";
    userInput.disabled = true;
  } catch (err) {
    console.error("Gagal mengakses microphone:", err);
    alert("Gagal mengakses microphone. Pastikan izin diberikan.");
  }
});

stopMicBtn.addEventListener('click', () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    micBtn.classList.remove('recording');
    recordStatus.classList.add('hidden');
    userInput.placeholder = "Ketik pesan atau rekam suara...";
    userInput.disabled = false;
  }
});

// --- Chat Logic ---
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = userInput.value.trim();
  if (!text) return;
  sendChatMessage(text);
});

async function sendChatMessage(text, audioBase64 = null) {
  if (!text && !audioBase64) return;

  // 1. UI Updates
  if (text) {
    appendMessage('user', text);
    conversation.push({ role: 'user', text: text });
    userInput.value = '';
  } else if (audioBase64) {
    appendMessage('user', '🎤 [Pesan Suara]');
    // Record audio in conversation too? 
    // For Gemini API thread consistency, we send it as part of the next turn
  }

  const submitBtn = document.getElementById('send-btn');
  userInput.disabled = true;
  submitBtn.disabled = true;
  micBtn.disabled = true;

  const loadingMessageObj = appendMessage('bot', '<span class=\"thinking\">Sedang mendengarkan & berpikir... <i class=\"fas fa-ellipsis-h\"></i></span>');

  try {
    const payload = { conversation };
    if (audioBase64) {
      payload.audio = audioBase64;
    }

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    if (data.result) {
      loadingMessageObj.element.innerHTML = marked.parse(data.result);
      conversation.push({ role: 'model', text: data.result });
    } else {
      loadingMessageObj.element.innerText = 'Maaf, tidak ada respon yang diterima.';
    }
  } catch (error) {
    console.error('Fetch error:', error);
    loadingMessageObj.element.innerText = 'Gagal menghubungi server. Silakan coba lagi.';
  } finally {
    userInput.disabled = false;
    submitBtn.disabled = false;
    micBtn.disabled = false;
    userInput.focus();
    scrollToBottom();
  }
}

function appendMessage(sender, htmlContent) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('message-wrapper', `${sender}-wrapper`);

  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender);

  if (sender === 'user') {
    messageDiv.innerText = htmlContent;
  } else {
    messageDiv.innerHTML = htmlContent;
  }

  wrapper.appendChild(messageDiv);
  chatBox.appendChild(wrapper);
  scrollToBottom();

  return { wrapper, element: messageDiv };
}

function scrollToBottom() {
  chatBox.scrollTo({
    top: chatBox.scrollHeight,
    behavior: 'smooth'
  });
}
