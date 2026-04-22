// PI Desktop — Tenure Track · Juiced Edition
// Core mechanics unchanged — juice layer only

const TOTAL_WEEKS = 12;
const START_CASH = 5000;
const STUDENT_STIPEND = 600;
const PAPERS_GOAL = 3;

// ============ AUDIO ENGINE (Web Audio API, no external files) ============
let audioCtx = null;
let muted = false;

function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function resumeAudio() {
  const ac = getAudio();
  if (ac.state === "suspended") ac.resume();
}

function playDing() { // C major triad arpeggio — paper published
  if (muted) return;
  const ac = getAudio();
  const now = ac.currentTime;
  [[261.63,0],[329.63,.08],[392.00,.16],[523.25,.26]].forEach(([f,d]) => {
    const o = ac.createOscillator(), g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.frequency.value = f; o.type = "sine";
    g.gain.setValueAtTime(0,now+d);
    g.gain.linearRampToValueAtTime(0.18,now+d+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001,now+d+0.55);
    o.start(now+d); o.stop(now+d+0.6);
  });
}

function playBlip() { // AI task complete — short high blip
  if (muted) return;
  const ac = getAudio();
  const now = ac.currentTime;
  const o = ac.createOscillator(), g = ac.createGain();
  o.connect(g); g.connect(ac.destination);
  o.type = "square"; o.frequency.value = 1200;
  g.gain.setValueAtTime(0.08, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now+0.05);
  o.start(now); o.stop(now+0.06);
}

function playPop() { // student message — soft pop
  if (muted) return;
  const ac = getAudio();
  const now = ac.currentTime;
  const o = ac.createOscillator(), g = ac.createGain();
  o.connect(g); g.connect(ac.destination);
  o.type = "sine"; o.frequency.value = 220;
  o.frequency.linearRampToValueAtTime(180, now+0.08);
  g.gain.setValueAtTime(0.07, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now+0.08);
  o.start(now); o.stop(now+0.09);
}

function playClick() { // button click — white noise pulse
  if (muted) return;
  const ac = getAudio();
  const buf = ac.createBuffer(1, ac.sampleRate * 0.03, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i=0;i<d.length;i++) d[i] = (Math.random()*2-1)*0.06;
  const src = ac.createBufferSource(), g = ac.createGain();
  src.buffer = buf;
  const f = ac.createBiquadFilter(); f.type="bandpass"; f.frequency.value=3000;
  src.connect(f); f.connect(g); g.connect(ac.destination);
  g.gain.setValueAtTime(1,ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001,ac.currentTime+0.03);
  src.start();
}

// ============ VISUAL FX ============

function flashScreen(color) {
  const el = document.getElementById("flashLayer");
  el.style.background = color || "#ffffff";
  el.classList.remove("flash");
  void el.offsetWidth;
  el.classList.add("flash");
}

function screenShake() {
  const d = document.getElementById("desktop");
  d.classList.remove("shake");
  void d.offsetWidth;
  d.classList.add("shake");
}

function bounceEl(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("bounce");
  void el.offsetWidth;
  el.classList.add("bounce");
  el.addEventListener("animationend", () => el.classList.remove("bounce"), {once:true});
}

// Confetti
function launchConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const particles = [];
  const colors = ["#ffd700","#ff6b6b","#4dabf7","#00e87b","#c084fc","#ffa500"];
  for (let i=0;i<140;i++) {
    particles.push({
      x: Math.random()*canvas.width,
      y: -10 - Math.random()*100,
      vx: (Math.random()-0.5)*6,
      vy: 3 + Math.random()*4,
      rot: Math.random()*360,
      rotV: (Math.random()-0.5)*8,
      w: 8+Math.random()*8,
      h: 4+Math.random()*4,
      color: colors[Math.floor(Math.random()*colors.length)],
      alpha:1,
    });
  }
  let frame = 0;
  function animate() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rot += p.rotV;
      if (frame > 60) p.alpha = Math.max(0, p.alpha - 0.015);
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI/180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
      ctx.restore();
    });
    frame++;
    if (frame < 140) requestAnimationFrame(animate);
    else ctx.clearRect(0,0,canvas.width,canvas.height);
  }
  animate();
}

