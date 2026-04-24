// PI Desktop — Tenure Track · Juiced Edition
// Core mechanics unchanged — juice layer only

const TOTAL_WEEKS = 12;
const START_CASH = 5000;
const STUDENT_STIPEND = 600;
const PAPERS_GOAL = 3;
const FOCUS_PER_WEEK = 3;
const AUDIT_COST = 300;
const OVERWORK_COST = 350;
const AUTO_RUN_STEP_LIMIT = 18;

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
    from:"co-author@frib.msu.edu", subj:"本周任务：整理 chiral EFT 三体力文献",
    body:"PRC draft 的 intro 还差一段。请把 N2LO/N3LO 三体力、c_D/c_E 拟合、cutoff dependence 和少体 observable 的脉络理清楚。", workload:3 },
  { id:"code",  emoji:"💻", name:"代码实现",
    from:"self@todo",         subj:"修 runtime potential: N3LO 矩阵元读表",
    body:"deuteron 能量和相移对不上旧代码。需要检查 LSJ channel 顺序、k-grid interpolation 和 regulator factor。", workload:4 },
  { id:"data",  emoji:"🔢", name:"数据分析",
    from:"collaborator@ornl.gov", subj:"48 组 cutoff / SRG 参数的收敛外推",
    body:"合作者给了 48 个 Nmax/hbarOmega 点。需要做指数外推、估计截断误差，并画出 Tjon-line 风格的系统性趋势。", workload:3 },
  { id:"proof", emoji:"🧮", name:"公式推导",
    from:"reviewer2@prc",    subj:"审稿意见：antisymmetrizer normalization 不清楚",
    body:"Reviewer 2 说 Jacobi 坐标下的反对称化因子写得太快，担心我们少了一个 sqrt(A!)。需要补完整推导。", workload:5 },
  { id:"write", emoji:"✍️", name:"论文写作",
    from:"self@todo",         subj:"PRC 截稿前的 Hamiltonian 章节",
    body:"method 章节还剩 NN+3N interaction、SRG evolution 和 basis truncation 三段没写。按现有 draft 风格补完。", workload:4 },
  { id:"exp",   emoji:"🧪", name:"实验设计",
    from:"self@todo",         subj:"设计一个 benchmark 说服审稿人",
    body:"我们需要一个表证明张量力、三体力和 Coulomb correction 分别有多重要。请设计 deuteron、triton、He4 的 benchmark 表。", workload:3 },
];

const TASK_VISUALS = {
  lit: "assets/visual-task-lit.svg",
  code: "assets/visual-task-code.svg",
  data: "assets/visual-task-data.svg",
  proof: "assets/visual-task-proof.svg",
  write: "assets/visual-task-write.svg",
  exp: "assets/visual-task-exp.svg",
  peer_review_offer: "assets/visual-task-review.svg",
};

const ROUTE_VISUALS = {
  literature: "assets/visual-route-literature.svg",
  legacy: "assets/visual-route-legacy.svg",
  reproduce: "assets/visual-route-reproduce.svg",
};

function taskVisualSrc(t) {
  return TASK_VISUALS[t.id] || "assets/visual-task-data.svg";
}

const STUDENT_ROUTES = {
  literature: {
    label: "文献半年",
    badge: "📚 文献半年",
    short: "系统读文献，前 6 周基本不产出，但后期质量高、风险低。",
    body: "现实后果：她会真的理解 chiral EFT、SRG、basis truncation 和 uncertainty，但 tenure 这 12 周里前半局几乎没有产出。",
  },
  legacy: {
    label: "直接跑旧代码",
    badge: "💻 旧代码",
    short: "马上跑组内 existing code，前期快，但黑箱误用和撤稿风险高。",
    body: "现实后果：她很快能给你图，但未必知道 LSJ channel、phase convention、3N matrix element 和 cutoff 到底有没有对上。",
  },
  reproduce: {
    label: "先复现 benchmark",
    badge: "🧪 复现入门",
    short: "先复现 deuteron/triton/He4 sanity checks，再上主线。速度中等，风险最低。",
    body: "现实后果：这通常是更稳的带新生方式。先让她跑组内代码，但只跑可验证的 benchmark，不直接拿黑箱结果写 paper。",
  },
};

const TASK_FIT = {
  lit:   { ai: 0.05, student: { literature: 0.16, legacy: -0.06, reproduce: 0.08 }, note: "读文献/写 framing" },
  code:  { ai: -0.04, student: { literature: -0.04, legacy: 0.10, reproduce: 0.14 }, note: "旧代码/benchmark" },
  data:  { ai: -0.01, student: { literature: 0.00, legacy: 0.06, reproduce: 0.12 }, note: "外推/数值检查" },
  proof: { ai: 0.02, student: { literature: 0.12, legacy: -0.12, reproduce: 0.04 }, note: "推导/convention" },
  write: { ai: 0.06, student: { literature: 0.10, legacy: -0.02, reproduce: 0.06 }, note: "论文写作" },
  exp:   { ai: 0.03, student: { literature: 0.06, legacy: 0.00, reproduce: 0.14 }, note: "benchmark 设计" },
};

// 每条是一个气泡串（array of bubbles），群聊里连续发出来，更像真人
const STUDENT_LINES = {
  receive: [
    ["好的老师！", "我先从 deuteron 和 triton sanity check 做起 💪"],
    ["收到收到", "我先把 channel convention 对齐", "不然之后全是玄学"],
    ["OK", "这个 workload 有点像 Nmax=14…您给我几天？"],
    ["好的老师…", "（三体力这块我还不太熟）", "但我先把 c_D/c_E 文献补上！"],
    ["来啦", "我刚把 Moshinsky bracket 那个脚本跑完"],
  ],

  excuse: [
    // 基底和截断党
    ["老师…", "我这周主要在查 HO basis 截断", "Nmax=10 和 Nmax=12 的趋势反了", "我怀疑不是物理，是 basis ordering 出问题了 😭"],
    ["我把 Jacobi basis 重新生成了一遍", "结果 antisymmetrizer 的 eigenvalue 有几个不是 0 或 1", "我现在不敢继续往下算"],
    ["老师我卡在 M-scheme 到 J-coupled 的转换", "phase convention 差一个 (-1)^(j1+j2-J)", "差这个号，He4 直接不束缚"],

    // 势和相移党
    ["我在查 N3LO potential 读表", "1S0 channel 是对的", "3S1-3D1 coupling 好像被我读反了", "deuteron quadrupole moment 很难看"],
    ["phase shift 跑出来了", "但是 P waves 整体偏了 2 度", "我怀疑是 k-grid interpolation 太糙", "不是物理问题真的"],
    ["老师", "Coulomb 我先关了", "不然 pp channel 的相移图我看不懂", "等 NN 部分对了我再开回来"],

    // 超算和脚本党
    ["集群队列卡住了", "我那个 Nmax=14 job 排了 38 小时", "刚开始跑就 walltime 到了", "log 只写到 Hamiltonian dimension"],
    ["我用错 partition 了", "本来要跑 CPU 大内存", "结果投到了 GPU 队列", "管理员把我 job kill 了"],
    ["张师兄把 shared scratch 清了", "我的 3N matrix elements 被删了", "重新生成要一晚上"],

    // 身体和现实党
    ["老师这周真不好意思", "我感冒了，还起了点低烧", "看 9j symbol 看得头更疼", "白天状态不太行…"],
    ["上周末打球把脚崴了", "去办公室不方便", "我在家远程看相移", "但 VPN 老断 🥲"],
    ["老师我腰闪了…", "坐久了疼", "我先躺着读 Epelbaum 那篇 review"],

    // 组会玄学党
    ["老师这周具体数值结果不多", "但我认真想了 effective interaction 的物理图像", "感觉我们应该从 RG flow 讲起"],
    ["我发现一篇 2007 年的 PRC 和我们图很像", "但他们用的是 Idaho N3LO", "我想再深挖一下，避免撞车"],
    ["老师组会能不能讲一下 SRG induced 4N force", "我感觉大家都默认它小", "但没人真的讲清楚"],

    // 换题画饼党
    ["老师", "我这周想了一下", "单纯 He4 可能不够 sexy", "要不要顺手做一下 neutron-rich oxygen？"],
    ["我师兄说 IMSRG 现在很热", "我就看了三天", "感觉我们是不是也可以把方法包装成 ab initio pipeline"],
    ["我觉得 benchmark 不能只放 binding energy", "要不要加 radius 和 EM form factor", "这样更像完整物理故事"],

    // 课程和 deadline 党
    ["下周 DNP abstract deadline", "我想先把 poster 摘要写了", "主线能不能缓两天"],
    ["量子多体课程作业周五交", "里面刚好有 second quantization", "也算对课题有帮助吧老师"],
    ["quals 下下周考", "我这周真得复习 scattering theory", "不然连 Lippmann-Schwinger 都讲不清楚 💀"],

    // 玄学党
    ["电脑昨天蓝屏了", "我怀疑是我把 matrix elements 存成了 80GB npz", "数据恢复要一周"],
    ["我 git rebase 崩了", "把修 channel ordering 的 commit 合没了", "现在 deuteron 又回到不束缚状态"],
    ["老师 overleaf 抽风", "我写的 SRG evolution 那段不见了", "只能重写…我要哭了 😭"],
  ],

  progress: [
    ["跑了大概一半吧", "deuteron 能量已经对到 keV 量级", "但是 D-state probability 还有点飘"],
    ["结果出来了…", "triton binding energy 差了 300 keV", "我在看是 c_E 拟合问题", "还是 3N cutoff 没对上 🥲"],
    ["差不多了老师", "现在在扫 hbarOmega", "看起来 Nmax 外推还比较稳"],
    ["我跑出来一个初步结果", "但是 cutoff dependence 有点大", "想再跑 lambda=1.8/2.0/2.2 fm^-1 看趋势"],
    ["代码能跑了", "但是构造 Hamiltonian 比 diagonalization 还慢 🫠", "我在 profile Moshinsky transformation"],
  ],

  done: [
    ["跑通啦 🎉", "deuteron、triton、He4 三个 sanity check 都在合理范围", "您有空看一下 👀"],
    ["交了！", "代码在 branch fix-channel-order", "图在 overleaf 我新开了一节", "老师您把关"],
    ["终于搞定了…", "这周基本都在盯相移图", "我先去补个觉 🥲"],
    ["完成了老师", "不过我觉得 intro 可以从 cutoff uncertainty 切入", "比单纯说 ab initio 更有说服力"],
    ["done！", "顺便我把 matrix element cache 和 README 补了", "下次换 interaction 能快很多 ✨", "[导师满意度 +1]"],
  ],

  chat: [
    ["老师您在吗 👀"],
    ["老师这个 phase convention 困了我两天了", "在线等，挺急的"],
    ["老师您上次说的那篇 PRC 我找到了", "作者居然引用了我们组十年前那篇 😂"],
    ["今天食堂的鱼像没加 tensor force", "完全没有吸引力"],
    ["老师 PRC referee report 出了没…", "我心跳有点快"],
    ["老师", "隔壁 Wang 组那个学生发朋友圈", "说他们 He4 已经对到 10 keV", "我看了下跟我们方向有点像 😨"],
  ],

  shady: [
    // 数据党
    ["老师跑通啦 🎉", "He4 只差 80 keV 🙈", "把 Coulomb 关掉后特别漂亮"],
    ["那个 cutoff scan 我其实没跑全", "只跑了 lambda=2.0", "但趋势应该差不多，对吧？"],
    ["我把 hbarOmega=12 那个点删了", "外推线漂亮多了", "应该可以说是 finite-basis artifact 吧老师…？"],
    // 凑数党
    ["benchmark table 那几个半径", "我是按已有趋势插值的", "reviewer 不会真拿代码复现吧？"],
    ["那个 3N matrix element 原文件太大", "我先用了 normal-ordered two-body approximation", "图反而更好看"],
    // 借口党
    ["这个相移我重新算了一遍", "和 Nijmegen 数据有点对不上", "可能 convention 不一样？", "物理趋势是对的"],
    ["antisymmetrizer 那个 normalization", "我用一句 'up to a phase convention' 带过了", "PRC reviewer 应该懂吧"],
  ],

  blameshift: [
    ["老师…这个 SRG lambda", "是您上次组会说先用 2.0 fm^-1 的呀", "我完全是按您说的来的 🥲"],
    ["是张师兄教我这么删外推点的", "他说明显不在 asymptotic 区就可以扔", "我就…直接用了"],
    ["这个 interaction 文件是 collaborator 给的", "我没动过原始矩阵元", "可能他们那边 channel 顺序就不一样"],
    ["算力不够是集群的问题啊", "我申请了大内存节点两次都没批", "Hamiltonian dimension 又不是我定的 🤷"],
    ["那篇 reference 是上一个 RA 加的", "他毕业了", "我也不知道为啥把 Argonne v18 引成 CD-Bonn"],
    ["我也不想这样的老师", "是 PRC deadline 逼得", "您当时不是说先把图凑齐吗…"],
  ],
};

const ONBOARDING_LINES = {
  literatureStudy: [
    ["老师我这周主要在读 Machleidt 的 N3LO review", "好多 convention 不统一", "我先整理一张表"],
    ["我在看 SRG 的 flow equation", "现在明白为什么 induced many-body force 不能随便忽略了"],
    ["这周读了三体力 c_D/c_E 拟合", "感觉不同组的 convention 真的很容易坑新人"],
    ["我把 HO basis、Nmax、hbarOmega 的截断关系整理了一版", "还没产图，但概念清楚多了"],
  ],
  legacyFast: [
    ["旧代码已经跑起来了", "但我还没完全搞懂 input 里 Jmax 和 kmax 的关系"],
    ["图先出来了", "不过我还在确认 3S1-3D1 coupling 的列顺序"],
    ["脚本能一键扫 cutoff", "就是 log 太多，我还不知道哪个 warning 真要管"],
  ],
  reproduceBench: [
    ["deuteron binding energy 对上了", "下一步看 D-state probability"],
    ["triton 还差一点", "我在查 Coulomb 和 3N force 有没有一起开"],
    ["He4 benchmark 快对上了", "Nmax 外推我再稳一下"],
  ],
};

