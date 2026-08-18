// ===========================================================================
// MindEase — accessible web version of the Figma prototype
// Hash-routed single-page app. Every screen from the original design.
// Focus is moved to each new screen's heading; state lives in localStorage.
// ===========================================================================
(function () {
  const app = document.getElementById("app");
  const backBtn = document.getElementById("back-btn");
  const menuBtn = document.getElementById("menu-btn");

  // ---- state ---------------------------------------------------------------
  const DB = {
    get(k, fallback) {
      try { const v = localStorage.getItem("me_" + k); return v ? JSON.parse(v) : fallback; }
      catch { return fallback; }
    },
    set(k, v) { try { localStorage.setItem("me_" + k, JSON.stringify(v)); } catch {} },
  };

  const MOODS = [
    { emoji: "😊", label: "Happy" },
    { emoji: "😢", label: "Sad" },
    { emoji: "😐", label: "Indifferent" },
    { emoji: "😠", label: "Angry" },
    { emoji: "😴", label: "Sleepy" },
    { emoji: "😨", label: "Worried" },
  ];

  const PRODUCTS = [
    { id: 1, name: "MindEase Book", price: 16.99, emoji: "📖" },
    { id: 2, name: "Audiobook", price: 7.99, emoji: "🎧" },
    { id: 3, name: "Calming Candle", price: 24.99, emoji: "🕯️" },
    { id: 4, name: "Calming Dough", price: 10.99, emoji: "🫙" },
    { id: 5, name: "Fidget Cube", price: 16.99, emoji: "🧊" },
    { id: 6, name: "Stress Ball", price: 2.99, emoji: "🥎" },
    { id: 7, name: "Coloring Book", price: 12.99, emoji: "🖍️" },
    { id: 8, name: "Sticker Pack", price: 4.99, emoji: "✨" },
  ];

  const ARTICLES = [
    { t: "Depression", d: "Signs, causes, and treatment options — National Institute of Mental Health.", u: "https://www.nimh.nih.gov/health/topics/depression" },
    { t: "Anxiety Disorders", d: "Understanding anxiety and when to seek help — NIMH.", u: "https://www.nimh.nih.gov/health/topics/anxiety-disorders" },
    { t: "Managing Stress", d: "\u201cI'm So Stressed Out!\u201d — a practical NIMH fact sheet on stress vs. anxiety.", u: "https://www.nimh.nih.gov/health/publications/so-stressed-out-fact-sheet" },
    { t: "Caring for Your Mental Health", d: "Self-care ideas that actually help, from NIMH.", u: "https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health" },
    { t: "Mindfulness", d: "What mindfulness is and how to start — NIH News in Health.", u: "https://newsinhealth.nih.gov/2021/06/mindfulness-your-health" },
    { t: "Sleep & Mental Health", d: "How sleep and mood shape each other — Sleep Foundation.", u: "https://www.sleepfoundation.org/mental-health" },
    { t: "Healthy Relationships", d: "What makes relationships work — American Psychological Association.", u: "https://www.apa.org/topics/marriage-relationships" },
  ];

  const money = (n) => "$" + n.toFixed(2);
  const userName = () => DB.get("name", "") || "Friend";

  // ---- taco mascot (the official sleepy taco) ------------------------------
  const tacoBlock = `
    <div class="taco-wrap">
      <img src="images/sleepy-taco.png" alt="The MindEase mascot: a sleepy taco" width="132" height="129">
    </div>
    <p class="tagline">Empower your mind, ease your journey</p>`;

  // ---- toast ---------------------------------------------------------------
  let toastTimer;
  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  // ---- screens -------------------------------------------------------------
  const SCREENS = {
    splash: () => ({
      chrome: { back: false, menu: false },
      html: `
        <button class="splash-tap" id="splash-tap" type="button" aria-label="MindEase. Empower your mind, ease your journey. Tap to continue.">
          <span class="splash-blob b1" aria-hidden="true"></span>
          <span class="splash-blob b2" aria-hidden="true"></span>
          <span class="splash-blob b3" aria-hidden="true"></span>
          <span class="wordmark" aria-hidden="true">MindEase</span>
          <span class="splash-tag" aria-hidden="true">Empower your mind, ease your journey</span>
          <img class="splash-taco" src="images/sleepy-taco.png" alt="" width="200" height="195">
          <span class="tap-cue" aria-hidden="true"><span class="tap-line"></span>Tap to continue…</span>
        </button>
        <p class="notice"><strong>Demo note:</strong> MindEase is a portfolio prototype, not a real medical service, and is not a substitute for professional care. If you're in crisis in the US, you can call or text <strong>988</strong> any time.</p>
        ${DB.get("name", "") ? `<div class="btn-row"><button class="btn btn-quiet" id="restart-btn" type="button">↺ Start over (see the full onboarding)</button></div>` : ""}`,
      init() {
        document.getElementById("splash-tap").addEventListener("click", () => {
          go(DB.get("name", "") ? "mood" : "signup");   // returning users skip onboarding
        });
        const r = document.getElementById("restart-btn");
        if (r) r.addEventListener("click", () => {
          ["name", "moods", "appt", "cart"].forEach((k) => localStorage.removeItem("me_" + k));
          go("signup");
        });
      },
    }),

    signup: () => ({
      chrome: { back: true, menu: false },
      html: `
        <h1>Create account</h1>
        <div class="card">
          <form id="signup-form" novalidate>
            <label class="field"><span>Username <span aria-hidden="true">*</span></span>
              <input type="text" id="su-name" autocomplete="username" required aria-describedby="su-name-err">
              <span class="error-msg" id="su-name-err" role="alert" hidden>Please choose a username.</span>
            </label>
            <label class="field"><span>Password</span>
              <input type="password" id="su-pass" autocomplete="new-password">
              <span class="hint">Demo only — your password is never saved or sent anywhere.</span>
            </label>
            <label class="field"><span>Email address</span>
              <input type="email" id="su-email" autocomplete="email">
            </label>
            <label class="field"><span>Phone number</span>
              <input type="tel" id="su-phone" autocomplete="tel">
            </label>
            <button class="btn btn-primary btn-block" type="submit">Create account</button>
          </form>
        </div>
        ${tacoBlock}`,
      init() {
        document.getElementById("signup-form").addEventListener("submit", (e) => {
          e.preventDefault();
          const name = document.getElementById("su-name").value.trim();
          const err = document.getElementById("su-name-err");
          if (!name) { err.hidden = false; document.getElementById("su-name").focus(); return; }
          err.hidden = true;
          DB.set("name", name);           // only the name is kept, on this device
          go("terms");
        });
      },
    }),

    terms: () => ({
      chrome: { back: true, menu: false },
      html: `
        <h1>Terms &amp; Conditions</h1>
        <div class="card">
          <div class="terms-scroll" tabindex="0" role="region" aria-label="MindEase terms and conditions">
            <h3>Introduction</h3><p>Welcome to MindEase! By using our app, you agree to the following terms and conditions. Please read them carefully.</p>
            <h3>Use of the App</h3><p>Eligibility: You must be at least 18 years old to use MindEase. Account Security: You are responsible for maintaining the confidentiality of your account information. Personal Use: MindEase is for personal use only.</p>
            <h3>Privacy</h3><p>Data Collection: We collect and store personal data as described in our Privacy Policy. Confidentiality: Your data will be kept confidential and secure.</p>
            <h3>Services</h3><p>Free Trial: MindEase offers a two-week free trial. After the trial, a subsidized subscription fee applies. Professional Support: Users can schedule appointments with healthcare professionals and access educational articles.</p>
            <h3>User Conduct</h3><p>Users must not engage in illegal activities, harassment, or dissemination of false information, and are responsible for the accuracy and respectfulness of content they submit.</p>
            <h3>Liability</h3><p>Disclaimer: MindEase is not a substitute for professional medical advice, diagnosis, or treatment. MindEase is not liable for indirect, incidental, or consequential damages arising from use of the app.</p>
            <h3>Contact</h3><p>For questions or support, contact support@mindease.com. By using MindEase, you acknowledge that you have read, understood, and agree to these terms.</p>
          </div>
          <div class="btn-row">
            <button class="btn btn-primary" data-nav="welcome">Accept</button>
            <button class="btn btn-outline" data-nav="splash">Reject</button>
          </div>
        </div>`,
    }),

    welcome: () => ({
      chrome: { back: true, menu: false },
      html: `
        <h1>Welcome, ${userName()}!</h1>
        <p class="lede">This is the MindEase App, where you can take the stress off your chest.</p>
        <div class="card">
          <h2>Would you like a tutorial?</h2>
          <div class="btn-row">
            <button class="btn btn-primary" data-nav="tutorial">Yes</button>
            <button class="btn btn-outline" data-nav="about">No</button>
          </div>
        </div>
        ${tacoBlock}`,
    }),

    tutorial: () => ({
      chrome: { back: true, menu: false },
      html: `
        <h1>Quick tour</h1>
        <div class="card">
          <p>Here's the basics of MindEase:</p>
          <p>📋 The <strong>menu button (☰)</strong> at the top right takes you anywhere — appointments, support, articles, the store, and more.</p>
          <p>🌮 The <strong>sleepy taco</strong> is your friend! You'll find them in the Support section as your AI chat buddy.</p>
          <p>😊 Every day starts with a <strong>mood check-in</strong>, and your Mood Log helps you spot patterns over time.</p>
          <button class="btn btn-primary btn-block" data-nav="mood" style="margin-top:0.8rem">Next</button>
        </div>
        ${tacoBlock}`,
    }),

    about: () => ({
      chrome: { back: true, menu: false },
      html: `
        <h1>Ready to ease into better mental health?</h1>
        <div class="card">
          <p>Access expert doctors via online chats and video calls at a discounted rate — free for the first two weeks.</p>
          <p>Explore a wealth of resources, including articles you can read at your own pace.</p>
          <p>Take control of your well-being anytime, anywhere.</p>
          <button class="btn btn-primary btn-block" data-nav="mood" style="margin-top:0.8rem">Next</button>
        </div>
        ${tacoBlock}`,
    }),

    mood: () => ({
      chrome: { back: true, menu: true },
      html: `
        <h1>Hi, ${userName()}!</h1>
        <p class="lede">To help us support you best, let us know how you're feeling today. Pick the mood that fits:</p>
        <div class="card">
          <form id="mood-form">
            <fieldset class="mood-grid">
              <legend>How are you feeling today?</legend>
              ${MOODS.map((m, i) => `
                <div class="mood-opt">
                  <input type="radio" name="mood" id="mood-${i}" value="${i}">
                  <label class="face" for="mood-${i}"><span class="emoji" aria-hidden="true">${m.emoji}</span>${m.label}</label>
                </div>`).join("")}
            </fieldset>
            <button class="btn btn-primary btn-block" type="submit" style="margin-top:1.1rem">Save my mood</button>
          </form>
        </div>`,
      init() {
        document.getElementById("mood-form").addEventListener("submit", (e) => {
          e.preventDefault();
          const sel = document.querySelector('input[name="mood"]:checked');
          if (!sel) { toast("Pick the mood that fits you today 💛"); return; }
          const log = DB.get("moods", []);
          log.unshift({ date: new Date().toISOString().slice(0, 10), mood: +sel.value });
          DB.set("moods", log.slice(0, 60));
          go("thanks");
        });
      },
    }),

    thanks: () => ({
      chrome: { back: false, menu: true },
      html: `
        <h1>Thank you!</h1>
        <p class="lede">Your input helps us tailor our resources and support to your needs.</p>
        ${tacoBlock}
        <div class="btn-row">
          <button class="btn btn-outline" data-nav="moodlog">Mood log</button>
          <button class="btn btn-primary" data-nav="menu">Main menu</button>
        </div>`,
    }),

    moodlog: () => {
      const seed = [
        { label: "2 days ago", mood: 0 }, { label: "3 days ago", mood: 5 },
        { label: "4 days ago", mood: 2 }, { label: "5 days ago", mood: 3 },
        { label: "6 days ago", mood: 0 }, { label: "1 week ago", mood: 0 },
      ];
      const real = DB.get("moods", []);
      const items = [
        ...real.slice(0, 8).map((r, i) => ({ label: i === 0 ? "Today" : r.date, mood: r.mood })),
        ...(real.length < 3 ? seed : []),
      ];
      return {
        chrome: { back: true, menu: true },
        html: `
          <h1>Mood Log</h1>
          <p class="lede">Track your daily moods to better understand your emotional patterns.</p>
          <div class="card">
            <ul class="mood-log">
              ${items.map((it) => `<li><span>${it.label}</span><span class="emoji" role="img" aria-label="${MOODS[it.mood].label}">${MOODS[it.mood].emoji}</span></li>`).join("")}
            </ul>
            ${real.length < 3 ? `<p class="hint" style="margin-top:0.7rem">Older entries are sample data — they'll be replaced as you log real check-ins.</p>` : ""}
          </div>
          <div class="btn-row">
            <button class="btn btn-outline" data-nav="mood">Log today's mood</button>
            <button class="btn btn-primary" data-nav="menu">Main menu</button>
          </div>`,
      };
    },

    menu: () => ({
      chrome: { back: false, menu: false },
      html: `
        <h1>Main Menu</h1>
        <ul class="menu-list">
          ${[["mood", "Daily Check-in"], ["moodlog", "Mood Log"], ["breathe", "Breathe"], ["physicians", "Physicians"], ["support", "Support"], ["articles", "Articles"], ["relationships", "Relationships"], ["store", "Store"], ["feedback", "Feedback"]]
            .map(([id, label]) => `<li><button class="btn btn-primary" data-nav="${id}">${label}<span class="arrow" aria-hidden="true">→</span></button></li>`).join("")}
          <li><button class="btn btn-outline" data-nav="crisis" style="width:100%; justify-content:space-between; padding-inline:1.3rem">💛 Crisis Help<span class="arrow" aria-hidden="true">→</span></button></li>
        </ul>
        ${tacoBlock}`,
    }),

    physicians: () => ({
      chrome: { back: true, menu: true },
      html: `
        <h1>Physicians</h1>
        <div class="card">
          <p>Need to see a doctor? MindEase has partnered with experienced physicians to provide you with quality care.</p>
          <p><strong>Book an appointment:</strong> choose a convenient date and time. <strong>Consultation types:</strong> virtual or in-person, your preference.</p>
        </div>
        <div class="card">
          <h2>Schedule an appointment</h2>
          <form id="appt-form">
            <label class="field"><span>Pick a date</span>
              <input type="date" id="ap-date" required>
            </label>
            <label class="field"><span>Pick a time</span>
              <select id="ap-time" required>
                <option>9:00 AM</option><option>10:30 AM</option><option>12:00 PM</option>
                <option>2:00 PM</option><option>3:30 PM</option><option>5:00 PM</option>
              </select>
            </label>
            <fieldset style="border:none">
              <legend style="font-weight:700; margin-bottom:0.4rem">Visit type</legend>
              <label style="margin-right:1.2rem"><input type="radio" name="ap-type" value="Virtual" checked> Virtual</label>
              <label><input type="radio" name="ap-type" value="In-person"> In-person</label>
            </fieldset>
            <button class="btn btn-primary btn-block" type="submit" style="margin-top:1rem">Submit</button>
          </form>
        </div>`,
      init() {
        const d = document.getElementById("ap-date");
        d.min = new Date().toISOString().slice(0, 10);
        document.getElementById("appt-form").addEventListener("submit", (e) => {
          e.preventDefault();
          if (!d.value) { toast("Please pick a date for your appointment"); d.focus(); return; }
          DB.set("appt", {
            date: d.value,
            time: document.getElementById("ap-time").value,
            type: document.querySelector('input[name="ap-type"]:checked').value,
          });
          go("apptdone");
        });
      },
    }),

    apptdone: () => {
      const a = DB.get("appt", {});
      return {
        chrome: { back: false, menu: true },
        html: `
          <h1>You're booked! 🎉</h1>
          <div class="card">
            <p>Your appointment has been successfully scheduled. A confirmation email with the details has been sent to your email address.</p>
            <div class="appt-summary" style="margin-top:0.9rem">
              <div>Date: <span>${a.date || "—"}</span></div>
              <div>Time: <span>${a.time || "—"}</span></div>
              <div>Type: <span>${a.type || "—"}</span></div>
            </div>
            <p style="margin-top:0.9rem">Thank you for choosing MindEase. We look forward to supporting your health and well-being!</p>
          </div>
          <button class="btn btn-primary btn-block" data-nav="menu">Main menu</button>`,
      };
    },

    support: () => ({
      chrome: { back: true, menu: true },
      html: `
        <h1>Support</h1>
        <div class="card">
          <p><strong>Email:</strong> support@mindease.com — we aim to respond within 24 hours.</p>
          <p><strong>Phone:</strong> 1-800-123-4567, Monday–Friday, 9 AM–6 PM.</p>
          <p><strong>In crisis?</strong> This demo can't help in an emergency — in the US, call or text <strong>988</strong> for the Suicide &amp; Crisis Lifeline, any time.</p>
        </div>
        <div class="card">
          <h2>Chat with us live 🌮</h2>
          <div class="chat-box" id="chat-box" role="log" aria-label="Chat with MindEase assistant" aria-live="polite"></div>
          <form class="chat-form" id="chat-form">
            <label class="sr-only" for="chat-input">Type your message</label>
            <input type="text" id="chat-input" placeholder="Type a message…" autocomplete="off">
            <button class="btn btn-primary" type="submit">Send</button>
          </form>
        </div>`,
      init() {
        const box = document.getElementById("chat-box");
        const addMsg = (text, who) => {
          const d = document.createElement("div");
          d.className = "chat-msg " + who;
          d.textContent = text;
          box.appendChild(d);
          box.scrollTop = box.scrollHeight;
        };
        addMsg(`Hi ${userName()}! I'm Taco, MindEase's chat buddy. Ask me about appointments, the mood log, articles, the store, or anything on the app!`, "bot");
        const replies = [
          { k: ["appointment", "doctor", "physician", "book"], r: "You can book a virtual or in-person visit on the Physicians page — pick a date and time and you're set!" },
          { k: ["mood", "log", "feeling"], r: "Your Mood Log tracks daily check-ins so you can spot patterns. You can log a new mood from the check-in screen any time." },
          { k: ["article", "read", "learn", "anxiety", "depression"], r: "The Articles page has trusted reads on depression, anxiety, mindfulness, self-care, and more." },
          { k: ["store", "buy", "candle", "fidget"], r: "The Store has calming goodies — candles, fidget tools, coloring books. Everything's demo-priced 😉" },
          { k: ["relationship", "family", "friend", "partner"], r: "Check the Relationships section for the NURTURE tips — small habits that strengthen your connections." },
          { k: ["human", "person", "help", "contact"], r: "For a real person, email support@mindease.com or call 1-800-123-4567 (Mon–Fri, 9–6)." },
          { k: ["hi", "hello", "hey"], r: "Hello hello! 🌮 What can I help you find today?" },
          { k: ["thank", "bye"], r: "Any time! Be kind to yourself today 💛" },
        ];
        document.getElementById("chat-form").addEventListener("submit", (e) => {
          e.preventDefault();
          const inp = document.getElementById("chat-input");
          const text = inp.value.trim();
          if (!text) return;
          addMsg(text, "user");
          inp.value = "";
          const q = text.toLowerCase();
          const hit = replies.find((r) => r.k.some((k) => q.includes(k)));
          setTimeout(() => addMsg(hit ? hit.r : "Good question! Try asking about appointments, the mood log, articles, relationships, or the store — or email support@mindease.com for a human.", "bot"), 420);
        });
      },
    }),

    articles: () => ({
      chrome: { back: true, menu: true },
      html: `
        <h1>Articles</h1>
        <p class="lede">Trusted resources to support your mental health journey.</p>
        <ul class="article-list">
          ${ARTICLES.map((a) => `
            <li><a href="${a.u}" target="_blank" rel="noopener">
              <h3>${a.t} <span aria-hidden="true">↗</span></h3>
              <p>${a.d}</p>
            </a></li>`).join("")}
        </ul>`,
    }),

    relationships: () => ({
      chrome: { back: true, menu: true },
      html: `
        <h1>Relationships</h1>
        <div class="card">
          <p>Welcome to the Relationships section! Here you'll find resources and tips to nurture and strengthen your relationships — with a partner, family, or friends. Healthy connections are essential for your mental well-being.</p>
          <button class="btn btn-primary btn-block" data-nav="nurture" style="margin-top:0.8rem">Yes, let's go</button>
        </div>
        ${tacoBlock}`,
    }),

    nurture: () => ({
      chrome: { back: true, menu: true },
      html: `
        <h1>NURTURE 💛</h1>
        <div class="card">
          <p><strong>N</strong>urture — show care and attention regularly.</p>
          <p><strong>U</strong>nderstand — empathize with each other's feelings.</p>
          <p><strong>R</strong>espect — value each other's opinions and boundaries.</p>
          <p><strong>T</strong>rust — build and maintain trust.</p>
          <p><strong>U</strong>nite — spend quality time together.</p>
          <p><strong>R</strong>econcile — resolve conflicts and forgive.</p>
          <p><strong>E</strong>ncourage — support each other's growth and goals.</p>
          <button class="btn btn-primary btn-block" data-nav="nurture2" style="margin-top:0.8rem">Next</button>
        </div>`,
    }),

    nurture2: () => ({
      chrome: { back: true, menu: true },
      html: `
        <h1>And beyond…</h1>
        <div class="card">
          <p><strong>Communicate</strong> — engage in open and honest conversations.</p>
          <p><strong>Support</strong> — be there for each other in times of need.</p>
          <p><strong>Appreciate</strong> — show gratitude for the little things.</p>
          <p><strong>Listen</strong> — truly hear and understand your person.</p>
          <button class="btn btn-primary btn-block" data-nav="menu" style="margin-top:0.8rem">Back to menu</button>
        </div>
        ${tacoBlock}`,
    }),

    feedback: () => ({
      chrome: { back: true, menu: true },
      html: `
        <h1>Feedback</h1>
        <p class="lede">Your insights help us improve MindEase to better serve you and others.</p>
        <div class="card">
          <form id="fb-form">
            <label class="field"><span>Share your thoughts</span>
              <textarea id="fb-text" required></textarea>
            </label>
            <button class="btn btn-primary btn-block" type="submit">Submit</button>
          </form>
        </div>`,
      init() {
        document.getElementById("fb-form").addEventListener("submit", (e) => {
          e.preventDefault();
          const t = document.getElementById("fb-text").value.trim();
          if (!t) { toast("Write a thought or two first 💭"); return; }
          document.getElementById("fb-text").value = "";
          toast("Thank you! Your feedback means a lot 💛");
          setTimeout(() => go("menu"), 900);
        });
      },
    }),

    breathe: () => ({
      chrome: { back: true, menu: true },
      html: `
        <h1>Breathe</h1>
        <p class="lede">Box breathing: in for 4, hold for 4, out for 4, hold for 4. A minute of this can calm your nervous system.</p>
        <div class="card" style="text-align:center">
          <div class="breath-ring" id="breath-ring" aria-hidden="true"><span id="breath-count">4</span></div>
          <p class="breath-cue" id="breath-cue" aria-live="assertive">Press start when you're ready</p>
          <div class="btn-row">
            <button class="btn btn-primary" id="breath-start">Start</button>
            <button class="btn btn-outline" id="breath-stop" hidden>Stop</button>
          </div>
        </div>
        ${tacoBlock}`,
      init() {
        const ring = document.getElementById("breath-ring");
        const cue = document.getElementById("breath-cue");
        const count = document.getElementById("breath-count");
        const startB = document.getElementById("breath-start");
        const stopB = document.getElementById("breath-stop");
        const PHASES = [
          { label: "Breathe in…", cls: "grow" },
          { label: "Hold…", cls: "hold-big" },
          { label: "Breathe out…", cls: "shrink" },
          { label: "Hold…", cls: "hold-small" },
        ];
        let timer = null, phase = 0, tick = 4;
        function step() {
          count.textContent = tick;
          if (tick === 4) {
            cue.textContent = PHASES[phase].label;
            ring.className = "breath-ring " + PHASES[phase].cls;
          }
          tick--;
          if (tick < 1) { tick = 4; phase = (phase + 1) % PHASES.length; }
        }
        startB.addEventListener("click", () => {
          if (timer) return;
          startB.hidden = true; stopB.hidden = false;
          phase = 0; tick = 4;
          step();
          timer = setInterval(step, 1000);
        });
        stopB.addEventListener("click", () => {
          clearInterval(timer); timer = null;
          startB.hidden = false; stopB.hidden = true;
          ring.className = "breath-ring";
          cue.textContent = "Nice work. Come back any time 💛";
          count.textContent = "4";
        });
      },
    }),

    crisis: () => ({
      chrome: { back: true, menu: true },
      html: `
        <h1>Crisis Help 💛</h1>
        <p class="lede">If you or someone you know needs support right now, these are real, free, 24/7 resources in the US:</p>
        <div class="card">
          <p><strong>988 Suicide &amp; Crisis Lifeline</strong> — call or text <a href="tel:988">988</a>, any time, for any kind of emotional distress.</p>
          <p><strong>Crisis Text Line</strong> — text <strong>HOME</strong> to <a href="sms:741741">741741</a> to reach a trained crisis counselor.</p>
          <p><strong>SAMHSA Helpline</strong> — <a href="tel:18006624357">1-800-662-4357</a> for mental health and substance use support and referrals.</p>
          <p><strong>Emergency</strong> — if there is immediate danger, call <a href="tel:911">911</a>.</p>
        </div>
        <p class="notice">MindEase is a demo and can't provide crisis support — but these services can, and reaching out is a strong move.</p>
        ${tacoBlock}`,
    }),

    store: () => {
      const cart = DB.get("cart", []);
      return {
        chrome: { back: true, menu: true },
        html: `
          <h1>Store</h1>
          <p class="lede">Welcome to the MindEase Store! Little things that help you unwind.</p>
          <div class="btn-row" style="margin:0 0 1.1rem">
            <button class="btn btn-outline" data-nav="cart">🛒 Cart (<span id="cart-n">${cart.length}</span>)</button>
          </div>
          <div class="store-grid">
            ${PRODUCTS.map((p) => `
              <div class="product-card">
                <span class="p-emoji" aria-hidden="true">${p.emoji}</span>
                <h3>${p.name}</h3>
                <span class="price">${money(p.price)}</span>
                <button class="btn btn-primary" data-add="${p.id}" aria-label="Add ${p.name} to cart">Add +</button>
              </div>`).join("")}
          </div>`,
        init() {
          document.querySelectorAll("[data-add]").forEach((b) =>
            b.addEventListener("click", () => {
              const p = PRODUCTS.find((x) => x.id === +b.dataset.add);
              const cart = DB.get("cart", []);
              cart.push(p.id);
              DB.set("cart", cart);
              document.getElementById("cart-n").textContent = cart.length;
              toast(`${p.emoji} ${p.name} added to cart`);
            }));
        },
      };
    },

    cart: () => {
      const ids = DB.get("cart", []);
      const lines = ids.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);
      const total = lines.reduce((s, p) => s + p.price, 0);
      return {
        chrome: { back: true, menu: true },
        html: `
          <h1>Your cart</h1>
          <div class="card">
            ${lines.length ? `
              <ul class="cart-list">
                ${lines.map((p, i) => `<li><span>${p.emoji} ${p.name} — ${money(p.price)}</span><button class="rm" data-rm="${i}" aria-label="Remove ${p.name}">✕</button></li>`).join("")}
              </ul>
              <div class="total-line"><span>Total</span><span>${money(total)}</span></div>
              <button class="btn btn-primary btn-block" id="checkout-btn" style="margin-top:0.8rem">Checkout</button>`
            : `<p>This is your cart, ${userName()}. Items you add will appear here.</p>
               <button class="btn btn-primary btn-block" data-nav="store" style="margin-top:0.9rem">Browse the store</button>`}
          </div>
          ${tacoBlock}`,
        init() {
          document.querySelectorAll("[data-rm]").forEach((b) =>
            b.addEventListener("click", () => {
              const ids = DB.get("cart", []);
              ids.splice(+b.dataset.rm, 1);
              DB.set("cart", ids);
              go("cart");
            }));
          const co = document.getElementById("checkout-btn");
          if (co) co.addEventListener("click", () => {
            DB.set("cart", []);
            toast("🎉 Order placed! (Demo — no charge, of course)");
            setTimeout(() => go("menu"), 1100);
          });
        },
      };
    },
  };

  // ---- router with focus management ---------------------------------------
  const history = [];
  function go(name, viaBack) {
    const build = SCREENS[name] || SCREENS.splash;
    const screen = build();
    if (!viaBack && history[history.length - 1] !== name) history.push(name);
    location.hash = name;

    app.innerHTML = `<div class="screen">${screen.html}</div>`;
    backBtn.hidden = !screen.chrome.back;
    menuBtn.hidden = !screen.chrome.menu;

    app.querySelectorAll("[data-nav]").forEach((el) =>
      el.addEventListener("click", (e) => { e.preventDefault(); go(el.dataset.nav); }));
    if (screen.init) screen.init();

    // Move focus to the screen heading so keyboard & SR users land in the right place
    const h1 = app.querySelector("h1");
    if (h1) { h1.setAttribute("tabindex", "-1"); h1.focus({ preventScroll: false }); }
    window.scrollTo(0, 0);
  }

  backBtn.addEventListener("click", () => {
    history.pop();
    go(history[history.length - 1] || "splash", true);
  });
  menuBtn.addEventListener("click", () => go("menu"));
  document.getElementById("brand-link").addEventListener("click", (e) => {
    e.preventDefault();
    go(DB.get("name", "") ? "menu" : "splash");
  });

  const start = location.hash.replace("#", "");
  go(SCREENS[start] ? start : "splash");
})();