function showUnlockBanner(modeName, sub) {
  document.getElementById("unlockTitle").textContent = modeName.toUpperCase();
  document.getElementById("unlockSub").textContent = sub;
  const b = document.getElementById("unlockBanner");
  b.classList.remove("show");
  void b.offsetWidth;
  b.classList.add("show");
  b.addEventListener("animationend", () => b.classList.remove("show"), {once:true});
}

// ============ TASK POOL ============
const TASK_POOL = [
  { id:"lit",   emoji:"📚", name:"文献综述",
    from:"co-author@mit.edu", subj:"本周任务：综述 diffusion 方向近 2 年",
    body:"我们 intro 还差一段，帮我扫一下近两年 diffusion 加速方向的论文，要能区分 consistency model 和 rectified flow。", workload:3 },
  { id:"code",  emoji:"💻", name:"代码实现",
    from:"self@todo",         subj:"实现 baseline: FlashAttention 对照组",
    body:"审稿人要求我们对比 FlashAttention-2。需要一版能在我们数据上跑的实现。", workload:4 },
  { id:"data",  emoji:"🔢", name:"数据分析",
    from:"collaborator@stanford.edu", subj:"48 个 CSV 的统计显著性",
    body:"隔壁组给了我们 48 个 run 的结果，需要跑 permutation test 出 p-value。", workload:3 },
  { id:"proof", emoji:"🧮", name:"公式推导",
    from:"reviewer2@nips",    subj:"审稿意见：Lemma 3.2 的证明不完整",
    body:"Reviewer 2 说我们 Lemma 3.2 有个 edge case 没处理。需要补完推导。", workload:5 },
  { id:"write", emoji:"✍️", name:"论文写作",
    from:"self@todo",         subj:"NeurIPS 截稿前的 method 章节",
    body:"method 章节还剩 2 个小节没写。按我们现有的 draft 风格补完。", workload:4 },
  { id:"exp",   emoji:"🧪", name:"实验设计",
    from:"self@todo",         subj:"设计一个 ablation 说服审稿人",
    body:"我们需要一个 ablation 表证明 component X 是必要的，出表格方案。", workload:3 },
];

const STUDENT_LINES = {
  receive: [
    "好的老师，我这就看看～",
    "OK 老师，我来搞！💪",
    "收到！正好我想试试这个方向",
    "好的…（这个我不太熟但我学）",
  ],
  excuse: [
    "老师我在调环境，cuda 版本一直冲突 😭",
    "师兄把 GPU 借走了说跑一个 ablation，我排队中…",
    "家里有点事，这周可能请两天假可以吗",
    "我发现之前的 baseline 跑错了，在重跑",
    "这周组会太多了，状态不太好",
    "我妈非让我回家相亲一趟…",
    "我在看一篇相关的论文，感觉我们方法和他们有点像",
    "我觉得这个方向意义不太大，能换一个吗？",
    "老师我想先去做另一个 idea 可以吗，就 3 天",
    "跑了一半发现 OOM，在改 batch size",
    "quals 快到了，这周能不能少干点…",
    "我先去 debug 一下我的 side project",
  ],
  progress: [
    "跑了一半，中间有个 bug 在 debug",
    "结果出来了但和预期不一样，在找原因",
    "差不多了，再跑一次就交",
    "我让 ChatGPT 帮我看了一下（别告诉 reviewer）",
  ],
  done: [
    "跑通了！我觉得差不多 70 分吧 😅",
    "交了！老师您看看有没有什么问题",
    "终于搞定了…累死了",
    "完成了，不过我有个小建议：intro 是不是换个角度？",
  ],
  chat: [
    "老师您在吗",
    "老师这个 bug 困了我两天了",
    "今天食堂鸡腿好难吃",
    "老师您推荐的那篇论文我看完了",
  ],
};

