const launcher = document.getElementById("launcher");
const chatbox = document.getElementById("chatbox");
const toggleBtn = document.getElementById("toggleBtn");
const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const messagesDiv = document.getElementById("messages");
const form = document.getElementById("inputArea");

// TODO: Replace with your actual Vercel deployment URL after deploying the backend.
const API_URL = "https://chatgpt-atlas.vercel.app/api/chat";

function addMessage(role, text) {
  const div = document.createElement("div");
  div.className = `msg ${role}`;
  div.textContent = (role === "user" ? "You: " : role === "bot" ? "Atlas: " : "") + text;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function sendMessage(message) {
  if (!message) return;
  addMessage("user", message);
  userInput.value = "";
  const thinking = document.createElement("div");
  thinking.className = "msg system";
  thinking.textContent = "Atlas is thinking…";
  messagesDiv.appendChild(thinking);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    thinking.remove();
    addMessage("bot", data.reply ?? "No reply");
  } catch (err) {
    thinking.remove();
    addMessage("bot", "Error: Unable to reach Atlas server.");
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = userInput.value.trim();
  if (text) sendMessage(text);
});

sendBtn.addEventListener("click", () => {
  const text = userInput.value.trim();
  if (text) sendMessage(text);
});

userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const text = userInput.value.trim();
    if (text) sendMessage(text);
  }
});

launcher.addEventListener("click", () => {
  chatbox.classList.toggle("hidden");
});

toggleBtn.addEventListener("click", () => {
  chatbox.classList.toggle("minimized");
});

// Open chat by default on load
window.addEventListener("load", () => {
  chatbox.classList.remove("hidden");
  addMessage("system", "Welcome to ChatGPT Atlas! Ask me anything.");
});