const ADVISOR_QUIPS = [
  "先别调参，deuteron 都没对上就不要谈 He4。",
  "三体力不是垃圾桶，不能什么误差都往 c_E 里塞。",
  "相移图难看不要紧，最怕的是你不知道横轴单位是什么。",
  "致谢别写我，我没教过把 3S1 和 3D1 读反的。",
  "有的同学就是不听，Nmax 没收敛就开始讲物理图像。",
  "人生在世，先守住 Hermiticity。",
  "这一周她 168 小时都干嘛去了？连 phase convention 都没固定。",
];

// 真·Anthropic 模型定价（2026-04）按官网价格按比例折算到每任务成本
// Mythos 是 2026 下半年的下一代旗舰，游戏 W9 时"刚发布"——戏剧性的新模型时刻
const AI_RUN_LINES = {
  haiku:   ["loading claude-haiku-4-5-20251001...","input tokens: 1,240","streaming response...","first token: 0.08s","response: OK"],
  sonnet:  ["loading claude-sonnet-4-6...","input tokens: 2,880","extended thinking: 4s","streaming response...","response: OK ✓"],
  opus:    ["loading claude-opus-4-7...","input tokens: 6,520","extended thinking: 12s","self-verify pass","streaming response...","response: OK 🏆"],
  mythos:  ["loading claude-mythos-preview...","🌟 next-gen flagship · released 2 weeks ago","input tokens: 9,800","extended thinking: 28s","multi-step verification...","response: OK 🔮"],
};

// 真·Anthropic 2026 定价：长 context + extended thinking 的 research task，每 call 真金白银
// 参考：Haiku $1/$5 per M · Sonnet $3/$15 · Opus $15/$75 · Mythos $25/$125（preview 溢价）
const AI_MODES = {
  haiku:  { name:"Haiku 4.5",    cost:0.50, q:0.65, unlock:1, desc:"cheap, fast, occasionally dumb" },
  sonnet: { name:"Sonnet 4.6",   cost:2.50, q:0.82, unlock:3, desc:"the workhorse — reliable" },
  opus:   { name:"Opus 4.7",     cost:8.00, q:0.94, unlock:6, desc:"reasoning beast, 1M context" },
  mythos: { name:"Mythos",       cost:18.00, q:0.98, unlock:9, desc:"next-gen flagship, just released" },
};

const RIVAL_TICKER = [
  "招聘中，本周收到 34 份少体方向申请。",
  "又招了 1 个博士生。组里现在 4 人，3 人在算 He4。",
  "组会取消，两个学生因为 SRG lambda 吵起来。",
  "给整组续了 stipend，年度开销突破 $280k。",
  "一个学生申请延毕，理由是 Nmax 还没收敛。",
  "PRC 被 reject，11 个作者心血白费。",
  "两个学生抢大内存节点差点打起来。",
  "有人爆料相移图删点，内部调查中。",
  "Wang 教授在 X 上抱怨学生不懂 phase convention。",
  "再招 2 人。超算申请再次扩容。",
  "Wang 教授开始偷偷用 Claude 查 9j symbol。",
  "一位学生凌晨 4 点还在生成 3N 矩阵元，另一位在重读 Faddeev 方程。",
];

// Terminal ASCII banner
const ASCII_BANNER = [
  "┌─────────────────────────────────────────┐",
  "│  ◆ CLAUDELAB · AI Research Runtime      │",
  "│  model: claude-opus-4-7    version: 4.7 │",
  "└─────────────────────────────────────────┘",
];

// ============ SYSTEM A · EVENT POOL (15 events) ============
const EVENT_POOL = [
  {
    id: "collab_invite",
    emoji: "🤝", title: "合作邀请",
    body: "MIT 的 Zhang 教授发来邮件：「我们方向高度互补，想联合署名一篇。我出第一作者位，你出第二。」\n\n—— 是个好名字，但你得让出主控权。",
    options: [
      { label: "接受合作（+2 reputation，但本轮少记 1 paper）",
        fn: () => { state.reputation = (state.reputation||0) + 2; state.papers = Math.max(0, state.papers - 1);
          pushChat("sys","— 你接受了 MIT Zhang 的合作邀请，论文署名靠后了一位 —"); pushTerm("result","🤝 合作达成 +2 reputation（-1 paper 自主权）"); render(); } },
      { label: "礼貌拒绝",
        fn: () => { pushChat("sys","— 你婉拒了合作，聚焦自己的线 —"); } },
    ],
  },
  {
    id: "student_offer",
    emoji: "🎓", title: "小王收到国家实验室 postdoc offer",
    body: "小王进来找你谈话，表情复杂：\n\n「老师……ORNL 那边给了我 postdoc offer，下周就想让我过去做 coupled-cluster。我……还没决定。」\n\n你的心跳漏了半拍。她手头还有三个未完成任务。",
    options: [
      { label: "加薪挽留（-$1,500，但她留下）",
        fn: () => { state.cash -= 1500; bounceEl("cashM");
          pushChat("sys","— 你给小王涨了 stipend，她决定留下来。钱包又轻了 $1,500 —");
          pushTerm("result","💸 挽留小王 -$1,500（她留下了）"); render(); } },
      { label: "祝福她离开（60% 几率任务作废）",
        fn: () => {
          if (Math.random() < 0.6) {
            const gone = state.assignedStudent.filter(s => !s.done);
            gone.forEach(s => { s.done = true; s.quality = 0; });
            pushChat("sys","— 小王转去国家实验室了，未完成的任务全部作废……祝她前程似锦 —");
            pushTerm("result","💔 小王去 ORNL 了，未完成任务清零"); screenShake(); flashScreen("rgba(255,83,112,0.2)");
          } else {
            pushChat("sys","— 小王感谢了你的祝福，但最终选择留下来继续读 PhD —");
            pushTerm("result","😮 小王居然留下来了！"); }
          render(); } },
    ],
  },
  {
    id: "arxiv_clash",
    emoji: "📰", title: "arXiv 撞车",
    body: "凌晨 2:37，你手机震动。\n\n小王发来截图：一篇刚上 arXiv 的预印本，题目也是 SRG-evolved chiral interaction 下的 He4 收敛。连 cutoff 和 hbarOmega 扫描范围都撞了。作者来自 TRIUMF。\n\n你盯着屏幕，感觉时间在流逝。",
    options: [
      { label: "抢快 push 到 arXiv（-$500，+1 slot，卷赢他们）",
        fn: () => { state.cash -= 500; bounceEl("cashM");
          addBonusSlots(1, "抢快 arXiv 版本");
          pushChat("sys","— 你们连夜赶出一个 arXiv 版本，先抢了旗帜 —");
          pushTerm("result","⚡ 紧急 push 成功 -$500 +1 slot（已标注先发优先权）"); render(); } },
      { label: "等等看，关注他们后续",
        fn: () => { pushChat("sys","— 你决定以不变应万变，继续打磨自己的版本 —"); } },
    ],
  },
  {
    id: "reviewer2_returns",
    emoji: "🧟", title: "Reviewer 2 回归",
    body: "新一轮 PRC review 回来了。你一眼看到 Reviewer 2 的措辞——和三年前那个揪着你 SRG induced 4N force 不放的人，一字一顿，如出一辙。\n\n「The convergence pattern is not convincing. The uncertainty estimate is optimistic.」\n\n他又回来了。",
    options: [
      { label: "找 AE（处理编辑）申诉（+1 reputation，-3 行动点）",
        fn: () => { state.reputation = (state.reputation||0) + 1; state.focus = Math.max(0, (state.focus || 0) - 3);
          pushChat("sys","— 你写了一封措辞精准的申诉信给 AE（处理编辑），据理力争 —");
          pushTerm("result","⚖️ 申诉成功 +1 reputation（损耗了大量精力 -3 行动点）"); render(); } },
      { label: "忍了，下次换个 venue 投",
        fn: () => { state.reputation = (state.reputation||0) - 1;
          pushChat("sys","— 你吞下这口气，默默记下这个 reviewer 的文风 —");
          pushTerm("result","😤 默默承受 -1 reputation"); render(); } },
    ],
  },
  {
    id: "gpu_maintenance",
    emoji: "🔌", title: "超算维护",
    body: "IT 发来系统邮件：\n\n「本周四至周日，学校 HPC 大内存节点将进行例行维护，所有 job 将被强制终止，checkpoint 请自行备份。」\n\n小王已经在跑的三个 Nmax scan……没有 checkpoint。",
    options: [
      { label: "知道了（所有 student 任务 progress -2）",
        fn: () => {
          state.assignedStudent.filter(s=>!s.done).forEach(s => { s.progress = Math.max(0, s.progress - 2); });
          pushChat("sys","— 集群维护三天，小王的 Nmax scan 进度倒退了不少 —");
          pushTerm("result","🔌 HPC 停机 -2 progress（所有 pending 任务）"); render(); } },
    ],
  },
  {
    id: "twitter_viral",
    emoji: "🎰", title: "X 上意外火了",
    body: "你昨晚随手发了一条推——把刚跑出的 Tjon line 图配了句「三体力终于听话了」——没想到被两个核理论大 V 转发，一觉醒来 10k 转发、500 条评论。\n\n有人问能不能合作，有人说「终于看到靠谱的 uncertainty estimate」，Reviewer 2 的账号也在底下点了个 Like。",
    options: [
      { label: "知道了！（+3 reputation）",
        fn: () => { state.reputation = (state.reputation||0) + 3;
          pushTerm("result","🔥 X 爆款 +3 reputation（互联网的馈赠）"); render(); } },
    ],
  },
  {
    id: "ai_promo",
    emoji: "🤖", title: "Anthropic 学界 Credits 促销",
    body: "收到 Anthropic 官方邮件：\n\n「为支持学术研究，本周向所有 .edu 邮箱用户提供 API credits 50% 折扣。有效期：本周。」\n\n你盯着那行字，感觉老天给你开了一扇窗。",
    options: [
      { label: "激活折扣（下周 AI 任务费用 ×0.5）",
        fn: () => { state.aiDiscount = true;
          pushChat("sys","— Anthropic 学界促销已激活，下周 AI 任务半价 —");
          pushTerm("result","🎁 AI discount 激活：下周所有 claude 任务 ×0.5"); render(); } },
    ],
  },
  {
    id: "chair_vacation",
    emoji: "🏖️", title: "系主任度假",
    body: "Zhang Wei 的自动回复邮件：\n\n「I am currently in Hawaii for a well-deserved vacation. Will be back in two weeks. All administrative matters delayed accordingly.」\n\n行政停摆，无人监督，难得的窗口期。",
    options: [
      { label: "偷偷休一周（+3 行动点，清空内心包袱）",
        fn: () => { state.focus = (state.focus || 0) + 3; state.focusMax = Math.max(state.focusMax || 0, state.focus);
          pushChat("sys","— 你放松了两天，思路反而更清晰了 +3 行动点（满血复活）—");
          pushTerm("result","🏖️ 摸鱼有道 +3 行动点（系主任不在，猫就跳上桌）"); render(); } },
      { label: "加班赶进度（+2 slots，以我手速）",
        fn: () => { addBonusSlots(2, "系主任度假窗口");
          pushChat("sys","— 利用这个窗口期，你多攒了 2 个高质量成品 —");
          pushTerm("result","🏋️ 内卷成功 +2 slots（系主任不在，你比以前更卷）"); render(); } },
    ],
  },
  {
    id: "anon_report",
    emoji: "🕵️", title: "匿名举报",
    body: "合规办公室转来一封匿名邮件，收件人是系主任，抄送你：\n\n「相关人员论文中存在数据异常，建议调查。」\n\n你把邮件看了三遍，脑子里快速过了一遍最近所有的实验记录……",
    options: [
      { label: "立即调查（-$500，清除 1 hiddenFraud 风险）",
        fn: () => { state.cash -= 500; bounceEl("cashM");
          if (state.hiddenFraud > 0) state.hiddenFraud = Math.max(0, state.hiddenFraud - 1);
          pushChat("sys","— 你主动调查并整理了原始数据，消除了一个潜在风险 —");
          pushTerm("result","🔍 调查完成 -$500（清除 1 hiddenFraud，睡得香了）"); render(); } },
      { label: "无视（retraction 风险 +5%，就当没收到）",
        fn: () => { state.hiddenFraud = (state.hiddenFraud||0) + 1;
          pushChat("sys","— 你把邮件标记已读，假装什么都没发生 —");
          pushTerm("result","🙈 视而不见 hiddenFraud+1（retraction 风险上升）"); render(); } },
    ],
  },
  {
    id: "invited_talk",
    emoji: "🎤", title: "受邀演讲",
    body: "某国家实验室的 Theory Group Leader 发来邮件：\n\n「看了你们最近的 preprint，我们组会上讨论了很久。想邀请你来做 invited talk，$2,000 honorarium，差旅全包。」\n\n你打开日历，发现下周还有两个 deadline。",
    options: [
      { label: "接受（+$2,000，-2 行动点，本周进度暂停）",
        fn: () => { state.cash += 2000; state.focus = Math.max(0, (state.focus || 0) - 2); bounceEl("cashM");
          pushChat("sys","— 你做了一场精彩的 invited talk，honorarium 进账！—");
          pushTerm("result","🎤 Talk 完成 +$2,000 （-2 行动点，但值了）"); render(); } },
      { label: "婉拒（感谢好意，专注手头工作）",
        fn: () => { pushChat("sys","— 你礼貌拒绝，对方表示理解，留下了联系方式 —"); } },
    ],
  },
  {
    id: "student_hospital",
    emoji: "💊", title: "小王急性阑尾炎",
    body: "小王室友打来电话：\n\n「老师……小王昨晚被送进医院了，急性阑尾炎，刚手术出来，住院一周。她让我告诉您她很抱歉。」\n\n你想了想，stipend 这周……",
    options: [
      { label: "知道了（任务暂停 1 周，stipend 正常发——人道主义）",
        fn: () => {
          state.assignedStudent.filter(s=>!s.done).forEach(s => { s.age -= 1; });
          pushChat("sys","— 小王住院一周，你照发 stipend，任务进度暂停 —");
          pushChat("them",["老师…我出院了","谢谢您没有停我的 stipend","我接下来一定加倍努力 🙏"]);
          pushTerm("result","💊 人道主义：stipend 正常发，任务冻结 1 周"); render(); } },
    ],
  },
  {
    id: "best_paper_nom",
    emoji: "🏆", title: "Best Paper 提名",
    body: "DNP Program Chair 发来私信：\n\n「Congratulations! Your talk has been selected for the Theory Highlights session. Please confirm your attendance.」\n\n你把那条消息截图发给了父母。",
    options: [
      { label: "飞去现场（-$800，-1 周，+5 reputation，值！）",
        fn: () => { state.cash -= 800; state.reputation = (state.reputation||0) + 5; bounceEl("cashM");
          flashScreen("rgba(255,215,0,0.35)"); playDing();
          pushChat("sys","— 你亲自出席颁奖典礼，握到了那块奖牌 🏆 —");
          pushTerm("result","🏆 Theory Highlights 现场 -$800 +5 reputation（值得！）"); render(); } },
      { label: "线上 Zoom 参加（省机票，-2 reputation）",
        fn: () => { state.reputation = (state.reputation||0) - 2;
          pushChat("sys","— 你在宿舍用 Zoom 出席……掌声通过扬声器传来，有点尴尬 —");
          pushTerm("result","💻 Zoom 参会 -2 reputation（省了机票钱）"); render(); } },
    ],
  },
  {
    id: "reproduce_crisis",
    emoji: "🔬", title: "复现危机",
    body: "Retraction Watch 发了一篇博文，圈了你组之前某篇 paper 的相移图——有读者发现曲线和公开的 phase-shift table 对不上。\n\n评论区已经有 47 条回复，两条点了你的 GitHub 账号。",
    options: [
      { label: "发 erratum（-2 reputation，保留 paper，诚信满分）",
        fn: () => { state.reputation = (state.reputation||0) - 2;
          pushChat("sys","— 你公开发了 erratum，坦承数据处理失误，社区反应积极 —");
          pushTerm("result","📋 erratum 发出 -2 reputation（但 paper 保住了，诚信加分）"); render(); } },
      { label: "嘴硬死撑（30% 保住，70% 撤稿）",
        fn: () => {
          if (Math.random() < 0.30) {
            pushChat("sys","— 风波平息了，可能大家懒得追究 —");
            pushTerm("result","😅 侥幸过关（别再赌了）");
          } else {
            state.papers = Math.max(0, state.papers - 1);
            if ((state.hiddenFraud || 0) > 0) state.hiddenFraud = Math.max(0, state.hiddenFraud - 1);
            else state.legacyDebt = Math.max(0, (state.legacyDebt || 0) - 1);
            pushChat("sys","— 论文被撤稿，Retraction Watch 发了正式报道 😱 —");
            pushTerm("result","💀 撤稿 -1 paper（嘴硬输了）"); screenShake(); flashScreen("rgba(255,83,112,0.4)");
          }
          render(); } },
    ],
  },
  {
    id: "shower_idea",
    emoji: "💡", title: "洗澡时的灵感",
    body: "凌晨 1 点，你在洗澡。\n\n热水哗哗流着，脑子却突然高速转动——一个把 SRG flow、三体力拟合和少体 observable uncertainty 连起来的新方案，清晰得像是被人在白板上写出来的。\n\n你冲出浴室，头发没擦，拿起手机开始录音。",
    options: [
      { label: "马上写 proposal（下次 NSF 成功率 +30%）",
        fn: () => { state.nsfBonus = (state.nsfBonus||0) + 30;
          pushChat("sys","— 你连夜写完 idea proposal，下次 NSF 申请有了新弹药 —");
          pushTerm("result","💡 灵感捕获 NSF 成功率 +30%（下次申请见效）"); render(); } },
      { label: "记下来但先完成手头的",
        fn: () => { pushChat("sys","— 你把 idea 存进 notion，继续之前的工作 —"); } },
    ],
  },
  {
    id: "github_fork",
    emoji: "👾", title: "GitHub 被 500 人 fork",
    body: "GitHub 通知涌进来：你上周整理的 few-body benchmark 仓库在 Nuclear Theory 邮件列表里被人分享，一夜之间被 fork 了 507 次，还有人在 Issues 里问「能不能加 AV18 和 N3LO 对比？」\n\n500 个人正在用你的代码做实验。",
    options: [
      { label: "知道了！（+2 reputation，互联网馈赠）",
        fn: () => { state.reputation = (state.reputation||0) + 2;
          pushTerm("result","👾 GitHub 爆款 +2 reputation（开源的力量）"); render(); } },
    ],
  },
];