const AI_RUN_LINES = {
  zeroshot:  ["running zero-shot...","prompt tokens: 128","sampling...","response: OK"],
  decompose: ["decomposing into 3 subtasks...","subtask 1/3: done ✓","subtask 2/3: done ✓","subtask 3/3: done ✓","aggregating outputs..."],
  crosscheck:["querying claude-opus-4...","querying gpt-5.4...","cross-comparing outputs...","agreement: 96%","selecting best..."],
  specfirst: ["loading eval spec...","generating with constraints...","self-check against spec...","passed 7/7 criteria"],
};

const AI_MODES = {
  zeroshot:   { name:"zero-shot",   cost:0.3, q:0.70, unlock:1 },
  decompose:  { name:"decompose",   cost:0.9, q:0.85, unlock:4 },
  crosscheck: { name:"cross-check", cost:2.1, q:0.95, unlock:6 },
  specfirst:  { name:"spec-first",  cost:1.5, q:0.92, unlock:8 },
};

const RIVAL_TICKER = [
  "招聘中，本周收到 340 份申请。",
  "又招了 1 个博士生。组里现在 4 人。",
  "组会取消，两个学生闹情绪。",
  "给整组续了 stipend，年度开销突破 $280k。",
  "一个学生申请延毕。",
  "Workshop 论文被 reject，11 个作者心血白费。",
  "两个学生抢 GPU 差点打起来。",
  "有人爆料学生造假，内部调查中。",
  "Wang 教授在 Twitter 抱怨学生不独立。",
  "再招 2 人。预算再次攀升。",
  "Wang 教授开始偷偷用 ChatGPT。",
  "一位学生凌晨 4 点还在 commit，另一位在抑郁症复诊。",
];

// Terminal ASCII banner
const ASCII_BANNER = [
  " ██████╗██╗      █████╗ ██╗   ██╗██████╗ ███████╗",
  "██╔════╝██║     ██╔══██╗██║   ██║██╔══██╗██╔════╝",
  "██║     ██║     ███████║██║   ██║██║  ██║█████╗  ",
  "██║     ██║     ██╔══██║██║   ██║██║  ██║██╔══╝  ",
  "╚██████╗███████╗██║  ██║╚██████╔╝██████╔╝███████╗",
  " ╚═════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝",
  "                    LAB  v4.7",
];

let state;

function startGame(name) {
  state = {
    name: name || "Lin",
    week: 1,
    cash: START_CASH,
    papers: 0,
    inbox: [],
    assignedStudent: [],
    aiDone: [],
    studentCost: 0,
    aiCost: 0,
    chatLog: [
      { who:"them", text:"老师您好！我是新招的博士生小王，请多指教！🙇", t:"Mon 09:12" },
      { who:"them", text:"我这周可以开始干活了，您派任务吧～", t:"Mon 09:13" },
    ],
    termLog: [],
    mode: "zeroshot",
    rivalIdx: 0,
    rivalPapers: 0,
    studentMood: "😊",
    excuseCount: 0,
    ended: false,
    seq: 0,
    tickerIdx: 0,
  };

  document.getElementById("meName").textContent = name;
  document.getElementById("studentName").textContent = "小王";
  spawnInboxForWeek();

  // Print ASCII banner with typewriter
  const termEl = document.getElementById("termBody");
  termEl.innerHTML = "";
  let bannerLines = [...ASCII_BANNER, "", "  API key loaded. Balance: $5000.00", "  Ready. 把 Inbox 任务派给我，我当场跑。", ""];
  let li = 0;
  function printBannerLine() {
    if (li < bannerLines.length) {
      const div = document.createElement("div");
      div.className = "termLine dim";
      div.style.color = li < 7 ? "var(--ai)" : "var(--dim)";
      div.style.fontSize = li < 7 ? "7px" : "11.5px";
      div.style.lineHeight = li < 7 ? "1.2" : "1.7";
      div.textContent = bannerLines[li];
      termEl.appendChild(div);
      termEl.scrollTop = termEl.scrollHeight;
      li++;
      setTimeout(printBannerLine, li < 7 ? 40 : 80);
    } else {
      // After banner, add to state log
      state.termLog.push({t:"ascii", text:"_banner_printed"});
    }
  }
  printBannerLine();

  document.getElementById("coldOpen").classList.add("hidden");
  document.getElementById("desktop").classList.remove("hidden");

  // Start ticker rotation
  startTicker();

  // Parallax aurora on mousemove
  document.getElementById("desktop").addEventListener("mousemove", handleParallax);

  render();
}

