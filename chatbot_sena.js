// chatbot_sena.js
// Drop this file into your project folder, then add to index.html:
// <link rel="stylesheet" href="chatbot_sena.css" />
// <script src="chatbot_sena.js" defer></script>

(function () {
  // ─── CONFIG ────────────────────────────────────────────────────────────────
  // Paste your n8n webhook URL here after setup (see GUIDE.md)
  const N8N_WEBHOOK_URL = "https://n8n.yecneu.com/webhook/sena";
  // ─── SENA MASCOT SVG ───────────────────────────────────────────────────────
  const SENA_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
  <defs>
    <radialGradient id="faceGrad" cx="50%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#F5E9DA"/>
      <stop offset="100%" stop-color="#E8CFAB"/>
    </radialGradient>
    <radialGradient id="hairGrad" cx="50%" cy="20%" r="60%">
      <stop offset="0%" stop-color="#3A0A12"/>
      <stop offset="100%" stop-color="#1A0308"/>
    </radialGradient>
  </defs>
  <!-- Hair back -->
  <ellipse cx="40" cy="30" rx="22" ry="26" fill="url(#hairGrad)"/>
  <!-- Neck -->
  <rect x="33" y="52" width="14" height="10" rx="3" fill="url(#faceGrad)"/>
  <!-- Collar / top -->
  <ellipse cx="40" cy="68" rx="18" ry="8" fill="#4B0F1A"/>
  <path d="M22 68 Q40 58 58 68" fill="#6A1A27"/>
  <!-- Gold collar accent -->
  <path d="M27 65 Q40 60 53 65" stroke="#C9A96E" stroke-width="1.5" fill="none"/>
  <!-- Face -->
  <ellipse cx="40" cy="34" rx="18" ry="20" fill="url(#faceGrad)"/>
  <!-- Hair top / fringe -->
  <ellipse cx="40" cy="15" rx="20" ry="10" fill="url(#hairGrad)"/>
  <path d="M20 20 Q22 10 28 14 Q30 8 35 12 Q37 6 40 10 Q43 6 45 12 Q50 8 52 14 Q58 10 60 20" fill="url(#hairGrad)"/>
  <!-- Side hair strands -->
  <path d="M22 28 Q16 30 18 42 Q20 36 24 35" fill="url(#hairGrad)"/>
  <path d="M58 28 Q64 30 62 42 Q60 36 56 35" fill="url(#hairGrad)"/>
  <!-- Eyes -->
  <ellipse cx="32" cy="34" rx="4" ry="4.5" fill="#1A0308"/>
  <ellipse cx="48" cy="34" rx="4" ry="4.5" fill="#1A0308"/>
  <!-- Eye shine -->
  <circle cx="30.5" cy="32.5" r="1.2" fill="white" opacity="0.9"/>
  <circle cx="46.5" cy="32.5" r="1.2" fill="white" opacity="0.9"/>
  <!-- Eyelashes -->
  <path d="M28 30.5 Q29 28 30 29.5" stroke="#1A0308" stroke-width="0.8" fill="none"/>
  <path d="M32 29.5 Q33 27 34 29" stroke="#1A0308" stroke-width="0.8" fill="none"/>
  <path d="M44 29.5 Q45 27 46 29" stroke="#1A0308" stroke-width="0.8" fill="none"/>
  <path d="M48 30.5 Q49 28 50 29.5" stroke="#1A0308" stroke-width="0.8" fill="none"/>
  <!-- Brows -->
  <path d="M27 29 Q32 26.5 36 28.5" stroke="#3A0A12" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M44 28.5 Q48 26.5 53 29" stroke="#3A0A12" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <!-- Nose -->
  <ellipse cx="40" cy="40" rx="2" ry="1.2" fill="#D4A882" opacity="0.6"/>
  <!-- Mouth / smile -->
  <path d="M35 45 Q40 49.5 45 45" stroke="#C9A96E" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <!-- Blush -->
  <ellipse cx="27" cy="42" rx="4.5" ry="2.5" fill="#E8A0A0" opacity="0.35"/>
  <ellipse cx="53" cy="42" rx="4.5" ry="2.5" fill="#E8A0A0" opacity="0.35"/>
  <!-- Gold earring -->
  <circle cx="22" cy="38" r="2" fill="#C9A96E"/>
  <path d="M22 40 L22 44" stroke="#C9A96E" stroke-width="1.2"/>
  <circle cx="22" cy="44.5" r="1.2" fill="#C9A96E"/>
  <circle cx="58" cy="38" r="2" fill="#C9A96E"/>
  <path d="M58 40 L58 44" stroke="#C9A96E" stroke-width="1.2"/>
  <circle cx="58" cy="44.5" r="1.2" fill="#C9A96E"/>
</svg>`;

  // ─── INJECT HTML ───────────────────────────────────────────────────────────
  const chatHTML = `
<div id="sena-chat-widget">
  <!-- Floating Button -->
  <button id="sena-fab" aria-label="Chat with Sena" title="Chat with Sena">
    <div class="sena-fab-avatar">${SENA_SVG}</div>
    <span class="sena-pulse-ring"></span>
  </button>

  <!-- Chat Window -->
  <div id="sena-chat-window" class="sena-chat-hidden">
    <div class="sena-chat-header">
      <div class="sena-header-left">
        <div class="sena-header-avatar">${SENA_SVG}</div>
        <div>
          <div class="sena-header-name">Sena</div>
          <div class="sena-header-status"><span class="sena-dot"></span>Online</div>
        </div>
      </div>
      <button class="sena-close-btn" aria-label="Close">×</button>
    </div>

    <div class="sena-chat-body" id="sena-chat-body">
      <!-- Welcome message -->
      <div class="sena-msg sena-msg-bot">
        <div class="sena-msg-avatar">${SENA_SVG}</div>
        <div class="sena-msg-bubble">
          Xin chào! Mình là Sena ✨<br>
          Bạn muốn biết gì về Mai Phuong? Hãy hỏi mình nhé — về kinh nghiệm, kỹ năng, hay dự án của cô ấy đều được!
        </div>
      </div>
    </div>

    <div class="sena-chat-footer">
      <input
        id="sena-input"
        type="text"
        placeholder="Nhập câu hỏi..."
        autocomplete="off"
      />
      <button id="sena-send-btn" aria-label="Send">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>
  </div>
</div>`;

  document.body.insertAdjacentHTML("beforeend", chatHTML);

  // ─── LOGIC ─────────────────────────────────────────────────────────────────
  const fab = document.getElementById("sena-fab");
  const win = document.getElementById("sena-chat-window");
  const closeBtn = win.querySelector(".sena-close-btn");
  const input = document.getElementById("sena-input");
  const sendBtn = document.getElementById("sena-send-btn");
  const body = document.getElementById("sena-chat-body");

  fab.addEventListener("click", () => {
    win.classList.toggle("sena-chat-hidden");
    if (!win.classList.contains("sena-chat-hidden")) input.focus();
  });
  closeBtn.addEventListener("click", () => win.classList.add("sena-chat-hidden"));

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  sendBtn.addEventListener("click", sendMessage);

  function appendMessage(role, text) {
    const isBotOrLoading = role === "bot" || role === "loading";
    const div = document.createElement("div");
    div.className = `sena-msg ${isBotOrLoading ? "sena-msg-bot" : "sena-msg-user"}`;
    if (role === "loading") div.id = "sena-loading-msg";

    if (isBotOrLoading) {
      div.innerHTML = `
        <div class="sena-msg-avatar">${SENA_SVG}</div>
        <div class="sena-msg-bubble">${role === "loading" ? '<span class="sena-typing"><span></span><span></span><span></span></span>' : text}</div>`;
    } else {
      div.innerHTML = `<div class="sena-msg-bubble">${text}</div>`;
    }
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    appendMessage("user", text);
    const loadingEl = appendMessage("loading", "");

    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      const reply = data.output || data.reply || data.text || data.message || "Mình chưa hiểu câu hỏi này, bạn thử hỏi lại nhé!";
      loadingEl.remove();
      appendMessage("bot", reply);
    } catch (err) {
      loadingEl.remove();
      appendMessage("bot", "Oops! Mình đang gặp sự cố kết nối. Bạn thử lại sau nhé 🙏");
    }
  }
})();