// ============ STATE ============
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
    mode: "haiku",
    rivalIdx: 0,
    rivalPapers: 0,
    studentMood: "😊",
    studentRoute: null,
    studentRouteProgress: 0,
    studentRouteNotice: false,
    legacyDebt: 0,
    studentGuidance: 0,
    autoMode: "balanced",
    autoRunActive: false,
    autoRunSteps: 0,
    aiBusy: false,
    excuseCount: 0,
    ended: false,
    seq: 0,
    tickerIdx: 0,
    hiddenFraud: 0,
    suspiciousPending: [],
    bonusSlots: 0,
    focusMax: FOCUS_PER_WEEK,
    focus: FOCUS_PER_WEEK,
    nextWeekFocusBonus: 0,
    overworked: false,
    auditShield: 0,
    weeklyGoal: null,
    weekStats: null,
    quipWeekCounter: 0,
    // System A: dramatic arc
    act: 1,
    actEventsTriggered: [],
    // System B: economy
    reputation: 0,
    grantApplied: false,
    nsfBonus: 0,
    aiDiscount: false,
    // System C: random events
    firedEvents: [],
  };

  document.getElementById("meName").textContent = name;
  document.getElementById("studentName").textContent = "小王";
  spawnInboxForWeek();
  beginWeek({ silent: true });

  // Print ASCII banner with typewriter
  const termEl = document.getElementById("termBody");
  termEl.innerHTML = "";
  let bannerLines = [...ASCII_BANNER, "", "  API key loaded. Balance: $5000.00", "  Ready. 把 Inbox 任务派给我，我当场跑。", ""];
  const BANNER_N = ASCII_BANNER.length;
  let li = 0;
  function printBannerLine() {
    if (li < bannerLines.length) {
      const div = document.createElement("div");
      div.className = "termLine dim";
      const isBanner = li < BANNER_N;
      div.style.color = isBanner ? "var(--ai)" : "var(--dim)";
      div.style.fontSize = isBanner ? "15px" : "11.5px";
      div.style.lineHeight = isBanner ? "1.35" : "1.7";
      div.style.fontWeight = isBanner ? "700" : "normal";
      div.style.letterSpacing = isBanner ? "0" : "normal";
      div.style.textShadow = isBanner ? "0 0 12px var(--ai-glow)" : "none";
      div.textContent = bannerLines[li];
      termEl.appendChild(div);
      termEl.scrollTop = termEl.scrollHeight;
      li++;
      setTimeout(printBannerLine, isBanner ? 60 : 80);
    } else {
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
  setTimeout(showStudentOnboardingModal, 650);
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

// ============ STUDENT ONBOARDING ============
function showStudentOnboardingModal() {
  if (!state || state.studentRoute || state.ended) return;
  showModal(
    "👩‍🎓 新生入组路线",
    `小王刚进组。现实问题不是「她努不努力」，而是你怎么把一个新人接到课题组已有的理论核物理代码体系里。\n\n路线 A：先系统读文献半年。她会理解物理，但 12 周 tenure 冲刺里前半局几乎没有产出。\n\n路线 B：直接跑组内旧代码。她很快出图，但容易黑箱误用：channel 顺序、phase convention、cutoff、Coulomb、3N matrix element 任何一个错都能让结果看起来“差不多”。\n\n路线 C：先复现 benchmark。先让她跑 deuteron / triton / He4 sanity checks，边读关键文献边上主线。现实里最稳，但没有纯黑箱跑得快。`,
    false,
    [
      { label: "📚 先读文献半年", fn: () => chooseStudentRoute("literature") },
      { label: "💻 直接跑组内旧代码", fn: () => chooseStudentRoute("legacy") },
      { label: "🧪 先复现 benchmark（推荐）", fn: () => chooseStudentRoute("reproduce") },
    ]
  );
}

function chooseStudentRoute(route) {
  const r = STUDENT_ROUTES[route] || STUDENT_ROUTES.reproduce;
  state.studentRoute = route;
  state.studentRouteProgress = 0;
  state.studentRouteNotice = false;
  pushChat("sys", `— 入组路线已定：${r.badge}。${r.short} —`);
  if (route === "literature") {
    pushChat("them", ["老师那我先把 Machleidt、Epelbaum、Hebeler 和 Roth 那几篇啃掉", "可能前几周不会有图", "但我会把 convention 记清楚"]);
    pushTerm("dim", "  [onboarding] literature-first: W1-W6 student progress slow, quality/risk improves after W7");
  } else if (route === "legacy") {
    pushChat("them", ["老师我直接跑 scripts/run_he4_scan.sh 了", "先把图交出来", "具体 channel convention 我边跑边看"]);
    pushTerm("err", "  [onboarding] legacy-code: early progress fast, but black-box risk and suspicious delivery chance up");
  } else {
    pushChat("them", ["老师我先复现 deuteron/triton/He4 benchmark", "旧代码能跑不算数，sanity check 对上才算数"]);
    pushTerm("result", "  [onboarding] benchmark-first: balanced progress, lower risk, good long-run quality");
  }
  render();
}

function routeConfig() {
  return STUDENT_ROUTES[state.studentRoute] ? state.studentRoute : "reproduce";
}

function labRisk() {
  return (state.hiddenFraud || 0) + (state.legacyDebt || 0);
}

function studentRouteProgressText() {
  const p = state.studentRouteProgress || 0;
  if (state.studentRoute === "literature") return `${Math.min(6, p)}/6`;
  if (state.studentRoute === "reproduce") return `${Math.min(3, p)}/3`;
  return String(p);
}

function checkStudentRouteMilestone() {
  const route = routeConfig();
  if (state.studentRouteNotice) return;
  if (route === "literature" && (state.studentRouteProgress || 0) >= 6) {
    state.studentRouteNotice = true;
    state.reputation = (state.reputation || 0) + 1;
    pushChat("sys", "— 小王完成系统文献训练：后续学生任务质量提高，风险降低，+1 reputation —");
    pushTerm("result", "📚 文献半年压缩完成：student quality up, risk down, +1 reputation");
    bounceEl("reputationM");
  } else if (route === "reproduce" && (state.studentRouteProgress || 0) >= 3) {
    state.studentRouteNotice = true;
    addBonusSlots(1, "deuteron/triton/He4 benchmark 复现完成");
    pushChat("sys", "— 小王把组内旧代码的基础 benchmark 复现了。之后再跑主线，可信度高很多。—");
  }
}

function taskFit(t) {
  return TASK_FIT[t.id] || { ai: 0, student: { literature: 0, legacy: 0, reproduce: 0 }, note: "通用任务" };
}

function aiTaskQualityModifier(t) {
  return taskFit(t).ai || 0;
}

function studentTaskQualityModifier(t) {
  const route = routeConfig();
  return (taskFit(t).student?.[route] || 0) + Math.min(0.16, (state.studentGuidance || 0) * 0.04);
}

function fitClass(v) {
  if (v >= 0.08) return "good";
  if (v <= -0.05) return "bad";
  return "mid";
}

function fitLabel(v) {
  if (v >= 0.12) return "强";
  if (v >= 0.04) return "可";
  if (v <= -0.08) return "弱";
  if (v < 0) return "险";
  return "中";
}

function taskFitHtml(t) {
  const ai = aiTaskQualityModifier(t);
  const student = state.studentRoute ? studentTaskQualityModifier(t) : 0;
  const studentLabel = state.studentRoute ? `学生适配 ${fitLabel(student)}` : "学生适配 待定";
  return `
    <div class="fitLine">
      <span class="fitPill ${fitClass(ai)}">AI适配 ${fitLabel(ai)}</span>
      <span class="fitPill ${state.studentRoute ? fitClass(student) : "mid"}">${studentLabel}</span>
      <span class="fitPill mid">${esc(taskFit(t).note)}</span>
    </div>`;
}

// ============ WEEKLY STRATEGY LAYER ============
function beginWeek(opts = {}) {
  const bonus = state.nextWeekFocusBonus || 0;
  state.focusMax = FOCUS_PER_WEEK + bonus;
  state.focus = state.focusMax;
  state.nextWeekFocusBonus = 0;
  state.overworked = false;
  state.weekStats = {
    ai: 0,
    student: 0,
    review: 0,
    audit: 0,
    mentor: 0,
    nsf: 0,
    highQStart: state.highQCount || qualityPieces(),
    papersStart: state.papers || 0,
    cashStart: state.cash || 0,
    riskStart: labRisk(),
  };
  state.weeklyGoal = createWeeklyGoal();
  if (!opts.silent) {
    pushTerm("dim", `  [Week ${state.week} plan] focus=${state.focus}/${state.focusMax} · KPI: ${state.weeklyGoal.title}`);
  }
}

function createWeeklyGoal() {
  const risk = labRisk();
  const week = state.week || 1;
  if (risk > 0) {
    return {
      type: "audit",
      title: "做 1 次内部审计，清掉潜在爆雷",
      reward: "奖励：+1 reputation",
      completed: false,
    };
  }
  if (state.cash < 1200 && week >= 4 && !state.grantApplied) {
    return {
      type: "cash",
      title: "本周结束现金保持在 $800 以上",
      reward: "奖励：+1 下周行动点",
      completed: false,
    };
  }
  const goals = [
    {
      type: "ai",
      target: 2,
      title: "用 AI 完成 2 个任务",
      reward: "奖励：+1 高质量成品槽",
      completed: false,
    },
    {
      type: "student",
      target: 2,
      title: "给小王派 2 个任务，压榨 pipeline",
      reward: "奖励：+$500 系内小额报销",
      completed: false,
    },
    {
      type: "slot",
      target: 2,
      title: "本周攒 2 个高质量成品",
      reward: "奖励：+1 reputation",
      completed: false,
    },
    {
      type: "balance",
      title: "AI 和小王各推进 1 次，保持组合拳",
      reward: "奖励：+1 下周行动点",
      completed: false,
    },
  ];
  return goals[(week + Math.floor(Math.random() * goals.length)) % goals.length];
}

function spendFocus(label) {
  if ((state.focus || 0) <= 0) {
    showAdvisorQuip(`本周行动点用完了。要么点「爆肝 +1」，要么下班进入下一周。`);
    pushTerm("err", `✗ no focus left for ${label}`);
    screenShake();
    render();
    return false;
  }
  state.focus -= 1;
  bounceEl("focusM");
  return true;
}

function qualityPieces() {
  return state.aiDone.filter(d => d.quality >= 0.68).length +
    state.assignedStudent.filter(s => s.done && s.quality >= 0.55).length +
    (state.bonusSlots || 0);
}

function addBonusSlots(n, reason) {
  state.bonusSlots = (state.bonusSlots || 0) + n;
  if (reason) pushTerm("result", `🏆 ${reason} +${n} 高质量成品槽`);
  checkPapers();
  checkWeeklyGoalCompletion();
}

function checkWeeklyGoalCompletion(opts = {}) {
  const g = state.weeklyGoal;
  if (!g || g.completed || !state.weekStats) return false;
  const stats = state.weekStats;
  const gainedSlots = Math.max(0, (state.highQCount || qualityPieces()) - (stats.highQStart || 0));
  let done = false;
  if (g.type === "ai") done = stats.ai >= g.target;
  else if (g.type === "student") done = stats.student >= g.target;
  else if (g.type === "slot") done = gainedSlots >= g.target;
  else if (g.type === "balance") done = stats.ai >= 1 && stats.student >= 1;
  else if (g.type === "audit") done = stats.audit >= 1 && labRisk() < (stats.riskStart || 0);
  else if (g.type === "cash") done = opts.finalize && state.cash >= 800;
  if (!done) return false;

  g.completed = true;
  if (g.type === "ai") addBonusSlots(1, "本周 KPI 完成");
  else if (g.type === "student") { state.cash += 500; bounceEl("cashM"); }
  else if (g.type === "slot") { state.reputation = (state.reputation || 0) + 1; bounceEl("reputationM"); }
  else if (g.type === "balance") state.nextWeekFocusBonus = (state.nextWeekFocusBonus || 0) + 1;
  else if (g.type === "audit") { state.reputation = (state.reputation || 0) + 1; bounceEl("reputationM"); }
  else if (g.type === "cash") state.nextWeekFocusBonus = (state.nextWeekFocusBonus || 0) + 1;

  pushTerm("result", `✅ 本周 KPI 完成：${g.title} · ${g.reward}`);
  pushChat("sys", `— 本周 KPI 完成：${g.title} —`);
  playDing();
  flashScreen("rgba(0,232,123,0.18)");
  render();
  return true;
}

// ============ TASK DISPATCH ============
function spawnInboxForWeek() {
  const n = 2 + Math.floor(Math.random() * 2);
  const activeTaskKeys = new Set(
    state.inbox
      .filter(t => !t.assigned)
      .map(taskKey)
  );
  const usedThisSpawn = new Set();
  let candidates = TASK_POOL.filter(t => !activeTaskKeys.has(taskKey(t)));
  if (candidates.length < n) candidates = [...TASK_POOL];

  for (const tpl of shuffle(candidates).slice(0, n)) {
    const key = taskKey(tpl);
    if (usedThisSpawn.has(key)) continue;
    usedThisSpawn.add(key);
    state.inbox.push({ ...tpl, uid: ++state.seq, assigned: null });
  }
}

function assignStudent(uid) {
  resumeAudio(); playClick();
  if (!state.studentRoute) {
    showStudentOnboardingModal();
    return;
  }
  const t = state.inbox.find(x => x.uid === uid);
  if (!t || t.assigned) return;
  if (!spendFocus("delegate to student")) return;
  t.assigned = "student";
  state.weekStats.student += 1;
  state.assignedStudent.push({ ...t, age:0, progress:0, done:false, quality:0 });
  pushChat("me", `@小王 帮我处理下：「${t.name}」— ${t.subj}`);
  setTimeout(() => {
    pushChat("them", pick(STUDENT_LINES.receive));
    playPop();
    render();
  }, 500);
  checkWeeklyGoalCompletion();
  render();
}

function assignAI(uid) {
  resumeAudio(); playClick();
  const t = state.inbox.find(x => x.uid === uid);
  if (!t || t.assigned) return;
  const mode = AI_MODES[state.mode];
  const discount = state.aiDiscount ? 0.5 : 1;
  const cost = +(mode.cost * t.workload / 3 * discount).toFixed(2);
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
  if (!spendFocus("run AI")) return;
  t.assigned = "ai";
  state.cash -= cost;
  state.aiCost += cost;
  state.weekStats.ai += 1;
  bounceEl("cashM");
  state.aiBusy = true;
  // 方差 ±8% → zero-shot 范围 0.62~0.78，有真实波动感（有时合格有时翻车）
  const q = Math.max(0, Math.min(1, mode.q + aiTaskQualityModifier(t) + (Math.random()-0.5)*0.16));

  // Typewriter streaming output
  const cmdText = `$ claude run --mode=${mode.name} --task="${t.name}"`;
  typewriterTerm("cmd", cmdText, () => {
    const lines = AI_RUN_LINES[state.mode] || AI_RUN_LINES.haiku;
    let i = 0;
    function nextLine() {
      if (i < lines.length) {
        const ln = lines[i]; i++;
        typewriterTerm("dim", "  " + ln, () => {
          render();
          setTimeout(nextLine, 100 + Math.random()*80);
        });
      } else {
        const qualityPct = Math.round(q*100);
        const highQ = q >= 0.68;
        const resText = `✓ done in 0.${Math.floor(Math.random()*9)+2}s · quality ${qualityPct}% · $${cost}${highQ ? " · +1 slot 🏆" : " · 质量 <68% 不计入论文 ⚠️"}`;
        pushTerm("result", resText);
        state.aiDone.unshift({ ...t, mode:mode.name, cost, quality:q });
        playBlip();
        if (!highQ) showAdvisorQuip(`AI 这个 ${qualityPct}% 质量组不成论文——换个更贵的 mode 试试？`);
        state.aiBusy = false;
        checkPapers();
        checkWeeklyGoalCompletion();
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

function pushChat(who, text, cat) {
  // text 可以是字符串，也可以是字符串数组（多气泡剧情串）
  // cat 是气泡类别标签（excuse/shady/blameshift/done/progress…）用于渲染上色
  const bubbles = Array.isArray(text) ? text : [text];
  const baseT = clockShort();
  bubbles.forEach((b, idx) => {
    state.chatLog.push({ who, text: b, t: idx === 0 ? baseT : null, cat: cat || null });
  });
  while (state.chatLog.length > 200) state.chatLog.shift();
  if (who === "them" && typeof playPop === "function") {
    bubbles.forEach((_, i) => setTimeout(() => playPop(), i * 140));
  }
}
function pushTerm(t, text) {
  state.termLog.push({ t, text });
  if (state.termLog.length > 200) state.termLog.shift();
}

// ============ ADVISOR QUIP TOAST ============
function showAdvisorQuip(text) {
  let toast = document.getElementById("advisorToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "advisorToast";
    toast.className = "advisorToast";
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span class="advisorToastIcon">🤔</span><span class="advisorToastText">${esc(text)}</span>`;
  toast.classList.remove("advisorToastShow");
  void toast.offsetWidth;
  toast.classList.add("advisorToastShow");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("advisorToastShow"), 3200);
}

// ============ SUSPICIOUS DELIVERY MODAL ============
function showSuspiciousModal(s) {
  const shadyLine = pick(STUDENT_LINES.shady);
  showModal(
    "🚨 可疑交付 — 要相信她吗？",
    `小王说：\n\n"${shadyLine}"\n\n任务「${s.name}」的 workload=${s.workload}，她 ${s.age} 周就交了。\n\n要直接用，还是让她重跑你亲自盯？`,
    false,
    [
      {
        label: "信她，直接用",
        fn: () => {
          s.suspicious = false;
          s.done = true;
          if ((state.auditShield || 0) > 0) {
            state.auditShield -= 1;
            pushTerm("result", "🛡️ 审计护盾生效：这次可疑交付未增加撤稿风险");
          } else {
            state.hiddenFraud += 1;
          }
          state.suspiciousPending = state.suspiciousPending.filter(x => x !== s);
          pushChat("sys", `— 你选择相信小王，任务「${s.name}」标记为完成（内心有点虚…）—`);
          checkPapers();
          updateSuspiciousCounter();
          render();
        }
      },
      {
        label: "让她重跑，亲自查",
        fn: () => {
          s.suspicious = false;
          s.done = false;
          s.progress = Math.floor(s.progress / 2);
          state.cash -= 200;
          state.suspiciousPending = state.suspiciousPending.filter(x => x !== s);
          pushChat("them", pick(STUDENT_LINES.blameshift), "blameshift");
          pushChat("sys", `— 你让小王重跑，扣 $200 验收费，任务退回进行中 —`);
          bounceEl("cashM");
          updateSuspiciousCounter();
          render();
        }
      },
    ]
  );
}

function updateSuspiciousCounter() {
  const n = state.suspiciousPending ? state.suspiciousPending.length : 0;
  let el = document.getElementById("suspiciousCounter");
  if (!el) return;
  if (n > 0) {
    el.style.display = "inline-flex";
    el.textContent = `🔍 待审 ${n}`;
  } else {
    el.style.display = "none";
  }
}

function studentRouteModifiers() {
  const route = routeConfig();
  if (route === "literature") {
    if ((state.studentRouteProgress || 0) < 6) {
      return {
        studyMode: true,
        excuseChance: 0.65,
        progressBonus: -1,
        neededDelta: 2,
        minAge: 5,
        qualityBonus: 0,
        suspiciousDelta: -0.18,
        suspiciousAge: 3,
      };
    }
    return {
      excuseChance: 0.32,
      progressBonus: 0,
      neededDelta: -1,
      minAge: 3,
      qualityBonus: 0.18,
      suspiciousDelta: -0.25,
      suspiciousAge: 3,
    };
  }
  if (route === "legacy") {
    return {
      excuseChance: 0.34,
      progressBonus: 1,
      neededDelta: -1,
      minAge: 2,
      qualityBonus: -0.10,
      suspiciousDelta: 0.30,
      suspiciousAge: 4,
    };
  }
  const reproducing = (state.studentRouteProgress || 0) < 3;
  return {
    excuseChance: reproducing ? 0.44 : 0.34,
    progressBonus: 0,
    neededDelta: reproducing ? 0 : -1,
    minAge: 3,
    qualityBonus: reproducing ? 0.05 : 0.12,
    suspiciousDelta: reproducing ? -0.15 : -0.22,
    suspiciousAge: 3,
  };
}

function advanceStudentOnboarding() {
  const route = routeConfig();
  if (route === "literature" && (state.studentRouteProgress || 0) >= 6) return;
  if (route === "reproduce" && (state.studentRouteProgress || 0) >= 3) return;
  if (route === "legacy") {
    if (Math.random() < 0.35) pushChat("them", pick(ONBOARDING_LINES.legacyFast));
    return;
  }
  state.studentRouteProgress = (state.studentRouteProgress || 0) + 1;
  const p = state.studentRouteProgress;
  if (route === "literature" && p <= 6) {
    pushChat("them", pick(ONBOARDING_LINES.literatureStudy));
    pushTerm("dim", `  [student onboarding] 文献训练 ${p}/6：慢产出，换后期质量`);
    checkStudentRouteMilestone();
  } else if (route === "reproduce" && p <= 3) {
    pushChat("them", pick(ONBOARDING_LINES.reproduceBench));
    pushTerm("dim", `  [student onboarding] benchmark 复现 ${p}/3：先 sanity check，再上主线`);
    checkStudentRouteMilestone();
  }
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
  const routeMod = studentRouteModifiers();
  for (const s of active) {
    s.age += 1;
    const r = Math.random();
    let gained = 0;
    if (routeMod.studyMode && r < 0.72) {
      pushChat("them", pick(ONBOARDING_LINES.literatureStudy));
    } else if (r < routeMod.excuseChance) {
      const legacyLine = routeConfig() === "legacy" && Math.random() < 0.45;
      pushChat("them", legacyLine ? pick(ONBOARDING_LINES.legacyFast) : pick(STUDENT_LINES.excuse), "excuse");
      state.excuseCount = (state.excuseCount || 0) + 1;
    } else if (r < 0.8) {
      gained = 1;
      pushChat("them", pick(STUDENT_LINES.progress));
    } else {
      gained = 2;
      pushChat("them", pick(STUDENT_LINES.progress));
    }
    if (gained > 0) s.progress += Math.max(0, gained + routeMod.progressBonus);
    const needed = Math.max(1, s.workload + Math.floor(Math.random() * 3) + routeMod.neededDelta);
    if (s.progress >= needed && s.age >= routeMod.minAge) {
      // Suspicious delivery check: high-workload tasks finished too fast
      const suspiciousChance = Math.max(0.05, Math.min(0.85, 0.45 + routeMod.suspiciousDelta));
      const isSuspicious = (s.workload >= 4 && s.age <= routeMod.suspiciousAge && Math.random() < suspiciousChance);
      if (isSuspicious) {
        s.done = false;
        s.suspicious = true;
        state.suspiciousPending.push(s);
        pushChat("them", pick(STUDENT_LINES.shady), "shady");
        pushChat("sys", `— 小王提交了「${s.name}」但交得太快了… —`);
        updateSuspiciousCounter();
      } else {
        s.done = true;
        s.quality = Math.max(0.25, Math.min(0.95, 0.45 + Math.random() * 0.30 + routeMod.qualityBonus + studentTaskQualityModifier(s)));
        if ((state.studentGuidance || 0) > 0) state.studentGuidance -= 1;
        if (routeConfig() === "legacy" && Math.random() < 0.25) {
          state.legacyDebt = (state.legacyDebt || 0) + 1;
          pushTerm("err", "⚠️ legacy-code debt +1：结果快，但旧代码黑箱债务增加");
        }
        pushChat("them", pick(STUDENT_LINES.done));
      }
    }
  }
  advanceStudentOnboarding();

  // 一个学生就一份工资——不管她手上多少活
  const weekCost = active.length > 0 ? STUDENT_STIPEND : 0;
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

  checkPapers();
  checkWeeklyGoalCompletion({ finalize: true });

  state.week += 1;
  if (state.week > TOTAL_WEEKS) return tenureReview();
  spawnInboxForWeek();
  beginWeek();

  // Advisor quip toast every 2-3 weeks
  state.quipWeekCounter = (state.quipWeekCounter || 0) + 1;
  const quipInterval = 2 + Math.floor(Math.random() * 2);
  if (state.quipWeekCounter >= quipInterval) {
    state.quipWeekCounter = 0;
    setTimeout(() => showAdvisorQuip(pick(ADVISOR_QUIPS)), 800);
  }

  // Show suspicious delivery modal if any pending
  if (state.suspiciousPending && state.suspiciousPending.length > 0) {
    setTimeout(() => showSuspiciousModal(state.suspiciousPending[0]), 600);
  }

  // Update mood
  updateMood();

  // Mode unlocks
  for (const [k, m] of Object.entries(AI_MODES)) {
    const opt = document.querySelector(`#modeSelect option[value="${k}"]`);
    if (opt) opt.disabled = state.week < m.unlock;
    if (state.week === m.unlock && k !== "haiku" && k !== "mythos") {
      // Mythos 走 act3_open 专属发布会 modal，不重复弹 banner
      showUnlockBanner(m.name, `q≈${Math.round(m.q*100)}% · $${m.cost}/task`);
      pushTerm("result", `🔓 UNLOCKED: ${m.name} — q≈${Math.round(m.q*100)}%, $${m.cost}/task`);
      flashScreen("rgba(192,132,252,0.2)");
    }
  }

  state.rivalIdx = (state.rivalIdx + 1) % RIVAL_TICKER.length;
  rotateTicker();
  bounceEl("weekM");
  bounceEl("cashM");

  // Apply AI discount from promo event (resets each week)
  if (state.aiDiscount) {
    state.aiDiscount = false;
    pushTerm("dim","  [AI discount 已过期，恢复正常定价]");
  }

  // System B: peer review offer (W3+, 30% chance)
  rollPeerReviewOffer();

  // System C: random event (25% chance)
  rollEvent();

  // System A: check act transitions & milestone events
  checkActTransition();

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
  const highQ = qualityPieces();
  state.highQCount = highQ;
  const total = Math.floor(highQ / 4);
  if (total > state.papers) {
    const delta = total - state.papers;
    state.papers = total;
    pushTerm("result", `📄 论文 +${delta}！4 个高质量成品组装成 1 篇。（累计 ${total}/${PAPERS_GOAL}）`);
    pushChat("sys", `— 攒够 4 个高质量成品，发表了 ${delta} 篇论文 🎉 —`);
    // System B: publication bounty — $1,500 per new paper
    const bountyTotal = delta * 1500;
    state.cash += bountyTotal;
    pushTerm("result", `💰 publication bounty +$${bountyTotal}（indirect cost return）`);
    bounceEl("cashM");
    // Celebrate!
    playDing();
    launchConfetti();
    flashScreen("rgba(255,215,0,0.3)");
    bounceEl("papersM");
  }
}

// ============ SYSTEM B · NSF GRANT ============
function openNSFGrant() {
  if (state.ended) return;
  if (state.week < 4) {
    showAdvisorQuip("NSF 申请 W4 后才解锁——先攒点预实验结果再说。");
    return;
  }
  if (state.grantApplied) {
    showAdvisorQuip("每局只能申请一次 NSF，省着点用。");
    return;
  }
  if ((state.focus || 0) <= 0) {
    showAdvisorQuip("本周行动点用完了，NSF proposal 写不动了。");
    return;
  }
  resumeAudio(); playClick();
  const kwOpts = ["ab initio", "uncertainty", "three-body forces", "neutron-rich nuclei", "SRG", "open science"];
  const hotKws = ["uncertainty", "neutron-rich nuclei"];
  const selected = [];

  // Build keyword selection modal body
  const kw1 = kwOpts[Math.floor(Math.random()*3)];
  const kw2 = kwOpts[3 + Math.floor(Math.random()*3)];
  const kw3 = hotKws[Math.floor(Math.random()*2)];
  const kws = [kw1, kw2, kw3];

  const hotCount = kws.filter(k => hotKws.includes(k)).length;
  const successRate = Math.min(95, 30 + 20 * state.papers + 5 * hotCount + (state.nsfBonus||0));
  const bodyText = `你决定以以下 3 个方向提交 Research Statement：\n  1. "${kw1}"  2. "${kw2}"  3. "${kw3}"\n\n热词命中：${hotCount}（uncertainty / neutron-rich nuclei 现在很热）\n你的发表数：${state.papers} 篇\n\n综合成功率：${successRate}%\n\n祝你好运——Reviewer 3 正在虎视眈眈。`;

  showModal("📄 申请 NSF Grant", bodyText, false, [
    {
      label: `提交申请（成功率 ${successRate}%）`,
      fn: () => {
        if (!spendFocus("submit NSF")) return;
        state.grantApplied = true;
        state.weekStats.nsf += 1;
        state.nsfBonus = 0;
        if (Math.random() * 100 < successRate) {
          state.cash += 3000; bounceEl("cashM");
          launchConfetti(); playDing(); flashScreen("rgba(0,232,123,0.25)");
          pushTerm("result", "🎉 NSF Grant 获批！+$3,000（你击败了 Reviewer 3）");
          pushChat("sys","— 恭喜！NSF 通知邮件到了，$3,000 进账 🎉 —");
        } else {
          state.reputation = (state.reputation||0) - 1; bounceEl("reputationM");
          screenShake(); flashScreen("rgba(255,83,112,0.2)");
          pushTerm("err", "✗ NSF 被拒：Reviewer 3 说 novelty 不够 (-1 reputation)");
          pushChat("sys","— NSF 被拒，Reviewer 3 的意见附上……你默默合上了邮件 —");
        }
        render();
      }
    },
    { label: "再想想，先不提", fn: () => {} },
  ]);
}

// ============ SYSTEM B · PEER REVIEW OFFER ============
function rollPeerReviewOffer() {
  if (state.week < 3) return;
  if (Math.random() > 0.30) return;  // 30% chance

  const inboxItem = {
    uid: ++state.seq,
    id: "peer_review_offer",
    emoji: "📝", name: "审稿接单",
    from: "editor@prc.aps.org",
    subj: "Invitation: Referee · Physical Review C · +$200",
    body: "Dear Prof. " + state.name + ",\n\nWe would like to invite you to review a manuscript on chiral interactions and few-body benchmarks. Honorarium: $200. Estimated effort: 1 行动点.\n\n-- PRC Editor",
    workload: 1,
    assigned: null,
    isPeerReview: true,
  };
  state.inbox.push(inboxItem);
  pushChat("sys","— 📝 PRC Editor 发来审稿邀请，+$200 接不接？—");
}

function acceptPeerReview(uid) {
  resumeAudio(); playClick();
  const t = state.inbox.find(x => x.uid === uid);
  if (!t) return;
  if (!spendFocus("peer review")) return;
  t.assigned = "done";
  state.cash += 200; bounceEl("cashM");
  state.weekStats.review += 1;
  pushTerm("result","📝 peer review 接单 +$200（学界互助，回报立竿见影）");
  pushChat("sys","— 你接受了审稿邀请，$200 进账 —");
  checkWeeklyGoalCompletion();
  render();
}

function skipPeerReview(uid) {
  resumeAudio(); playClick();
  const t = state.inbox.find(x => x.uid === uid);
  if (!t) return;
  t.assigned = "skip";
  pushChat("sys","— 你婉拒了审稿邀请 —");
  render();
}

// ============ STRATEGY ACTIONS ============
function runInternalAudit() {
  if (state.ended) return;
  resumeAudio(); playClick();
  if (state.cash < AUDIT_COST) {
    pushTerm("err", `✗ audit needs $${AUDIT_COST}, current $${Math.round(state.cash)}`);
    screenShake();
    return;
  }
  if (!spendFocus("internal audit")) return;
  state.cash -= AUDIT_COST;
  state.weekStats.audit += 1;
  bounceEl("cashM");

  if ((state.hiddenFraud || 0) > 0) {
    state.hiddenFraud = Math.max(0, state.hiddenFraud - 1);
    pushTerm("result", `🔍 内部审计完成 -$${AUDIT_COST}：清除 1 个撤稿风险`);
    pushChat("sys", "— 你抽查了原始数据和实验日志，清掉一个潜在爆雷点 —");
  } else if ((state.legacyDebt || 0) > 0) {
    state.legacyDebt = Math.max(0, state.legacyDebt - 1);
    pushTerm("result", `🔍 内部审计完成 -$${AUDIT_COST}：清除 1 个旧代码黑箱债务`);
    pushChat("sys", "— 你重跑了 benchmark 并核对 channel convention，清掉一个旧代码黑箱债务 —");
  } else {
    state.auditShield = (state.auditShield || 0) + 1;
    pushTerm("result", `🔍 内部审计完成 -$${AUDIT_COST}：未发现问题，下次可疑交付有 1 次护盾`);
    pushChat("sys", "— 你提前整理了实验记录。短期没产出，但之后睡得更稳 —");
  }
  checkWeeklyGoalCompletion();
  render();
}

function overworkForFocus() {
  if (state.ended) return;
  resumeAudio(); playClick();
  if (state.overworked) {
    showAdvisorQuip("本周已经爆肝过了，再爆就不是策略，是事故。");
    return;
  }
  if (state.cash < OVERWORK_COST) {
    pushTerm("err", `✗ overwork needs $${OVERWORK_COST}, current $${Math.round(state.cash)}`);
    screenShake();
    return;
  }
  state.cash -= OVERWORK_COST;
  state.focus += 1;
  state.focusMax += 1;
  state.overworked = true;
  bounceEl("cashM");
  bounceEl("focusM");
  pushTerm("result", `☕ 爆肝一晚 -$${OVERWORK_COST}：本周行动点 +1`);
  pushChat("sys", "— 你用咖啡和外卖换来一个额外行动点。代价稍后结算。—");
  if (Math.random() < 0.35) {
    state.hiddenFraud = (state.hiddenFraud || 0) + 1;
    pushTerm("err", "⚠️ 疲劳操作埋下一个潜在错误：risk +1");
    screenShake();
  }
  render();
}

function holdGroupMeeting() {
  if (state.ended) return;
  resumeAudio(); playClick();
  if (!state.studentRoute) {
    showStudentOnboardingModal();
    return;
  }
  if (!spendFocus("group meeting")) return;

  state.weekStats.mentor += 1;
  state.studentGuidance = (state.studentGuidance || 0) + 1;
  const route = routeConfig();
  const active = state.assignedStudent.filter(s => !s.done);
  const progressGain = route === "reproduce" ? 2 : 1;
  active.forEach(s => { s.progress += progressGain; });

  if (route === "literature" && (state.studentRouteProgress || 0) < 6) {
    state.studentRouteProgress += 1;
    pushChat("them", ["老师组会讲完我清楚多了", "我把 SRG / cutoff / observable 的关系画成一张图了"]);
    pushTerm("result", `🧑‍🏫 组会指导：文献训练 +1（${state.studentRouteProgress}/6），下一次学生交付质量提高`);
    checkStudentRouteMilestone();
  } else if (route === "legacy") {
    if ((state.legacyDebt || 0) > 0) {
      state.legacyDebt = Math.max(0, state.legacyDebt - 1);
      pushTerm("result", "🧑‍🏫 组会指导：追问旧代码 sanity check，legacy debt -1");
    } else {
      state.auditShield = (state.auditShield || 0) + 1;
      pushTerm("result", "🧑‍🏫 组会指导：提前核对 channel convention，获得 1 次审计护盾");
    }
    pushChat("them", ["老师我回去把 deuteron sanity check 补上", "以后不直接相信旧脚本输出"]);
  } else {
    if ((state.studentRouteProgress || 0) < 3) {
      state.studentRouteProgress += 1;
      checkStudentRouteMilestone();
    }
    pushTerm("result", active.length > 0
      ? `🧑‍🏫 组会指导：active 学生任务 progress +${progressGain}，下一次学生交付质量提高`
      : "🧑‍🏫 组会指导：benchmark 训练 +1，下一次学生交付质量提高");
    pushChat("them", ["老师这个 benchmark 的判断标准清楚了", "我先看 deuteron，再看 triton，最后再碰 He4"]);
  }

  if (active.length === 0) {
    pushChat("sys", "— 这次组会没有 active 学生任务，但提高了下一次学生交付质量 —");
  } else {
    pushChat("sys", `— 组会把 ${active.length} 个学生任务往前推了一步 —`);
  }
  checkWeeklyGoalCompletion();
  render();
}

function currentAutoMode() {
  return state.autoMode || "balanced";
}

function autoModeName(mode = currentAutoMode()) {
  return ({
    balanced: "均衡策略",
    deadline: "冲论文",
    train: "带学生",
    safe: "低风险",
  })[mode] || "均衡策略";
}

function costForMode(t, modeKey) {
  const model = AI_MODES[modeKey];
  if (!model) return Infinity;
  return +(model.cost * t.workload / 3 * (state.aiDiscount ? 0.5 : 1)).toFixed(2);
}

function affordableModesForTask(t) {
  return Object.entries(AI_MODES)
    .filter(([, m]) => state.week >= m.unlock)
    .filter(([key]) => costForMode(t, key) <= state.cash);
}

function scoreTaskForAI(t, mode = currentAutoMode()) {
  const best = chooseAffordableMode(t, mode);
  if (!best) return Number.NEGATIVE_INFINITY;
  const model = AI_MODES[best] || AI_MODES[state.mode];
  const cost = costForMode(t, best);
  let score = model.q * 100 + aiTaskQualityModifier(t) * 85 - cost * 1.8 - t.workload * 2;
  if (mode === "deadline") score += 18 + model.q * 18;
  if (mode === "train") score -= 10;
  if (mode === "safe") score += aiTaskQualityModifier(t) >= 0 ? 6 : -14;
  if (state.weeklyGoal && !state.weeklyGoal.completed && ["ai", "balance"].includes(state.weeklyGoal.type)) score += 24;
  if (state.week >= 8) score += 14;
  return score;
}

function scoreTaskForStudent(t, mode = currentAutoMode()) {
  const route = routeConfig();
  const backlog = state.assignedStudent.filter(s => !s.done).length;
  let score = 48 + studentTaskQualityModifier(t) * 110 - t.workload * 5;
  if (mode === "train") score += 24;
  if (mode === "deadline") score -= 16;
  if (mode === "safe") score += route === "legacy" ? -18 : 10;
  if (route === "literature" && (state.studentRouteProgress || 0) < 6) score -= 30;
  if (route === "reproduce" && (state.studentRouteProgress || 0) >= 3) score += 12;
  if (state.weeklyGoal && !state.weeklyGoal.completed && ["student", "balance"].includes(state.weeklyGoal.type)) score += 26;
  if (backlog >= 2 && mode !== "train") score -= 55;
  if (backlog >= 3) score -= 80;
  return score;
}

function bestTaskPlan(tasks, mode = currentAutoMode()) {
  const options = [];
  for (const t of tasks) {
    const aiMode = chooseAffordableMode(t, mode);
    const aiScore = scoreTaskForAI(t, mode);
    if (aiMode && Number.isFinite(aiScore)) {
      options.push({
        kind: "ai",
        task: t,
        score: aiScore,
        text: `用 ${AI_MODES[aiMode].name} 跑「${t.name}」`,
        action: () => autoRunAI(t),
        reason: `AI适配 ${fitLabel(aiTaskQualityModifier(t))}，成本 $${costForMode(t, aiMode).toFixed(1)}`,
      });
    }
    options.push({
      kind: "student",
      task: t,
      score: scoreTaskForStudent(t, mode),
      text: `派小王处理「${t.name}」`,
      action: () => assignStudent(t.uid),
      reason: `学生适配 ${state.studentRoute ? fitLabel(studentTaskQualityModifier(t)) : "待定"}，路线 ${STUDENT_ROUTES[routeConfig()]?.label}`,
    });
  }
  return options.sort((a, b) => b.score - a.score)[0] || null;
}

function getAutoPlan(mode = currentAutoMode()) {
  const pending = state.inbox.filter(t => !t.assigned);
  const normalPending = pending.filter(t => !t.isPeerReview);
  const peer = pending.find(t => t.isPeerReview);
  const focusLeft = state.focus || 0;
  const risk = labRisk();
  const activeStudent = state.assignedStudent.filter(s => !s.done);

  if (!state.studentRoute) {
    return {
      kind: "modal",
      text: "先选择新生入组路线，否则学生任务决策没有依据。",
      action: showStudentOnboardingModal,
      reason: "学生路线会改变速度、质量和风险。",
      stopAfter: true,
    };
  }
  if (state.suspiciousPending && state.suspiciousPending.length > 0) {
    return {
      kind: "modal",
      text: "先处理可疑交付，避免最后撤稿。",
      action: () => showSuspiciousModal(state.suspiciousPending[0]),
      reason: "这是伦理/撤稿风险选择，需要玩家确认。",
      stopAfter: true,
    };
  }
  if (risk > 0 && focusLeft > 0 && state.cash >= AUDIT_COST) {
    return {
      kind: "audit",
      text: "当前有撤稿风险，建议先内部审计。",
      action: runInternalAudit,
      reason: mode === "safe" ? "低风险策略优先清风险。" : "风险会影响最终 tenure 结局。",
    };
  }
  if (state.cash < 900 && state.week >= 4 && !state.grantApplied && focusLeft > 0) {
    return {
      kind: "modal",
      text: "现金紧张，优先打开 NSF 申请。",
      action: openNSFGrant,
      reason: "NSF 是现金流断裂时的主要恢复手段。",
      stopAfter: true,
    };
  }
  if (focusLeft <= 0) {
    const canOverwork = !state.overworked && state.cash >= OVERWORK_COST && normalPending.length > 0;
    const shouldOverwork = mode === "deadline" || state.week >= 10 || (state.week >= 8 && state.papers < PAPERS_GOAL - 1);
    if (canOverwork && shouldOverwork) {
      return {
        kind: "overwork",
        text: "行动点用完但还有任务，可以爆肝换 1 点。",
        action: overworkForFocus,
        reason: mode === "deadline" ? "冲论文策略允许适度爆肝。" : "还有未处理任务，但会引入疲劳风险。",
      };
    }
    return {
      kind: "week",
      text: "本周行动点用完，进入下一周结算。",
      action: endWeek,
      reason: "继续停留没有收益，结算学生进度和事件。",
    };
  }
  const route = routeConfig();
  const routeTrainingOpen = (route === "literature" && state.studentRouteProgress < 6) ||
    (route === "reproduce" && state.studentRouteProgress < 3);
  const mentorLimit = mode === "train" ? 2 : 1;
  if ((mode === "train" || activeStudent.length >= 2) && focusLeft > 0 && (state.weekStats?.mentor || 0) < mentorLimit && (activeStudent.length > 0 || routeTrainingOpen)) {
    return {
      kind: "mentor",
      text: "学生任务堆积，先开组会把旧代码和 benchmark 讲清楚。",
      action: holdGroupMeeting,
      reason: activeStudent.length > 0 ? `当前 ${activeStudent.length} 个学生任务在排队。` : "组会能推进新生训练并提高下一次交付质量。",
    };
  }
  if (state.weeklyGoal && !state.weeklyGoal.completed) {
    const g = state.weeklyGoal;
    if ((g.type === "audit") && state.cash >= AUDIT_COST) {
      return { kind: "audit", text: "本周 KPI 要求审计，先做内部审计。", action: runInternalAudit, reason: "完成 KPI 同时降低最终爆雷概率。" };
    }
    if ((g.type === "student" || g.type === "balance") && normalPending.length > 0 && (state.weekStats?.student || 0) < (g.type === "student" ? g.target : 1) && mode !== "deadline") {
      const studentBest = [...normalPending].sort((a, b) => scoreTaskForStudent(b, mode) - scoreTaskForStudent(a, mode))[0];
      return { kind: "student", text: `本周 KPI 需要派给小王：${studentBest.name}。`, action: () => assignStudent(studentBest.uid), reason: `学生适配 ${fitLabel(studentTaskQualityModifier(studentBest))}，能推进 KPI。` };
    }
    if ((g.type === "ai" || g.type === "balance") && normalPending.length > 0 && (state.weekStats?.ai || 0) < (g.type === "ai" ? g.target : 1)) {
      const aiBest = [...normalPending].sort((a, b) => scoreTaskForAI(b, mode) - scoreTaskForAI(a, mode))[0];
      if (chooseAffordableMode(aiBest, mode)) {
        return { kind: "ai", text: `本周 KPI 需要跑 AI：${aiBest.name}。`, action: () => autoRunAI(aiBest), reason: `AI适配 ${fitLabel(aiTaskQualityModifier(aiBest))}，能推进 KPI。` };
      }
    }
  }
  if (peer && state.cash < 1500) {
    return {
      kind: "review",
      text: "缺钱时审稿的 $200 有用，接一单。",
      action: () => acceptPeerReview(peer.uid),
      reason: "短期现金补充，代价是 1 个行动点。",
    };
  }
  if (normalPending.length > 0) {
    const best = bestTaskPlan(normalPending, mode);
    if (!best) {
      return {
        kind: "blocked",
        text: "当前现金不足以跑 AI，学生 pipeline 也不应继续堆。",
        action: () => showAdvisorQuip("先结算一周、接审稿或申请 NSF，别硬塞任务。"),
        reason: "自动导航找不到正收益动作。",
        stopAfter: true,
      };
    }
    return {
      ...best,
      text: `${best.text}。`,
    };
  }
  return {
    kind: "week",
    text: "Inbox 已清空，推进到下一周。",
    action: endWeek,
    reason: "没有可分配任务，进入结算获得新事件和新任务。",
  };
}

function chooseStudentTask(tasks) {
  return [...tasks].sort((a, b) => b.workload - a.workload)[0];
}

function chooseAITask(tasks) {
  return [...tasks].sort((a, b) => a.workload - b.workload)[0];
}

function autoRunAI(task) {
  const best = chooseAffordableMode(task);
  if (!best) {
    pushTerm("err", `✗ no affordable AI mode for ${task.name}`);
    showAdvisorQuip("现金不够跑 AI：先接审稿、申请 NSF，或进入下一周等学生交付。");
    screenShake();
    render();
    return;
  }
  if (best && best !== state.mode) {
    state.mode = best;
    const sel = document.getElementById("modeSelect");
    if (sel) sel.value = best;
    pushTerm("dim", `mode → ${AI_MODES[best].name} [auto]`);
  }
  assignAI(task.uid);
}

function chooseAffordableMode(task, mode = currentAutoMode()) {
  const unlocked = affordableModesForTask(task);
  if (unlocked.length === 0) return null;
  const urgent = mode === "deadline" || state.week >= 8 || state.papers < Math.floor(state.week / 4);
  const sorted = unlocked.sort((a, b) => {
    if (mode === "safe") {
      const aq = a[1].q >= 0.82;
      const bq = b[1].q >= 0.82;
      if (aq !== bq) return aq ? -1 : 1;
      return costForMode(task, a[0]) - costForMode(task, b[0]);
    }
    if (urgent) return b[1].q - a[1].q;
    const aGood = a[1].q >= 0.82;
    const bGood = b[1].q >= 0.82;
    if (aGood !== bGood) return aGood ? -1 : 1;
    return costForMode(task, a[0]) - costForMode(task, b[0]);
  });
  return sorted[0][0];
}

function executeAutoPlan(plan, source = "auto-nav") {
  if (!plan || typeof plan.action !== "function") return null;
  const modeName = autoModeName();
  const reason = plan.reason ? ` · ${plan.reason}` : "";
  pushTerm("dim", `  [${source}] ${modeName} → ${plan.text}${reason}`);
  plan.action();
  return plan;
}

function autoNavigate() {
  if (state.ended) return;
  resumeAudio(); playClick();
  const plan = getAutoPlan();
  executeAutoPlan(plan, "auto-nav");
  render();
}

function autoRunDelay(kind) {
  if (kind === "ai") return 650;
  if (kind === "week") return 1450;
  if (kind === "mentor" || kind === "audit" || kind === "overwork") return 650;
  return 500;
}

function autoRunBlocker() {
  if (!state || state.ended) return "游戏已结束";
  if (_modalOpen || _modalQueue.length > 0) return "等待玩家处理弹窗";
  return "";
}

function stopAutoRun(reason) {
  if (!state) return;
  const wasRunning = !!state.autoRunActive;
  state.autoRunActive = false;
  if (wasRunning && reason) pushTerm("dim", `  [auto-run] paused: ${reason}`);
  render();
}

function runAutoStep() {
  if (!state?.autoRunActive) return;
  if (state.aiBusy) {
    setTimeout(runAutoStep, 450);
    return;
  }
  const blocker = autoRunBlocker();
  if (blocker) {
    stopAutoRun(blocker);
    return;
  }
  if ((state.autoRunSteps || 0) >= AUTO_RUN_STEP_LIMIT) {
    stopAutoRun(`已连续执行 ${AUTO_RUN_STEP_LIMIT} 步，防止无人值守跑飞`);
    return;
  }

  const plan = getAutoPlan();
  state.autoRunSteps = (state.autoRunSteps || 0) + 1;
  executeAutoPlan(plan, "auto-run");
  render();

  if (plan.stopAfter || plan.kind === "modal" || plan.kind === "blocked") {
    stopAutoRun(plan.reason || "需要人工确认");
    return;
  }
  setTimeout(runAutoStep, autoRunDelay(plan.kind));
}

function toggleAutoRun() {
  if (state.ended) return;
  resumeAudio(); playClick();
  if (state.autoRunActive) {
    stopAutoRun("玩家手动停止");
    return;
  }
  state.autoRunActive = true;
  state.autoRunSteps = 0;
  pushTerm("dim", `  [auto-run] start · ${autoModeName()} · max ${AUTO_RUN_STEP_LIMIT} steps`);
  render();
  setTimeout(runAutoStep, 120);
}

// ============ SYSTEM C · RANDOM EVENT ROLL ============
function rollEvent() {
  if (Math.random() > 0.25) return;  // 25% per week
  const available = EVENT_POOL.filter(e => !state.firedEvents.includes(e.id));
  if (available.length === 0) return;
  const ev = available[Math.floor(Math.random() * available.length)];
  state.firedEvents.push(ev.id);
  setTimeout(() => showEventModal(ev), 700);
}

function showEventModal(ev) {
  // 包一层统一兜底 render()，防止事件 option 忘记调 render 导致 UI 不同步
  const btns = ev.options.map(o => ({ label: o.label, fn: () => { try { o.fn(); } finally { render(); } } }));
  showModal(`${ev.emoji} ${ev.title}`, ev.body, false, btns);
}

// ============ SYSTEM A · ACT TRANSITION ============
function checkActTransition() {
  const w = state.week;

  // --- Act 1 close: W4 mid-term preview (fires after advancing to W5) ---
  if (w === 5 && !state.actEventsTriggered.includes("act1_close")) {
    state.actEventsTriggered.push("act1_close");
    setTimeout(() => {
      const hasProgress = (state.highQCount||0) >= 1;
      const title = "📢 中期预审";
      const body = hasProgress
        ? `委员会收到了系主任 Zhang Wei 的进展报告。\n\n「Prof. ${state.name} 的研究势头不错，已有初步成果，值得期待。」\n\n系主任随后给你发了一条私信：\n「我对你有信心。继续保持。」`
        : `委员会开了一个小时的会，讨论你的进展。\n\n「Prof. ${state.name} 目前……进展有限。委员会建议加快节奏。」\n\n系主任随后给你发了一条私信：\n「看来这学期你很忙。希望接下来能看到成果。」`;
      if (hasProgress) {
        state.reputation = (state.reputation||0) + 2;
        pushTerm("result","📢 中期预审：进展良好 +2 reputation");
      } else {
        state.reputation = (state.reputation||0) - 1;
        pushTerm("err","📢 中期预审：进展不足 -1 reputation");
      }
      showModal(title, body, hasProgress, [
        { label: "收到，继续努力", fn: () => { render(); } },
      ]);
    }, 900);
  }

  // --- Act 2 open: W5 rival paper clash ---
  if (w === 5 && !state.actEventsTriggered.includes("act2_open")) {
    state.actEventsTriggered.push("act2_open");
    state.act = 2;
    flashScreen("rgba(192,132,252,0.2)");
    playActTransitionSound();
    updateActIndicator();
    setTimeout(() => {
      showModal(
        "⚔️ 隔壁 Wang 组抢发",
        `小王发来截图，脸上写满震惊：\n\n「老师！Wang 组今天挂上 arXiv 了，题目叫『Ab Initio He4 with SRG-Evolved Chiral Forces』——这不就是我们做的东西吗！」\n\n你打开那篇 preprint，越读越心凉。方向高度重合，interaction、cutoff 和 Nmax 扫描也撞了七八成。Wang 有 5 个学生，你只有 1 个。\n\n—— 怎么办？`,
        false,
        [
          {
            label: "换方向（inbox 任务清空重抽，绕开正面竞争）",
            fn: () => {
              state.inbox = state.inbox.filter(t => t.assigned);
              spawnInboxForWeek();
              pushChat("sys","— 你决定转向，inbox 任务重新洗牌 —");
              pushTerm("result","↩️ 方向转换：inbox 清空重抽（-进度，+安全边际）");
              render();
            }
          },
          {
            label: "硬刚（不变，但 reviewer 更严 hiddenFraud 风险 +10%）",
            fn: () => {
              state.hiddenFraud = (state.hiddenFraud||0) + 1;
              pushChat("sys","— 你选择硬刚 Wang 组，全速推进原方向 —");
              pushTerm("result","⚔️ 硬刚模式：reviewer 压力上升 hiddenFraud+1");
              render();
            }
          },
        ]
      );
    }, 1400);
  }

  // --- Act 2 close: W8 budget status（poor → 红警；healthy → 中性通知）---
  if (w === 9 && !state.actEventsTriggered.includes("act2_close")) {
    state.actEventsTriggered.push("act2_close");
    setTimeout(() => {
      if (state.cash < 1000) {
        showModal(
          "💸 预算警告 · 财务红灯",
          `当前余额：$${Math.round(state.cash)}\n\n经费已严重不足。按当前消耗速度，你还有不到 2 周的运转余量。\n\n建议：立即申请 Bridge Grant，或暂停学生 stipend（将导致小王不满）。\n\n系主任 Zhang Wei 不知情——先不要让他知道。`,
          false,
          [
            { label: "📄 立即申请 NSF Bridge Grant", fn: () => { openNSFGrant(); } },
            { label: "先扛着，想想办法", fn: () => {} },
          ]
        );
        pushTerm("err","💸 预算警告：余额 $" + Math.round(state.cash) + " 不足 $1000！");
        screenShake();
      } else {
        // 财务健康，给个正向确认
        showModal(
          "💰 ACT II 闭幕 · 财务盘点",
          `ACT II 危机期结束。\n\n当前余额：$${Math.round(state.cash)}\n发表论文：${state.papers}/${PAPERS_GOAL}\n声誉：${(state.reputation||0)>=0?"+":""}${state.reputation||0}\n\n你扛过了最艰难的阶段。下周进入终局——Mythos 即将发布。`,
          true,
          [{ label: "进入 ACT III", fn: () => {} }]
        );
        pushTerm("result","💰 ACT II 闭幕：财务健康，进入终局");
      }
    }, 800);
  }

  // --- Act 3 open: W9 Mythos launch ---
  if (w === 9 && !state.actEventsTriggered.includes("act3_open")) {
    state.actEventsTriggered.push("act3_open");
    state.act = 3;
    flashScreen("rgba(138,43,226,0.3)");
    playActTransitionSound();
    updateActIndicator();
    setTimeout(() => {
      showModal(
        "🔮 Mythos 发布会",
        `Anthropic 召开发布会。\n\nCEO 说：「今天，我们发布 claude-mythos-preview。它可以在 1M context 中进行 28 秒深度推理，自我验证，准确率比 Opus 再高 4%。\n\n学界版本即日起开放。」\n\n你盯着屏幕，感觉脑子在重启。\n\n—— W9 起，Mythos 可以在终端选择使用（q=98%，$4.50/task）`,
        false,
        [
          {
            label: "🔮 立即启用 Mythos",
            fn: () => {
              state.mode = "mythos";
              const opt = document.querySelector('#modeSelect option[value="mythos"]');
              if (opt) { opt.disabled = false; opt.textContent = "Mythos 🔮"; }
              document.getElementById("modeSelect").value = "mythos";
              pushTerm("result","🔮 Mythos 已激活：q=98%，$4.50/task，人类最后的护城河正在消退");
              showUnlockBanner("Mythos", "q≈98% · $4.50/task · just released");
              flashScreen("rgba(138,43,226,0.4)");
              render();
            }
          },
          { label: "了解了，之后再试", fn: () => {} },
        ]
      );
    }, 1200);
  }
}

function playActTransitionSound() {
  if (muted) return;
  const ac = getAudio();
  const now = ac.currentTime;
  // Dramatic rising tone
  [[130,0],[196,.15],[261,.3],[392,.5],[523,.75]].forEach(([f,d]) => {
    const o = ac.createOscillator(), g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.type = "sine"; o.frequency.value = f;
    g.gain.setValueAtTime(0, now+d);
    g.gain.linearRampToValueAtTime(0.12, now+d+0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, now+d+0.6);
    o.start(now+d); o.stop(now+d+0.65);
  });
}

function updateActIndicator() {
  const el = document.getElementById("actIndicator");
  if (!el) return;
  const acts = {
    1: { label: "🎬 ACT I · 蜜月", cls: "act1" },
    2: { label: "⚔️ ACT II · 危机", cls: "act2" },
    3: { label: "🔮 ACT III · 终局", cls: "act3" },
  };
  const a = acts[state.act] || acts[1];
  el.textContent = a.label;
  el.className = "menuItem actIndicator " + a.cls;
}

function tenureReview() {
  state.ended = true;
  const pending = state.assignedStudent.filter(s => !s.done).length;
  const aiN = state.aiDone.length;
  const sDone = state.assignedStudent.filter(s => s.done).length;
  const fraud = labRisk();

  // Retraction check: each hidden-fraud / legacy-code-debt item has 30% chance of getting caught
  let retracted = false;
  if (fraud > 0 && state.papers >= PAPERS_GOAL) {
    for (let i = 0; i < fraud; i++) {
      if (Math.random() < 0.30) { retracted = true; break; }
    }
    if (retracted) state.papers = Math.max(0, state.papers - 1);
  }

  const pass = state.papers >= PAPERS_GOAL;

  let title, body;

  if (retracted) {
    title = "📣 论文被 Retraction Watch 点名";
    body = `论文发表半年后，Retraction Watch 一篇报道把你们组钉上了耻辱柱。

评论区：
> "这个 antisymmetrizer normalization 明显有问题，一眼就能看出来。"
> "导师在干什么？deuteron sanity check 都不看吗？"

小王这时候已经去了某国家实验室做 postdoc，在 X 上发：
> "学到了很多。感谢我的导师 @Prof_YourName"

你的 tenure 被悄悄推迟了。`;
  } else if (pass) {
    title = "🎓 Tenure 通过";
    body = `12 周结束。系主任 Zhang 在 Faculty Meeting 上宣读了决定。

你的成绩单：
• 论文：${state.papers} 篇（目标 ${PAPERS_GOAL}）
• AI 流水线：${aiN} 个成品 · 累计 $${state.aiCost.toFixed(2)}
• 学生队列：${sDone} 完成 / ${pending} 还在拖 · 累计 $${state.studentCost.toFixed(0)}
• 总花费：$${(START_CASH - state.cash).toFixed(0)}${fraud > 0 ? `\n• 可疑交付（你选择相信）：${fraud} 次` : ""}

对照组 —— 隔壁 Wang 组：
5 个学生，年度预算 $340,000，发了 1 篇 PRC Rapid。

三年后有人想复现你的结果。你 git pull 了一下仓库，十分钟后跑出了完全一样的相移图。
小王？小王去了国家实验室，现在天天算 coupled-cluster。你们偶尔还会发微信。`;
  } else {
    title = "📦 Tenure 未通过";
    body = `12 周结束。你只发了 ${state.papers} 篇论文（目标 ${PAPERS_GOAL}）。

复盘：
• AI 流水线：${aiN} 个成品 · $${state.aiCost.toFixed(2)}
• 学生队列：${sDone} 完成 / ${pending} 还在拖 · $${state.studentCost.toFixed(0)}${fraud > 0 ? `\n• 可疑交付（你选择相信）：${fraud} 次` : ""}

${pending > aiN ? "你给小王派了太多活。她还在修 phase convention 你就没时间了。\n下局试试把容易机械化的矩阵元检查丢给 Claude。" : "AI 模型用得不够狠，你一直抠 Haiku。\n下局解锁 Sonnet / Opus / Mythos 之后别犹豫，贵 10 倍也比等学生重跑 Nmax scan 便宜。"}`;
  }

  if (retracted) { flashScreen("rgba(255,83,112,0.5)"); screenShake(); }
  else if (pass) { playDing(); launchConfetti(); flashScreen("rgba(255,215,0,0.4)"); }
  else { flashScreen("rgba(255,83,112,0.3)"); }

  showModal(title, body, pass && !retracted, [
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

function weeklyGoalProgressText() {
  const g = state.weeklyGoal;
  const stats = state.weekStats;
  if (!g || !stats) return "—";
  if (g.completed) return `已完成 · ${g.reward}`;
  if (g.type === "ai") return `${stats.ai}/${g.target} AI 任务 · ${g.reward}`;
  if (g.type === "student") return `${stats.student}/${g.target} 学生任务 · ${g.reward}`;
  if (g.type === "slot") {
    const gained = Math.max(0, (state.highQCount || qualityPieces()) - (stats.highQStart || 0));
    return `${gained}/${g.target} 高质量成品 · ${g.reward}`;
  }
  if (g.type === "balance") return `AI ${stats.ai >= 1 ? "✓" : "0"} / 小王 ${stats.student >= 1 ? "✓" : "0"} · ${g.reward}`;
  if (g.type === "audit") return `risk ${labRisk()}/${stats.riskStart || 0} · ${g.reward}`;
  if (g.type === "cash") return `当前 $${Math.round(state.cash)} / 目标 $800 · 周末结算`;
  return g.reward || "进行中";
}

function visualAtlasHtml(autoPlan, risk, inProgress) {
  const route = state.studentRoute ? STUDENT_ROUTES[state.studentRoute] : null;
  const routeKey = state.studentRoute || "reproduce";
  const routeMeta = route ? route.short : "先选新生路线：读文献、跑旧代码，还是复现 benchmark。";
  const items = [
    {
      img: ROUTE_VISUALS[routeKey],
      kicker: "STUDENT ROUTE",
      value: route ? route.label : "路线未定",
      meta: routeMeta,
    },
    {
      img: "assets/visual-auto.svg",
      kicker: "AUTO NAV",
      value: autoModeName(),
      meta: `${autoPlan.kind || "plan"}：${autoPlan.text}`,
    },
    {
      img: "assets/visual-paper.svg",
      kicker: "PAPER PIPELINE",
      value: `${inProgress}/4 slots · ${state.papers}/${PAPERS_GOAL} papers`,
      meta: "4 个高质量成品槽合成 1 篇 PRC 级别论文。",
    },
    {
      img: "assets/visual-risk.svg",
      kicker: "REPRODUCIBILITY",
      value: risk > 0 ? `risk ${risk}` : "clean",
      meta: risk > 0 ? "有旧代码黑箱或可疑交付，建议内部审计。" : "当前没有可见撤稿风险。",
    },
  ];
  return items.map(item => `
    <div class="atlasCard">
      <img src="${item.img}" alt="" loading="lazy">
      <div>
        <div class="atlasKicker">${esc(item.kicker)}</div>
        <div class="atlasValue">${esc(item.value)}</div>
        <div class="atlasMeta">${esc(item.meta)}</div>
      </div>
    </div>
  `).join("");
}

function render() {
  const s = state;
  const highQ = s.highQCount || 0;
  const inProgress = Math.max(0, highQ - s.papers * 4); // 距离下一篇还差多少成品
  const noFocus = (s.focus || 0) <= 0;
  document.getElementById("papersM").textContent = s.papers;
  // Update reputation display
  const repEl = document.getElementById("reputationM");
  if (repEl) repEl.textContent = (s.reputation||0) >= 0 ? `+${s.reputation||0}` : `${s.reputation||0}`;
  // Update act indicator
  updateActIndicator();
  // Paper assembly slots
  const slots = document.querySelectorAll("#paperSlots .slot");
  slots.forEach((el, i) => {
    const filled = i < inProgress;
    const wasFilled = el.classList.contains("filled");
    if (filled && !wasFilled) {
      el.classList.add("filled", "justFilled");
      setTimeout(() => el.classList.remove("justFilled"), 650);
    } else if (!filled && wasFilled) {
      el.classList.remove("filled");
    }
  });
  const pubEl = document.getElementById("paperPublishedN");
  if (pubEl) pubEl.textContent = s.papers;
  document.getElementById("cashM").textContent = Math.round(s.cash);
  document.getElementById("weekM").textContent = s.week;
  document.getElementById("clock").textContent = `W${s.week} · ${new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}`;
  document.getElementById("chatMeta").textContent = `在线 · Week ${s.week}`;
  document.getElementById("moodBadge").textContent = s.studentMood;
  const routeBadge = document.getElementById("studentRouteBadge");
  if (routeBadge) {
    const route = s.studentRoute ? STUDENT_ROUTES[s.studentRoute] : null;
    routeBadge.textContent = route ? `${route.badge} ${studentRouteProgressText()}` : "未定路线";
    routeBadge.className = "studentRouteBadge " + (s.studentRoute || "");
    routeBadge.title = route ? route.short : "开局后选择新生入组路线";
  }
  document.getElementById("rivalPapers").textContent = s.rivalPapers || 0;
  const risk = labRisk();
  const autoPlan = getAutoPlan();
  const atlasEl = document.getElementById("visualAtlas");
  if (atlasEl) atlasEl.innerHTML = visualAtlasHtml(autoPlan, risk, inProgress);

  // Strategy strip
  const focusEl = document.getElementById("focusM");
  const focusMaxEl = document.getElementById("focusMaxM");
  if (focusEl) focusEl.textContent = s.focus || 0;
  if (focusMaxEl) focusMaxEl.textContent = s.focusMax || FOCUS_PER_WEEK;
  const riskEl = document.getElementById("riskM");
  if (riskEl) riskEl.textContent = risk;
  const riskFill = document.getElementById("riskGaugeFill");
  if (riskFill) riskFill.style.width = `${Math.min(100, risk * 25 + (s.suspiciousPending?.length || 0) * 15)}%`;
  const riskHint = document.getElementById("riskHint");
  if (riskHint) {
    riskHint.textContent = risk > 0
      ? `${risk} 个潜在风险 · 建议审计${(s.legacyDebt || 0) > 0 ? `（旧代码债 ${s.legacyDebt}）` : ""}`
      : ((s.auditShield || 0) > 0 ? `审计护盾 ${s.auditShield} 次` : "暂无可疑交付");
  }
  const goalTitle = document.getElementById("weeklyGoalTitle");
  const goalProgress = document.getElementById("weeklyGoalProgress");
  if (goalTitle) goalTitle.textContent = s.weeklyGoal ? s.weeklyGoal.title : "—";
  if (goalProgress) goalProgress.textContent = weeklyGoalProgressText();
  const autoText = document.getElementById("autoNavText");
  if (autoText) autoText.textContent = `${s.autoRunActive ? "⏩" : "🧭"} ${autoModeName()}：${autoPlan.text}${autoPlan.reason ? ` · ${autoPlan.reason}` : ""}`;
  const autoModeSelect = document.getElementById("autoModeSelect");
  if (autoModeSelect) autoModeSelect.value = currentAutoMode();
  const auditBtn = document.getElementById("auditBtn");
  if (auditBtn) auditBtn.disabled = s.ended || noFocus || s.cash < AUDIT_COST;
  const mentorBtn = document.getElementById("mentorBtn");
  if (mentorBtn) mentorBtn.disabled = s.ended || noFocus;
  const overworkBtn = document.getElementById("overworkBtn");
  if (overworkBtn) overworkBtn.disabled = s.ended || s.overworked || s.cash < OVERWORK_COST;
  const autoNavBtn = document.getElementById("autoNavBtn");
  if (autoNavBtn) autoNavBtn.disabled = s.ended || s.autoRunActive;
  const autoRunBtn = document.getElementById("autoRunBtn");
  if (autoRunBtn) {
    autoRunBtn.disabled = s.ended;
    autoRunBtn.textContent = s.autoRunActive ? "⏸ 停止自动" : "⏩ 自动推进";
    autoRunBtn.classList.toggle("running", !!s.autoRunActive);
  }

  // NSF button unlock state
  const nsfBtn = document.getElementById("nsfGrantBtn");
  if (nsfBtn) {
    const ready = s.week >= 4 && !s.grantApplied && !noFocus;
    nsfBtn.disabled = !ready;
    nsfBtn.style.opacity = ready ? "1" : "0.45";
    nsfBtn.style.cursor = ready ? "pointer" : "not-allowed";
    nsfBtn.textContent = s.grantApplied ? "📄 NSF 已申请" : (s.week < 4 ? "📄 NSF 🔒W4" : "📄 申请 NSF");
  }

  // Suspicious counter in menu bar
  updateSuspiciousCounter();

  // Inbox
  const inboxEl = document.getElementById("inboxBody");
  const pending = s.inbox.filter(t => !t.assigned);

  // Build suspicious task cards from assignedStudent
  const suspiciousCards = (s.suspiciousPending || []).map(t => `
    <div class="taskCard suspicious" id="suspicious-${t.uid}">
      <div class="from">🚨 可疑交付 · 小王 · 任务「${esc(t.name)}」</div>
      <div class="subj"><span class="emojiPill">${t.emoji}</span>${esc(t.subj)} <span class="suspiciousBadge">交得太快了…</span></div>
      <div class="body" style="color:var(--warn)">workload=${t.workload}，${t.age} 周即完成。需要你做决定。</div>
      <div class="actions">
        <button class="toS" onclick="handleSuspicious(${t.uid}, 'trust')">信她，直接用</button>
        <button class="toA" onclick="handleSuspicious(${t.uid}, 'rerun')">让她重跑，你亲自查</button>
      </div>
    </div>
  `).join("");

  if (pending.length === 0 && !suspiciousCards) {
    inboxEl.innerHTML = `<div class="empty">Inbox 清空。下班吧。</div>`;
  } else {
    inboxEl.innerHTML = suspiciousCards + pending.map(t => {
      if (t.isPeerReview) {
        return `
          <div class="taskCard hasArt" style="border-color:rgba(77,171,247,0.4)">
            <img class="taskCardArt" src="${taskVisualSrc(t)}" alt="" loading="lazy">
            <div class="taskCardMain">
              <div class="from" style="color:var(--link)">From: ${esc(t.from)}</div>
              <div class="subj"><span class="emojiPill">${t.emoji}</span>${esc(t.subj)}</div>
              <div class="body" style="white-space:pre-wrap">${esc(t.body)}</div>
              <div class="actions">
                <button class="toA" onclick="acceptPeerReview(${t.uid})" ${noFocus ? "disabled" : ""}>✅ 接受审稿 +$200</button>
                <button class="toS" onclick="skipPeerReview(${t.uid})">⛔ 拒绝</button>
              </div>
            </div>
          </div>`;
      }
      return `
        <div class="taskCard hasArt">
          <img class="taskCardArt" src="${taskVisualSrc(t)}" alt="" loading="lazy">
          <div class="taskCardMain">
            <div class="from">From: ${esc(t.from)}</div>
            <div class="subj"><span class="emojiPill">${t.emoji}</span>${esc(t.subj)}</div>
            <div class="body">${esc(t.body)}</div>
            ${taskFitHtml(t)}
            <div class="actions">
              <button class="toS" onclick="assignStudent(${t.uid})" ${noFocus ? "disabled" : ""}>→ 派给小王</button>
              <button class="toA" onclick="assignAI(${t.uid})" ${noFocus ? "disabled" : ""}>→ 跑 AI ($${aiCostFor(t).toFixed(1)})</button>
            </div>
          </div>
        </div>`;
    }).join("");
    if (pending.length === 0) {
      inboxEl.innerHTML += `<div class="empty">无新任务。下班吧。</div>`;
    }
  }

  // Chat — stagger new messages
  const chatEl = document.getElementById("chatBody");
  const oldCount = chatEl.querySelectorAll(".msg").length;
  chatEl.innerHTML = s.chatLog.map((m, idx) => {
    const delay = idx >= oldCount ? `animation-delay:${(idx-oldCount)*80}ms` : "animation-delay:0ms;animation-duration:0.01ms";
    if (m.who === "sys") return `<div class="msg sys" style="${delay}"><div class="bubble">${esc(m.text)}</div></div>`;
    const bubbleCls = (m.who === "them" && m.cat) ? m.cat : "";
    return `<div class="msg ${m.who}" style="${delay}"><div class="bubble ${bubbleCls}">${esc(m.text)}${m.t?`<span class="ts">${m.t}</span>`:""}</div></div>`;
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

function aiCostFor(t) { return AI_MODES[state.mode].cost * t.workload / 3 * (state.aiDiscount ? 0.5 : 1); }
function pick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
function taskKey(t) { return `${t.id || ""}::${t.subj || t.name || ""}`; }
function esc(s) { return String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c])); }

// Modal queue — 防止多个 setTimeout 同时弹窗互相覆盖（endWeek 在 W5/W9 同时排多 modal）
const _modalQueue = [];
let _modalOpen = false;
function showModal(title, body, pass, options) {
  if (state?.autoRunActive) stopAutoRun("等待玩家处理弹窗");
  _modalQueue.push({ title, body, pass, options });
  _processModalQueue();
}
function _processModalQueue() {
  if (_modalOpen || _modalQueue.length === 0) return;
  _modalOpen = true;
  const { title, body, pass, options } = _modalQueue.shift();
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
function closeModal() {
  document.getElementById("modal").classList.add("hidden");
  _modalOpen = false;
  // Chain: show next queued modal after a tiny gap
  setTimeout(_processModalQueue, 250);
}

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

function handleSuspicious(uid, choice) {
  resumeAudio(); playClick();
  const s = state.assignedStudent.find(x => x.uid === uid);
  if (!s) return;
  if (choice === 'trust') {
    s.suspicious = false;
    s.done = true;
    if ((state.auditShield || 0) > 0) {
      state.auditShield -= 1;
      pushTerm("result", "🛡️ 审计护盾生效：这次可疑交付未增加撤稿风险");
    } else {
      state.hiddenFraud += 1;
    }
    state.suspiciousPending = state.suspiciousPending.filter(x => x.uid !== uid);
    pushChat("sys", `— 你选择相信小王，任务「${s.name}」标记为完成（内心有点虚…）—`);
    checkPapers();
  } else {
    s.suspicious = false;
    s.done = false;
    s.progress = Math.floor(s.progress / 2);
    state.cash -= 200;
    state.suspiciousPending = state.suspiciousPending.filter(x => x.uid !== uid);
    pushChat("them", pick(STUDENT_LINES.blameshift), "blameshift");
    pushChat("sys", `— 你让小王重跑，扣 $200 验收费，任务退回进行中 —`);
    bounceEl("cashM");
  }
  updateSuspiciousCounter();
  render();
}

function scrollToSuspicious() {
  const el = document.querySelector(".taskCard.suspicious");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// NSF grant button binding (W4+ unlock)
document.getElementById("nsfGrantBtn").addEventListener("click", () => {
  resumeAudio();
  openNSFGrant();
});
document.getElementById("auditBtn").addEventListener("click", runInternalAudit);
document.getElementById("mentorBtn").addEventListener("click", holdGroupMeeting);
document.getElementById("overworkBtn").addEventListener("click", overworkForFocus);
document.getElementById("autoNavBtn").addEventListener("click", autoNavigate);
document.getElementById("autoRunBtn").addEventListener("click", toggleAutoRun);
document.getElementById("autoModeSelect").addEventListener("change", e => {
  if (!state) return;
  resumeAudio(); playClick();
  state.autoMode = e.target.value;
  pushTerm("dim", `  [auto-mode] ${autoModeName()}`);
  render();
});

// Expose to onclick handlers
window.assignStudent = assignStudent;
window.assignAI = assignAI;
window.handleSuspicious = handleSuspicious;
window.scrollToSuspicious = scrollToSuspicious;
window.acceptPeerReview = acceptPeerReview;
window.skipPeerReview = skipPeerReview;
window.openNSFGrant = openNSFGrant;
window.runInternalAudit = runInternalAudit;
window.holdGroupMeeting = holdGroupMeeting;
window.overworkForFocus = overworkForFocus;
window.autoNavigate = autoNavigate;
window.toggleAutoRun = toggleAutoRun;