// ============ PARALLAX AURORA ============
function handleParallax(e) {
  const desktop = document.getElementById("desktop");
  const rx = (e.clientX / window.innerWidth * 100).toFixed(1);
  const ry = (e.clientY / window.innerHeight * 100).toFixed(1);
  desktop.style.setProperty("--ax", rx + "%");
  desktop.style.setProperty("--ay", ry + "%");
  const bx = (100 - rx * 0.5).toFixed(1);
  const by = (100 - ry * 0.5).toFixed(1);
  desktop.style.setProperty("--bx", bx + "%");
  desktop.style.setProperty("--by", by + "%");
}

// ============ RIVAL TICKER ============
let tickerTimer = null;
function startTicker() {
  rotateTicker();
}
function rotateTicker() {
  const inner = document.getElementById("rivalTickerInner");
  if (!inner) return;
  const msg = RIVAL_TICKER[state.rivalIdx % RIVAL_TICKER.length];
  inner.style.animation = "none";
  inner.style.opacity = "0";
  setTimeout(() => {
    inner.textContent = "🐭 隔壁 Wang 组：" + msg;
    inner.style.animation = "";
    inner.style.opacity = "1";
  }, 100);
}

// ============ TASK DISPATCH ============
function spawnInboxForWeek() {
  const n = 2 + Math.floor(Math.random() * 2);
  for (let i=0; i<n; i++) {
    const tpl = TASK_POOL[Math.floor(Math.random() * TASK_POOL.length)];
    state.inbox.push({ ...tpl, uid: ++state.seq, assigned: null });
  }
}

function assignStudent(uid) {
  resumeAudio(); playClick();
  const t = state.inbox.find(x => x.uid === uid);
  if (!t || t.assigned) return;
  t.assigned = "student";
  state.assignedStudent.push({ ...t, age:0, progress:0, done:false, quality:0 });
  pushChat("me", `@小王 帮我处理下：「${t.name}」— ${t.subj}`);
  setTimeout(() => {
    pushChat("them", pick(STUDENT_LINES.receive));
    playPop();
    render();
  }, 500);
  render();
}

