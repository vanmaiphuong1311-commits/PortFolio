// chatbot_sena.js  v2 — fixed SVG IDs + conversation memory + smart system prompt
// Usage: add to index.html
//   <link rel="stylesheet" href="chatbot_sena.css" />
//   <script src="chatbot_sena.js" defer></script>

(function () {

  // ─── CONFIG ────────────────────────────────────────────────────────────────
  const N8N_WEBHOOK_URL = "https://n8n.yecneu.com/webhook/sena"; // ← paste your n8n URL

  // Max messages to keep in memory (older ones are trimmed to save tokens)
  const MAX_HISTORY = 20;

  // ─── SYSTEM PROMPT — bộ não của Sena ──────────────────────────────────────
  const SYSTEM_PROMPT = `Bạn là một AI assistant thông minh, thân thiện và duyên dáng, đại diện cho Mai Phương, tên tiếng anh là Sena. 

## Tính cách & Phong cách giao tiếp
- Trò chuyện tự nhiên, ấm áp, đôi khi dí dỏm nhẹ nhàng
- Trả lời súc tích nhưng đầy đủ thông tin (3-5 câu cho câu hỏi thông thường)
- Dùng tiếng Việt hoặc tiếng Anh tùy theo ngôn ngữ người hỏi
- Không trả lời cứng nhắc như robot, hãy tự nhiên như một người bạn thông minh
- Có thể dùng emoji nhẹ nhàng (✨ 😊 📊) nhưng không lạm dụng
- Nhớ toàn bộ lịch sử cuộc trò chuyện và duy trì mạch hội thoại liền mạch

## Thông tin về chủ nhân (Van Thi Mai Phuong / Sena)
**Thông tin cơ bản:**
- Họ tên: Van Thi Mai Phuong, biệt danh Sena
- Ngày sinh: 13/11/2007
- MBTI: INTJ
- Trái cây yêu thích: Xoài
- Sở thích: ăn và nấu ăn, đi bộ, yoga.
- Trường: Đại học Kinh tế Quốc dân (NEU), Hà Nội
- Chuyên ngành: Tài chính Ngân hàng (Cử nhân)
- Email: vanmaiphuong1311@gmail.com
- SĐT: (+84) 815 787 584
- LinkedIn: https://www.linkedin.com/in/mai-phuong-van-thi-381176279/

**Kỹ năng:**
- Phân tích dữ liệu (Excel, Python cơ bản)
- Tư duy phản biện & Giải quyết vấn đề
- Tiếng Anh C1
- Phân tích case kinh doanh

**Kinh nghiệm:**
- Từ 10/2025 – hiện tại: Ban Chuyên môn, Câu lạc bộ Nhà Kinh tế trẻ (YEC) — dẫn dắt team Marketing & Chiến lược, đạt Best Team trong NEU Business Month
- 4/2024 – 2025: Founder, The Economics Mastery — xây dựng cộng đồng 100+ thành viên chia sẻ kiến thức kinh doanh

**Dự án nổi bật:**
1. Airbnb Market Development: phân tích dataset NYC Airbnb, tối ưu CAC/LTV, chiến lược mở rộng cho host địa phương
2. SiamDairy Thailand Case Study: phân tích vị thế thị trường, đề xuất chiến lược cạnh tranh và mở rộng trong ngành sữa Thái Lan

**Mục tiêu sự nghiệp:**
- Ngắn hạn: củng cố kỹ năng phân tích dữ liệu, mô hình tài chính, giải case
- Dài hạn: làm việc trong tư vấn chiến lược hoặc corporate strategy

**Tính cách:**
- Chủ động, tư duy phân tích, cấu trúc rõ ràng
- Thích học qua các bài toán kinh doanh thực tế
- Coi trọng sự rõ ràng, tác động và cải tiến liên tục
- INTJ: có tầm nhìn dài hạn, độc lập, quyết đoán, đôi khi thẳng thắn

## Phạm vi trả lời
Bạn có thể và nên trả lời:
1. **Câu hỏi về Mai Phuong/Sena**: hồ sơ, kỹ năng, kinh nghiệm, tính cách, dự án, mục tiêu
2. **Kiến thức kinh tế - xã hội**: kinh tế vĩ mô/vi mô, tài chính, ngân hàng, thị trường, marketing, chiến lược kinh doanh, case study
3. **Câu hỏi thông thường**: cuộc sống, học tập, kỹ năng mềm
4. **Câu hỏi trong mạch hội thoại trước đó**: nhớ và tiếp nối tự nhiên

Dùng tiếng Việt hoặc tiếng Anh tùy theo ngôn ngữ người hỏi" > Thành: "Luôn luôn phản hồi bằng tiếng Việt hoàn chỉnh và tự nhiên, tuyệt đối không chèn tiếng nước ngoài (như tiếng Anh, tiếng Trung, tiếng Pháp) trừ khi người dùng yêu cầu. Tuyệt đối không bắt đầu câu trả lời bằng các ký tự lạ như dấu bằng (=).
Khi không chắc về thông tin cá nhân không có trong hồ sơ, hãy nói thật thà thay vì bịa.`;

  // ─── CONVERSATION MEMORY ───────────────────────────────────────────────────
  let conversationHistory = []; // [{role: "user"|"assistant", content: "..."}]

  // ─── SVG helper — tạo unique ID để tránh conflict gradient ────────────────
  let svgCounter = 0;
  function makeSenaSVG(size = 80) {
    const id = `sg${++svgCounter}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="${size}" height="${size}">
  <defs>
    <radialGradient id="fG${id}" cx="50%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#F5E9DA"/>
      <stop offset="100%" stop-color="#E8CFAB"/>
    </radialGradient>
    <radialGradient id="hG${id}" cx="50%" cy="20%" r="60%">
      <stop offset="0%" stop-color="#3A0A12"/>
      <stop offset="100%" stop-color="#1A0308"/>
    </radialGradient>
  </defs>
  <ellipse cx="40" cy="30" rx="22" ry="26" fill="url(#hG${id})"/>
  <rect x="33" y="52" width="14" height="10" rx="3" fill="url(#fG${id})"/>
  <ellipse cx="40" cy="68" rx="18" ry="8" fill="#4B0F1A"/>
  <path d="M22 68 Q40 58 58 68" fill="#6A1A27"/>
  <path d="M27 65 Q40 60 53 65" stroke="#C9A96E" stroke-width="1.5" fill="none"/>
  <ellipse cx="40" cy="34" rx="18" ry="20" fill="url(#fG${id})"/>
  <ellipse cx="40" cy="15" rx="20" ry="10" fill="url(#hG${id})"/>
  <path d="M20 20 Q22 10 28 14 Q30 8 35 12 Q37 6 40 10 Q43 6 45 12 Q50 8 52 14 Q58 10 60 20" fill="url(#hG${id})"/>
  <path d="M22 28 Q16 30 18 42 Q20 36 24 35" fill="url(#hG${id})"/>
  <path d="M58 28 Q64 30 62 42 Q60 36 56 35" fill="url(#hG${id})"/>
  <ellipse cx="32" cy="34" rx="4" ry="4.5" fill="#1A0308"/>
  <ellipse cx="48" cy="34" rx="4" ry="4.5" fill="#1A0308"/>
  <circle cx="30.5" cy="32.5" r="1.2" fill="white" opacity="0.9"/>
  <circle cx="46.5" cy="32.5" r="1.2" fill="white" opacity="0.9"/>
  <path d="M28 30.5 Q29 28 30 29.5" stroke="#1A0308" stroke-width="0.8" fill="none"/>
  <path d="M32 29.5 Q33 27 34 29" stroke="#1A0308" stroke-width="0.8" fill="none"/>
  <path d="M44 29.5 Q45 27 46 29" stroke="#1A0308" stroke-width="0.8" fill="none"/>
  <path d="M48 30.5 Q49 28 50 29.5" stroke="#1A0308" stroke-width="0.8" fill="none"/>
  <path d="M27 29 Q32 26.5 36 28.5" stroke="#3A0A12" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M44 28.5 Q48 26.5 53 29" stroke="#3A0A12" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <ellipse cx="40" cy="40" rx="2" ry="1.2" fill="#D4A882" opacity="0.6"/>
  <path d="M35 45 Q40 49.5 45 45" stroke="#C9A96E" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <ellipse cx="27" cy="42" rx="4.5" ry="2.5" fill="#E8A0A0" opacity="0.35"/>
  <ellipse cx="53" cy="42" rx="4.5" ry="2.5" fill="#E8A0A0" opacity="0.35"/>
  <circle cx="22" cy="38" r="2" fill="#C9A96E"/>
  <path d="M22 40 L22 44" stroke="#C9A96E" stroke-width="1.2"/>
  <circle cx="22" cy="44.5" r="1.2" fill="#C9A96E"/>
  <circle cx="58" cy="38" r="2" fill="#C9A96E"/>
  <path d="M58 40 L58 44" stroke="#C9A96E" stroke-width="1.2"/>
  <circle cx="58" cy="44.5" r="1.2" fill="#C9A96E"/>
</svg>`;
  }

  // ─── INJECT WIDGET HTML ────────────────────────────────────────────────────
  const widget = document.createElement("div");
  widget.id = "sena-chat-widget";
  widget.innerHTML = `
    <button id="sena-fab" aria-label="Chat with Sena" title="Chat with Sena">
      <div class="sena-fab-avatar">${makeSenaSVG(56)}</div>
      <span class="sena-pulse-ring"></span>
    </button>

    <div id="sena-chat-window" class="sena-chat-hidden">
      <div class="sena-chat-header">
        <div class="sena-header-left">
          <div class="sena-header-avatar">${makeSenaSVG(42)}</div>
          <div>
            <div class="sena-header-name">Sena</div>
            <div class="sena-header-status">
              <span class="sena-dot"></span>Online
            </div>
          </div>
        </div>
        <div class="sena-header-actions">
          <button class="sena-clear-btn" title="Xoá lịch sử chat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
          </button>
          <button class="sena-close-btn" aria-label="Close">&#x2715;</button>
        </div>
      </div>

      <div class="sena-chat-body" id="sena-chat-body"></div>

      <div class="sena-chat-footer">
        <input id="sena-input" type="text" placeholder="Nhắn tin với Sena..." autocomplete="off" maxlength="500"/>
        <button id="sena-send-btn" aria-label="Send">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>`;

  document.body.appendChild(widget);

  // ─── ELEMENT REFS ──────────────────────────────────────────────────────────
  const fab       = document.getElementById("sena-fab");
  const win       = document.getElementById("sena-chat-window");
  const closeBtn  = win.querySelector(".sena-close-btn");
  const clearBtn  = win.querySelector(".sena-clear-btn");
  const input     = document.getElementById("sena-input");
  const sendBtn   = document.getElementById("sena-send-btn");
  const chatBody  = document.getElementById("sena-chat-body");

  // ─── WELCOME MESSAGE ───────────────────────────────────────────────────────
  function showWelcome() {
    chatBody.innerHTML = "";
    renderBotMsg("Xin chào! Mình là Sena ✨<br>Bạn muốn biết gì về Mai Phuong — kỹ năng, kinh nghiệm, dự án — hay hỏi về kinh tế, kinh doanh đều được nhé! 😊");
  }
  showWelcome();

  // ─── EVENT LISTENERS ───────────────────────────────────────────────────────
  fab.addEventListener("click", () => {
    const isHidden = win.classList.toggle("sena-chat-hidden");
    if (!isHidden) { input.focus(); chatBody.scrollTop = chatBody.scrollHeight; }
  });

  closeBtn.addEventListener("click", () => win.classList.add("sena-chat-hidden"));

  clearBtn.addEventListener("click", () => {
    conversationHistory = [];
    showWelcome();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  });

  sendBtn.addEventListener("click", handleSend);

  // ─── RENDER HELPERS ───────────────────────────────────────────────────────
  function renderBotMsg(html) {
    const el = document.createElement("div");
    el.className = "sena-msg sena-msg-bot";
    el.innerHTML = `
      <div class="sena-msg-avatar">${makeSenaSVG(32)}</div>
      <div class="sena-msg-bubble">${html}</div>`;
    chatBody.appendChild(el);
    chatBody.scrollTop = chatBody.scrollHeight;
    return el;
  }

  function renderUserMsg(text) {
    const escaped = text.replace(/</g,"&lt;").replace(/>/g,"&gt;");
    const el = document.createElement("div");
    el.className = "sena-msg sena-msg-user";
    el.innerHTML = `<div class="sena-msg-bubble">${escaped}</div>`;
    chatBody.appendChild(el);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function renderTyping() {
    const el = renderBotMsg('<span class="sena-typing"><span></span><span></span><span></span></span>');
    el.id = "sena-typing-indicator";
    return el;
  }

  // ─── SEND & FETCH ──────────────────────────────────────────────────────────
  async function handleSend() {
    const text = input.value.trim();
    if (!text || sendBtn.disabled) return;

    input.value = "";
    sendBtn.disabled = true;
    input.disabled  = true;

    renderUserMsg(text);

    // Add to history BEFORE sending
    conversationHistory.push({ role: "user", content: text });

    // Trim old history to keep context window manageable
    if (conversationHistory.length > MAX_HISTORY) {
      conversationHistory = conversationHistory.slice(conversationHistory.length - MAX_HISTORY);
    }

    const typingEl = renderTyping();

    try {
      const payload = {
        systemPrompt: SYSTEM_PROMPT,
        messages: conversationHistory   // full history sent to n8n
      };

      const res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const reply = (data.output || data.reply || data.text || data.message || "").trim()
                 || "Mình chưa hiểu rõ câu hỏi này, bạn thử diễn đạt lại nhé! 😊";

      typingEl.remove();

      // Format reply: convert **bold** and newlines
      const formatted = reply
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br>");

      renderBotMsg(formatted);

      // Add assistant reply to history
      conversationHistory.push({ role: "assistant", content: reply });

    } catch (err) {
      typingEl.remove();
      renderBotMsg("Oops! Mình đang gặp sự cố kết nối. Bạn thử lại sau nhé 🙏");
      // Remove the failed user message from history
      conversationHistory.pop();
    } finally {
      sendBtn.disabled = false;
      input.disabled   = false;
      input.focus();
    }
  }

})();
