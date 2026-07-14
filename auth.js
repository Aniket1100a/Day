/* ============================================================
   💌 loveGate — a fun little lock only you two can open
   ============================================================
   How it works:
   - A handful of "only we'd know this" questions.
   - Get ANY ONE of them right and the page unlocks.
   - Answers are stored below as SHA-256 hashes, not plain text,
     so someone glancing at view-source can't just read them off.
     (This is a cute obscurity gate, not real security — a
     determined person could still brute-force it. That's fine
     for what this is.)
   - Once unlocked on a device, it stays unlocked there
     (uses localStorage) — no need to re-solve it every visit.

   👋 QUICK EDIT ZONE — add/remove questions here.
   To add a new question:
     1) Open generate-hash.html in a browser
     2) Type the answer, copy the hash it gives you
     3) Paste that hash into the "hashes" array below
   You can list multiple accepted hashes per question
   (different ways of phrasing the same answer).
   ============================================================ */
(function () {
  "use strict";

  const QUESTIONS = [
    {
      q: "Which beer did we drink together first? 🍺",
      hashes: [
        "3017067bca0861d7b9d04bce7683ca163f33cae48d2b63b677250bf1d13e5f78"
      ]
    },
    {
      q: "Be honest — what did you think of me the first time you saw me? 👀",
      hashes: [
        "b67cab457e406488e88a0ebd4aea395d9b8c8ea72ab3e905f4f86ab698a9eea5",
        "8f585f1c90c5003b7009fa9cf5522613f740a425f3b846887d3342c3de94a6e0",
        "c8c1aeda3813089b73b54657ca2ebf9c0aa079ae0c37baa3894977aa613048dd"
      ]
    },
    {
      q: "Where did we go on our first trip together? ✈️",
      hashes: [
        "be18d618d22e955257974a9a519d047bd2fa7c32d5edb6f9ce6f6742d9253912"
      ]
    }
  ];

  const STORAGE_KEY = "loveGateUnlocked";

  // Already unlocked on this device — do nothing.
  if (localStorage.getItem(STORAGE_KEY)) return;

  // Not a secure context (e.g. opened as a local file) — crypto.subtle
  // won't exist. Fail safe by not locking, rather than breaking the page.
  if (!window.isSecureContext || !window.crypto || !window.crypto.subtle) {
    console.warn("loveGate: secure context required (https / localhost) — skipping lock.");
    return;
  }

  document.documentElement.classList.add("gate-locked");

  function normalize(str) {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ");
  }

  async function sha256Hex(str) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      html.gate-locked body{ overflow:hidden; height:100vh; }
      html.gate-locked body > *:not(#loveGate){
        filter: blur(22px) saturate(60%);
        transform: scale(1.035);
        pointer-events:none;
        user-select:none;
      }
      html.unlocking body > *:not(#loveGate){
        transition:
          filter 1.3s cubic-bezier(.16,1,.3,1),
          transform 1.3s cubic-bezier(.16,1,.3,1);
        filter: blur(0) saturate(100%);
        transform: scale(1);
      }
      #loveGate{
        position:fixed;
        inset:0;
        z-index:9999;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:24px;
        background:rgba(74,46,66,.55);
        backdrop-filter:blur(2px);
        font-family:'Manrope', sans-serif;
        opacity:1;
        transition:
          opacity .7s cubic-bezier(.16,1,.3,1),
          backdrop-filter .7s cubic-bezier(.16,1,.3,1);
      }
      #loveGate.fade-out{
        opacity:0;
        backdrop-filter:blur(0);
        pointer-events:none;
      }
      .gate-card{
        background:var(--paper, #FFFDFB);
        border:2.5px solid var(--blush, #FFD9E6);
        border-radius:26px;
        max-width:380px;
        width:100%;
        padding:32px 26px 28px;
        text-align:center;
        box-shadow:0 10px 0 var(--blush, #FFD9E6), 0 20px 40px rgba(74,46,66,.35);
        position:relative;
      }
      .gate-card.shake{ animation: gateShake .4s ease; }
      @keyframes gateShake{
        0%,100%{ transform:translateX(0); }
        20%{ transform:translateX(-8px); }
        40%{ transform:translateX(8px); }
        60%{ transform:translateX(-6px); }
        80%{ transform:translateX(6px); }
      }
      .gate-card.success{
        animation: cardOpen .7s cubic-bezier(.34,1.15,.64,1) forwards;
        pointer-events:none;
      }
      @keyframes cardOpen{
        0%{ transform:scale(1) translateY(0); opacity:1; }
        35%{ transform:scale(1.05) translateY(-2px); opacity:1; }
        100%{ transform:scale(.94) translateY(-18px); opacity:0; }
      }
      .gate-lock-icon{
        font-size:34px;
        display:block;
        margin-bottom:10px;
        transition:transform .4s cubic-bezier(.34,1.56,.64,1);
      }
      .gate-lock-icon.unlocked{ transform:scale(1.25) rotate(-12deg); }
      .gate-burst{
        position:absolute;
        inset:0;
        pointer-events:none;
        overflow:visible;
      }
      .gate-burst span{
        position:absolute;
        top:50%;
        left:50%;
        font-size:18px;
        opacity:0;
        transform:translate(-50%,-50%);
        transition:transform .9s cubic-bezier(.16,1,.3,1), opacity .9s ease;
      }
      .gate-card h2{
        font-family:'Fredoka', sans-serif;
        font-weight:600;
        font-size:20px;
        color:var(--pink-deep, #F0729A);
        margin:0 0 6px;
      }
      .gate-sub{
        font-size:13px;
        color:var(--plum, #6B4160);
        opacity:.75;
        margin:0 0 20px;
      }
      .gate-question{
        font-family:'Caveat', cursive;
        font-weight:600;
        font-size:22px;
        color:var(--plum, #6B4160);
        margin:0 0 16px;
        min-height:56px;
      }
      .gate-input{
        width:100%;
        padding:12px 16px;
        border-radius:16px;
        border:2px solid var(--blush, #FFD9E6);
        font-family:'Manrope', sans-serif;
        font-size:15px;
        outline:none;
        text-align:center;
        box-sizing:border-box;
      }
      .gate-input:focus{ border-color:var(--pink, #FF9EBB); }
      .gate-submit{
        display:block;
        width:100%;
        margin-top:14px;
        background:var(--pink-deep, #F0729A);
        color:#fff;
        border:none;
        padding:12px 16px;
        border-radius:18px;
        font-family:'Fredoka', sans-serif;
        font-weight:600;
        font-size:15px;
        cursor:pointer;
        box-shadow:0 4px 0 #C65A7C;
        transition:transform .15s ease;
      }
      .gate-submit:hover{ transform:translateY(-2px); }
      .gate-submit:active{ transform:translateY(2px); box-shadow:0 1px 0 #C65A7C; }
      .gate-msg{
        min-height:18px;
        margin-top:10px;
        font-size:13px;
        color:#C0335A;
        font-weight:600;
      }
      .gate-switch{
        display:inline-block;
        margin-top:16px;
        font-size:13px;
        color:var(--plum, #6B4160);
        opacity:.7;
        background:none;
        border:none;
        text-decoration:underline;
        cursor:pointer;
        font-family:'Manrope', sans-serif;
      }
      .gate-switch:hover{ opacity:1; }
    `;
    document.head.appendChild(style);
  }

  function buildOverlay() {
    const overlay = document.createElement("div");
    overlay.id = "loveGate";
    overlay.innerHTML = `
      <div class="gate-card" id="gateCard">
        <div class="gate-burst" id="gateBurst"></div>
        <span class="gate-lock-icon" id="gateLockIcon">🔒</span>
        <h2>Just for us</h2>
        <p class="gate-sub">Answer one of these correctly to get in</p>
        <p class="gate-question" id="gateQuestion"></p>
        <input class="gate-input" id="gateInput" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="your answer..." />
        <button class="gate-submit" id="gateSubmit">Unlock 💕</button>
        <p class="gate-msg" id="gateMsg"></p>
        <button class="gate-switch" id="gateSwitch">try a different question</button>
      </div>
    `;
    document.body.prepend(overlay);

    const card = overlay.querySelector("#gateCard");
    const qEl = overlay.querySelector("#gateQuestion");
    const input = overlay.querySelector("#gateInput");
    const submitBtn = overlay.querySelector("#gateSubmit");
    const msg = overlay.querySelector("#gateMsg");
    const switchBtn = overlay.querySelector("#gateSwitch");
    const lockIcon = overlay.querySelector("#gateLockIcon");
    const burstEl = overlay.querySelector("#gateBurst");

    function burstHearts() {
      const bits = ["🩷", "✨", "💕", "🌸", "⭐"];
      burstEl.innerHTML = "";
      for (let i = 0; i < 14; i++) {
        const s = document.createElement("span");
        s.textContent = bits[i % bits.length];
        burstEl.appendChild(s);
        const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.3;
        const dist = 90 + Math.random() * 50;
        requestAnimationFrame(() => {
          s.style.opacity = "1";
          s.style.transform = `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px)) scale(1.1)`;
          setTimeout(() => { s.style.opacity = "0"; }, 550);
        });
      }
    }

    let order = shuffle([...QUESTIONS.keys()]);
    let pos = 0;

    function showQuestion() {
      qEl.textContent = QUESTIONS[order[pos]].q;
      input.value = "";
      msg.textContent = "";
      input.focus();
    }

    function shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    switchBtn.addEventListener("click", () => {
      pos = (pos + 1) % order.length;
      showQuestion();
    });

    async function tryUnlock() {
      const val = input.value;
      if (!val.trim()) return;
      submitBtn.disabled = true;
      const hash = await sha256Hex(normalize(val));
      const correct = QUESTIONS[order[pos]].hashes.includes(hash);
      submitBtn.disabled = false;

      if (correct) {
        localStorage.setItem(STORAGE_KEY, "true");
        input.disabled = true;
        submitBtn.disabled = true;
        switchBtn.disabled = true;
        msg.style.color = "#3C9A6E";
        msg.textContent = "that's right 🩷 opening...";
        lockIcon.textContent = "🔓";
        lockIcon.classList.add("unlocked");
        burstHearts();

        // 1) card lifts and fades, body starts unblurring underneath — same beat
        setTimeout(() => {
          card.classList.add("success");
          document.documentElement.classList.add("unlocking");
        }, 280);

        // 2) once the card's basically gone, fade the dim backdrop out too
        setTimeout(() => {
          overlay.classList.add("fade-out");
        }, 780);

        // 3) clean up once everything's settled
        setTimeout(() => {
          document.documentElement.classList.remove("gate-locked", "unlocking");
          overlay.remove();
        }, 1550);
      } else {
        msg.style.color = "#C0335A";
        msg.textContent = "not quite — try again 💭";
        card.classList.remove("shake");
        void card.offsetWidth;
        card.classList.add("shake");
        input.select();
      }
    }

    submitBtn.addEventListener("click", tryUnlock);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") tryUnlock();
    });

    showQuestion();
  }

  document.addEventListener("DOMContentLoaded", () => {
    injectStyles();
    buildOverlay();
  });
})();