function assignAI(uid) {
  resumeAudio(); playClick();
  const t = state.inbox.find(x => x.uid === uid);
  if (!t || t.assigned) return;
  const mode = AI_MODES[state.mode];
  const cost = +(mode.cost * t.workload / 3).toFixed(2);
  if (state.cash < cost) {
    // Error: flash red, shake
    pushTerm("err", `✗ insufficient balance ($${state.cash.toFixed(2)} < $${cost})`);
    screenShake();
    flashScreen("rgba(255,83,112,0.25)");
    // Highlight prompt red
    const prompts = document.querySelectorAll(".termLine .prompt");
    prompts.forEach(p => { p.classList.add("err-state"); setTimeout(()=>p.classList.remove("err-state"),1500); });
    render();
    return;
  }
  t.assigned = "ai";
  state.cash -= cost;
  state.aiCost += cost;
  bounceEl("cashM");
  const q = Math.max(0, Math.min(1, mode.q + (Math.random()-0.5)*0.08));

  // Typewriter streaming output
  const cmdText = `$ claude run --mode=${mode.name} --task="${t.name}"`;
  typewriterTerm("cmd", cmdText, () => {
    const lines = AI_RUN_LINES[state.mode] || AI_RUN_LINES.zeroshot;
    let i = 0;
    function nextLine() {
      if (i < lines.length) {
        const ln = lines[i]; i++;
        typewriterTerm("dim", "  " + ln, () => {
          render();
          setTimeout(nextLine, 100 + Math.random()*80);
        });
      } else {
        const resText = `✓ done in 0.${Math.floor(Math.random()*9)+2}s · quality ${Math.round(q*100)}% · $${cost}`;
        pushTerm("result", resText);
        state.aiDone.unshift({ ...t, mode:mode.name, cost, quality:q });
        playBlip();
        checkPapers();
        render();
      }
    }
    nextLine();
  });
  render();
}

// Typewriter effect for terminal lines
function typewriterTerm(type, text, cb) {
  const termEl = document.getElementById("termBody");
  const div = document.createElement("div");
  div.className = "termLine " + (type==="cmd"?"out":type);
  if (type === "cmd") {
    const prompt = document.createElement("span");
    prompt.className = "prompt";
    prompt.textContent = "$ ";
    div.appendChild(prompt);
  }
  termEl.appendChild(div);
  termEl.scrollTop = termEl.scrollHeight;

  const chars = type === "cmd" ? text.replace(/^\$ /,"") : text;
  let ci = 0;
  const span = document.createElement("span");
  div.appendChild(span);

  function typeChar() {
    if (ci < chars.length) {
      span.textContent += chars[ci]; ci++;
      termEl.scrollTop = termEl.scrollHeight;
      setTimeout(typeChar, type === "cmd" ? 18 : 8);
    } else {
      if (cb) cb();
    }
  }
  typeChar();
}

function pushChat(who, text) {
  state.chatLog.push({ who, text, t: clockShort() });
  if (state.chatLog.length > 200) state.chatLog.shift();
}
function pushTerm(t, text) {
  state.termLog.push({ t, text });
  if (state.termLog.length > 200) state.termLog.shift();
}

// ============ WEEK END ============
function endWeek() {
  if (state.ended) return;
  resumeAudio(); playClick();

  // Flash the screen on week transition
  flashScreen("rgba(77,171,247,0.15)");

  // Animate week number flip
  const weekEl = document.getElementById("weekM");
  weekEl.classList.add("weekFlipOut");
  setTimeout(() => {
    weekEl.classList.remove("weekFlipOut");
    weekEl.classList.add("weekFlipIn");
    weekEl.addEventListener("animationend", () => weekEl.classList.remove("weekFlipIn"), {once:true});
  }, 200);

  // Student progression
  const active = state.assignedStudent.filter(s => !s.done);
  for (const s of active) {
    s.age += 1;
    const r = Math.random();
    if (r < 0.5) {
      pushChat("them", pick(STUDENT_LINES.excuse));
      state.excuseCount = (state.excuseCount || 0) + 1;
    } else if (r < 0.8) {
      s.progress += 1;
      pushChat("them", pick(STUDENT_LINES.progress));
    } else {
      s.progress += 2;
      pushChat("them", pick(STUDENT_LINES.progress));
    }
    const needed = s.workload + Math.floor(Math.random() * 3);
    if (s.progress >= needed && s.age >= 3) {
      s.done = true;
      s.quality = 0.45 + Math.random() * 0.30;
      pushChat("them", pick(STUDENT_LINES.done));
    }
  }

  const weekCost = active.length * STUDENT_STIPEND;
  state.studentCost += weekCost;
  state.cash -= weekCost;
  if (active.length > 0) {
    pushChat("sys", `— 本周 stipend 扣了 $${weekCost} —`);
    bounceEl("cashM");
  }
  if (Math.random() < 0.3) pushChat("them", pick(STUDENT_LINES.chat));

  // Rival papers advance randomly
  if (Math.random() < 0.2) {
    state.rivalPapers = (state.rivalPapers || 0) + 1;
    bounceEl("rivalPapers");
  }

  state.week += 1;

  // Update mood
  updateMood();

  // Mode unlocks
  for (const [k, m] of Object.entries(AI_MODES)) {
    const opt = document.querySelector(`#modeSelect option[value="${k}"]`);
    if (opt) opt.disabled = state.week < m.unlock;
    if (state.week === m.unlock && k !== "zeroshot") {
      showUnlockBanner(m.name, `q≈${Math.round(m.q*100)}% · $${m.cost}/task`);
      pushTerm("result", `🔓 UNLOCKED: ${m.name} — q≈${Math.round(m.q*100)}%, $${m.cost}/task`);
      flashScreen("rgba(192,132,252,0.2)");
    }
  }

  spawnInboxForWeek();
  state.rivalIdx = (state.rivalIdx + 1) % RIVAL_TICKER.length;
  rotateTicker();
  checkPapers();
  bounceEl("weekM");
  bounceEl("cashM");

  if (state.week > TOTAL_WEEKS) return tenureReview();
  render();
}

function updateMood() {
  const pending = state.assignedStudent.filter(s => !s.done).length;
  const excuses = state.excuseCount || 0;
  let mood = "😊";
  if (excuses >= 6 || pending >= 4) mood = "😭";
  else if (excuses >= 4 || pending >= 3) mood = "😰";
  else if (excuses >= 2 || pending >= 2) mood = "😅";
  if (mood !== state.studentMood) {
    state.studentMood = mood;
    const badge = document.getElementById("moodBadge");
    if (badge) { badge.style.transform = "scale(1.6)"; setTimeout(()=>badge.style.transform="",300); }
  }
}

function checkPapers() {
  const highQ = state.aiDone.filter(d => d.quality >= 0.75).length +
                state.assignedStudent.filter(s => s.done && s.quality >= 0.55).length;
  const total = Math.floor(highQ / 4);
  if (total > state.papers) {
    const delta = total - state.papers;
    state.papers = total;
    pushTerm("result", `📄 论文 +${delta}！（累计 ${total}/${PAPERS_GOAL}）`);
    pushChat("sys", `— 你发表了 ${delta} 篇论文 🎉 —`);
    // Celebrate!
    playDing();
    launchConfetti();
    flashScreen("rgba(255,215,0,0.3)");
    bounceEl("papersM");
  }
}

function tenureReview() {
  state.ended = true;
  const pending = state.assignedStudent.filter(s => !s.done).length;
  const aiN = state.aiDone.length;
  const sDone = state.assignedStudent.filter(s => s.done).length;
  const pass = state.papers >= PAPERS_GOAL;

  const title = pass ? "🎓 Tenure 通过" : "📦 Tenure 未通过";
  const body = pass
? `12 周结束。系主任 Zhang 在 Faculty Meeting 上宣读了决定。

你的成绩单：
• 论文：${state.papers} 篇（目标 ${PAPERS_GOAL}）
• AI 流水线：${aiN} 个成品 · 累计 $${state.aiCost.toFixed(2)}
• 学生队列：${sDone} 完成 / ${pending} 还在拖 · 累计 $${state.studentCost.toFixed(0)}
• 总花费：$${(START_CASH - state.cash).toFixed(0)}

对照组 —— 隔壁 Wang 组：
5 个学生，年度预算 $340,000，发了 1 篇 workshop。

三年后有人想复现你的结果。你 git pull 了一下仓库，十分钟后跑出了完全一样的图。
小王？小王去 industry 了，现在一年赚 300k。你们偶尔还会发微信。`
: `12 周结束。你只发了 ${state.papers} 篇论文（目标 ${PAPERS_GOAL}）。

复盘：
• AI 流水线：${aiN} 个成品 · $${state.aiCost.toFixed(2)}
• 学生队列：${sDone} 完成 / ${pending} 还在拖 · $${state.studentCost.toFixed(0)}

${pending > aiN ? "你给小王派了太多活。她还在调环境你就没时间了。\n下局试试把任务都丢给 Claude。" : "AI 调得不够狠。你一直用 zero-shot。\n下局记得解锁 decompose 和 cross-check。"}`;

  if (pass) { playDing(); launchConfetti(); flashScreen("rgba(255,215,0,0.4)"); }
  else { flashScreen("rgba(255,83,112,0.3)"); }

  showModal(title, body, pass, [
    { label:"再来一局", fn:()=>{ closeModal(); location.reload(); } },
  ]);
}

// ============ RENDER ============
function clockShort() {
  const days = ["Mon","Tue","Wed","Thu","Fri"];
  const d = days[(state.week - 1) % 5];
  const h = 9 + Math.floor(Math.random() * 10);
  const m = Math.floor(Math.random() * 60).toString().padStart(2,"0");
  return `${d} ${h}:${m}`;
}

function render() {
  const s = state;
  document.getElementById("papersM").textContent = s.papers;
  document.getElementById("cashM").textContent = Math.round(s.cash);
  document.getElementById("weekM").textContent = s.week;
  document.getElementById("clock").textContent = `W${s.week} · ${new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}`;
  document.getElementById("chatMeta").textContent = `在线 · Week ${s.week}`;
  document.getElementById("moodBadge").textContent = s.studentMood;
  document.getElementById("rivalPapers").textContent = s.rivalPapers || 0;

  // Inbox
  const inboxEl = document.getElementById("inboxBody");
  const pending = s.inbox.filter(t => !t.assigned);
  if (pending.length === 0) {
    inboxEl.innerHTML = `<div class="empty">Inbox 清空。下班吧。</div>`;
  } else {
    inboxEl.innerHTML = pending.map(t => `
      <div class="taskCard">
        <div class="from">From: ${esc(t.from)}</div>
        <div class="subj"><span class="emojiPill">${t.emoji}</span>${esc(t.subj)}</div>
        <div class="body">${esc(t.body)}</div>
        <div class="actions">
          <button class="toS" onclick="assignStudent(${t.uid})">→ 派给小王</button>
          <button class="toA" onclick="assignAI(${t.uid})">→ 跑 AI ($${aiCostFor(t).toFixed(1)})</button>
        </div>
      </div>
    `).join("");
  }

  // Chat — stagger new messages
  const chatEl = document.getElementById("chatBody");
  const oldCount = chatEl.querySelectorAll(".msg").length;
  chatEl.innerHTML = s.chatLog.map((m, idx) => {
    const delay = idx >= oldCount ? `animation-delay:${(idx-oldCount)*80}ms` : "animation-delay:0ms;animation-duration:0.01ms";
    if (m.who === "sys") return `<div class="msg sys" style="${delay}"><div class="bubble">${esc(m.text)}</div></div>`;
    const isExcuse = m.who === "them" && STUDENT_LINES.excuse.includes(m.text);
    return `<div class="msg ${m.who}" style="${delay}"><div class="bubble ${isExcuse?"excuse":""}">${esc(m.text)}${m.t?`<span class="ts">${m.t}</span>`:""}</div></div>`;
  }).join("");
  chatEl.scrollTop = chatEl.scrollHeight;

  // Terminal — incremental append only for state-log items
  renderTerm();

  // Rival ticker content updated in rotateTicker()
  // End button
  document.getElementById("endWeek").textContent = s.week >= TOTAL_WEEKS
    ? "📦 Tenure Review →"
    : `下班 · 进入 Week ${s.week + 1} →`;
}

// Terminal render: only add NEW lines from state.termLog (avoid wiping typewriter text)
let termRenderedCount = 0;
function renderTerm() {
  const termEl = document.getElementById("termBody");
  // Only render lines that haven't been rendered yet (from state.termLog)
  const toAdd = state.termLog.slice(termRenderedCount);
  for (const l of toAdd) {
    if (l.text === "_banner_printed") { termRenderedCount++; continue; }
    const div = document.createElement("div");
    if (l.t === "cmd") {
      div.className = "termLine out";
      div.innerHTML = `<span class="prompt">$</span>${esc(l.text.replace(/^\$ /,""))}`;
    } else if (l.t === "dim") {
      div.className = "termLine dim";
      div.textContent = l.text;
    } else if (l.t === "err") {
      div.className = "termLine err";
      div.textContent = l.text;
    } else if (l.t === "result") {
      div.className = "termLine result";
      div.textContent = l.text;
    } else {
      div.className = "termLine out";
      div.textContent = l.text;
    }
    termEl.appendChild(div);
    termRenderedCount++;
  }
  // Ensure cursor is at end
  let cursor = termEl.querySelector(".termCursor");
  if (!cursor) { cursor = document.createElement("div"); cursor.className="termLine termCursor"; }
  termEl.appendChild(cursor);
  termEl.scrollTop = termEl.scrollHeight;
}

function aiCostFor(t) { return AI_MODES[state.mode].cost * t.workload / 3; }
function pick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function esc(s) { return String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c])); }

function showModal(title, body, pass, options) {
  document.getElementById("mTitle").textContent = title;
  document.getElementById("mTitle").className = pass ? "pass" : "fail";
  document.getElementById("mBody").textContent = body;
  const mbox = document.getElementById("mBox");
  mbox.className = "mBox" + (pass ? " pass" : "");
  const btns = document.getElementById("mBtns");
  btns.innerHTML = "";
  for (const o of options) {
    const b = document.createElement("button");
    b.textContent = o.label;
    b.onclick = () => { closeModal(); o.fn(); };
    btns.appendChild(b);
  }
  document.getElementById("modal").classList.remove("hidden");
}
function closeModal() { document.getElementById("modal").classList.add("hidden"); }

// ============ BINDINGS ============
document.getElementById("emailDate").textContent = new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});

// Act switching with bg change
document.querySelectorAll(".nextBtn").forEach(b => {
  b.addEventListener("click", () => {
    playClick();
    const cur = b.closest(".introWrap");
    const nextId = b.dataset.next;
    const next = document.getElementById(nextId);
    cur.classList.add("hidden");
    next.classList.remove("hidden");
    // Update act atmosphere
    const actMap = {intro1:"1",intro2:"2",intro3:"3"};
    document.getElementById("coldOpen").dataset.act = actMap[nextId] || "1";
    if (nextId === "intro3") {
      const n = document.getElementById("playerName").value.trim() || "Lin";
      document.getElementById("nameSlot").textContent = n;
    }
  });
});

document.getElementById("startBtn").addEventListener("click", () => {
  resumeAudio(); playClick();
  const n = document.getElementById("playerName")?.value.trim() || "Lin";
  startGame(n);
});
document.getElementById("endWeek").addEventListener("click", endWeek);
document.getElementById("modeSelect").addEventListener("change", e => {
  resumeAudio(); playClick();
  state.mode = e.target.value;
  pushTerm("dim", `mode → ${AI_MODES[state.mode].name}`);
  render();
});

// Mute toggle
document.getElementById("muteMenuBtn").addEventListener("click", () => {
  muted = !muted;
  document.getElementById("muteMenuBtn").textContent = muted ? "🔇" : "🔊";
});

// Expose to onclick handlers
window.assignStudent = assignStudent;
window.assignAI = assignAI;
