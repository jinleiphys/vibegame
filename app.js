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

// 每条是一个气泡串（array of bubbles），群聊里连续发出来，更像真人
const STUDENT_LINES = {
  receive: [
    ["好的老师！", "我这就开搞 💪"],
    ["收到收到", "正好我最近想练这块", "不会就学～"],
    ["OK", "不过 workload 有点大啊…您给我几天？"],
    ["好的老师…", "（这块我不是特别熟）", "但我学！"],
    ["来啦", "刚好我手头那个 side project 告一段落"],
  ],

  excuse: [
    // 环境党
    ["老师…", "我这周都在调环境", "cuda 12.1 和 torch 2.3 不兼容", "github issue 里有人说要降到 11.8", "我重装了三遍系统了 😭"],
    ["那个 baseline 我 clone 下来了", "requirements.txt 装到一半崩了", "作者 github 最后更新是 2022 年", "我给作者发了邮件还没回"],
    ["老师我在 conda env 里卡了两天", "apex 编不过", "师兄说他也编不过，让我等 docker 镜像", "这不是我的问题真的"],

    // 甩锅 GPU 党
    ["师兄把 A100 借走了", "说跑一个大 ablation", "排队到我可能要下周三", "要不我先做点别的？"],
    ["IT 昨天说集群要维护", "我的 job 全被 kill 了", "checkpoint 没保最新的那个", "要从 epoch 30 重跑…"],
    ["张师兄的代码把我的实验覆盖了", "他说他不是故意的", "但我的 log 全没了", "得重跑一遍"],

    // 家里事党
    ["老师不好意思", "家里有点事", "我妈非让我回去一趟", "说有个亲戚要介绍对象…", "我周末就回来 🙏"],
    ["老师…", "我奶奶住院了", "我得回家一趟", "可能这周见不到我了"],
    ["我男朋友下周生日", "他在外地", "我想请 3 天假过去一下", "回来我一定补上 🥺"],

    // 身体党（借鉴"感冒发烧骨折腰闪脚崴"梗）
    ["老师这周真不好意思", "我感冒了，还起了点低烧", "晚上一直咳嗽睡不好", "白天也没什么状态…"],
    ["上周末打球把脚崴了", "现在坐工位还行，走路不行", "去实验室不太方便", "我在家远程看看"],
    ["老师我腰闪了…", "坐一个小时就疼", "医生说这周最好躺平", "我先把文献看了 🥲"],

    // 水组会党
    ["老师这周具体 coding 不多", "但我想了很多", "感觉我们方向的 big picture 可能有点问题…", "我准备组会上跟您聊聊"],
    ["这周我主要在看文献", "发现一篇 2019 的 workshop 和我们有点像", "但是他们思路完全反的", "我想再深挖一下"],
    ["老师能组会讲讲 quals 的内容吗", "顺便热个身", "正好我也要准备了"],

    // 换方向党（画饼转移话题）
    ["老师", "我这周想了一下", "我觉得这个方向做出来也就是 workshop", "我有个新 idea 跟 diffusion 结合", "您觉得怎么样？"],
    ["老师…", "我师兄最近搞了一个 hot 的方向", "他问我要不要一起做", "我就做 3 天可以吗？", "绝对不耽误主线 🙇"],
    ["我觉得我们这个 baseline 选错了", "现在大家都不比这个了", "能不能换一个对比对象？"],

    // workshop / 课程党
    ["下周 NeurIPS workshop deadline", "我想先把那个 poster 弄完", "这个主线再缓一缓好吗", "workshop 也算一篇啊"],
    ["ML 课程 final project 周五交", "我实在没时间", "等我交完就回来", "求老师放我一马"],
    ["quals 下下周考", "我这周真得复习", "您也知道挂了就…💀"],

    // 玄学党
    ["电脑昨天蓝屏了", "我送去修了", "数据恢复要一周", "真的不是我的问题"],
    ["我 git 搞崩了", "rebase 的时候把 3 个 commit 合没了", "在找怎么恢复", "今天一天都在处理这个"],
    ["老师 overleaf 抽风", "我写的那段 method 不见了", "只能重写…我要哭了 😭"],
  ],

  progress: [
    ["跑了大概一半吧", "中间有个 nan loss 的 bug 在查", "应该不是大问题"],
    ["结果出来了…", "但是和我们期望的差挺多", "我在看是不是 hyperparameter 的问题", "还是方法本身有问题 🥲"],
    ["差不多了老师", "在做最后一版的对比实验", "下周交给您"],
    ["我跑出来一个初步的结果", "但是 variance 有点大", "想再跑 3 个 seed 看看是不是偶然"],
    ["方法能跑了", "但是速度比 baseline 慢 3 倍 🫠", "我在 profile 哪里慢"],
  ],

  done: [
    ["跑通啦 🎉", "我大概评估了一下，能到 70% 吧", "您有空看一下 👀"],
    ["交了！", "代码在 branch feat/xxx", "图在 overleaf 我新开了一节", "老师您把关"],
    ["终于搞定了…", "这周基本没睡", "我先去补个觉 🥲"],
    ["完成了老师", "不过我想说一下", "我在做的时候觉得 intro 那一段可能换个 framing 会更 compelling", "您觉得呢？"],
    ["done！", "顺便我把 README 也补了", "docker 镜像 push 上去了", "下次跑实验能快很多 ✨", "[PUA生效 🔥]"],
  ],

  chat: [
    ["老师您在吗 👀"],
    ["老师这个 bug 困了我两天了", "在线等，挺急的"],
    ["老师您上次说的那篇 paper 我找到了", "作者居然是我本科老师 😂"],
    ["今天食堂的鸡腿真难吃", "吐槽一下"],
    ["老师 NeurIPS 的 notification 出了没…", "我心跳有点快"],
    ["老师", "隔壁 Wang 组那个学生发朋友圈", "说他们又发了一篇 arXiv", "我看了下跟我们方向有点像 😨"],
  ],

  shady: [
    // 数据党
    ["老师跑通啦 🎉", "p = 0.043 🙈", "compelling 吧！"],
    ["那个 baseline 我其实没跑全", "只跑了 3 个 seed", "但是均值差不多就这样", "再跑意义也不大对吧？"],
    ["我把那两个 outlier 扔了", "曲线漂亮多了", "应该没事吧老师…？"],
    // 凑数党
    ["ablation table 那几个数", "我是按趋势估的", "reviewer 不会真去复现吧？", "大家不都这样的吗 😅"],
    ["那个 metric 原论文没公开代码", "我按我的理解实现的", "数字跟他们的对不上", "但我觉得我的更合理"],
    // 借口党
    ["这个数据我重新算了一遍", "和原始文件有点对不上", "可能 random seed 不一样？", "我 reproduce 不太出来但结果方向是对的"],
    ["proof 里那个 edge case", "我用一句 'it follows from standard arguments' 带过了", "reviewer 没要求展开啊"],
  ],

  blameshift: [
    ["老师…这个思路", "是您一开始让我做的呀", "我完全是按您说的来的", "🥲"],
    ["是张师兄教我这么处理 outlier 的", "他说他们组一直这么做", "我就…直接用了"],
    ["这个数据集是 collaborator 给的", "我没动过原始文件", "可能他们那边就有问题"],
    ["GPU 不够是 IT 的问题啊", "我申请了两次都没批", "我能怎么办 🤷"],
    ["那篇 reference 是上一个 RA 加的", "他毕业了", "我也不知道为啥引"],
    ["我也不想这样的老师", "是 deadline 逼得", "您当时不是说能赶上就行吗…"],
  ],
};

const ADVISOR_QUIPS = [
  "在我看来一周 168 小时，她的有效科研时间大概 12 小时。",
  "做人做事不能慌。",
  "实验失败了不要紧，毕竟科学家也是靠想象力吃饭的。",
  "致谢别写我，没教过这么笨的。",
  "有的同学就是不听，不但看电影，还看通宵电影。",
  "人生在世，快乐二字。",
  "这一周她 168 小时都干嘛去了？",
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
    emoji: "🎓", title: "小王收到 Meta offer",
    body: "小王进来找你谈话，表情复杂：\n\n「老师……Meta 给了我 offer，年薪 $500k package，下周就想让我 on-board。我……还没决定。」\n\n你的心跳漏了半拍。她手头还有三个未完成任务。",
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
            pushChat("sys","— 小王辞职了，未完成的任务全部作废……祝她前程似锦 —");
            pushTerm("result","💔 小王去 Meta 了，未完成任务清零"); screenShake(); flashScreen("rgba(255,83,112,0.2)");
          } else {
            pushChat("sys","— 小王感谢了你的祝福，但最终选择留下来继续读 PhD —");
            pushTerm("result","😮 小王居然留下来了！"); }
          render(); } },
    ],
  },
  {
    id: "arxiv_clash",
    emoji: "📰", title: "arXiv 撞车",
    body: "凌晨 2:37，你手机震动。\n\n小王发来截图：一篇刚上 arXiv 的预印本，idea 和你们几乎一模一样，连实验设置都撞了。作者来自 CMU。\n\n你盯着屏幕，感觉时间在流逝。",
    options: [
      { label: "抢快 push 到 workshop（-$500，+1 slot，卷赢他们）",
        fn: () => { state.cash -= 500; bounceEl("cashM");
          state.highQCount = (state.highQCount||0) + 2;
          checkPapers();
          pushChat("sys","— 你们连夜赶出一个 workshop 版本，先抢了旗帜 —");
          pushTerm("result","⚡ 紧急 push 成功 -$500 +1 slot（已标注先发优先权）"); render(); } },
      { label: "等等看，关注他们后续",
        fn: () => { pushChat("sys","— 你决定以不变应万变，继续打磨自己的版本 —"); } },
    ],
  },
  {
    id: "reviewer2_returns",
    emoji: "🧟", title: "Reviewer 2 回归",
    body: "新一轮投稿的 review 回来了。你一眼看到 Reviewer 2 的措辞——和三年前那个毁掉你 ICML 论文的人，一字一顿，如出一辙。\n\n「Novelty is incremental at best. Lacks rigor.」\n\n他又回来了。",
    options: [
      { label: "找 AC 申诉（+1 reputation，-3 Judgment）",
        fn: () => { state.reputation = (state.reputation||0) + 1;
          pushChat("sys","— 你写了一封措辞精准的申诉信给 AC，据理力争 —");
          pushTerm("result","⚖️ 申诉成功 +1 reputation（损耗了大量精力 -3 Judgment）"); render(); } },
      { label: "忍了，下次换个 venue 投",
        fn: () => { state.reputation = (state.reputation||0) - 1;
          pushChat("sys","— 你吞下这口气，默默记下这个 reviewer 的文风 —");
          pushTerm("result","😤 默默承受 -1 reputation"); render(); } },
    ],
  },
  {
    id: "gpu_maintenance",
    emoji: "🔌", title: "集群维护",
    body: "IT 发来系统邮件：\n\n「本周四至周日，学校 GPU 集群将进行例行维护，所有 job 将被强制终止，checkpoint 请自行备份。」\n\n小王已经在跑的三个实验……没有 checkpoint。",
    options: [
      { label: "知道了（所有 student 任务 progress -2）",
        fn: () => {
          state.assignedStudent.filter(s=>!s.done).forEach(s => { s.progress = Math.max(0, s.progress - 2); });
          pushChat("sys","— 集群维护三天，小王的实验进度倒退了不少 —");
          pushTerm("result","🔌 GPU 停机 -2 progress（所有 pending 任务）"); render(); } },
    ],
  },
  {
    id: "twitter_viral",
    emoji: "🎰", title: "Twitter 意外火了",
    body: "你昨晚随手发了一条推——把刚跑出的实验截图配了句「有点东西」——没想到被两个大 V 转发，一觉醒来 10k 转发、500 条评论。\n\n有人问能不能合作，有人说「终于看到靠谱的 AI 研究」，Reviewer 2 的账号也在底下点了个 Like。",
    options: [
      { label: "知道了！（+3 reputation）",
        fn: () => { state.reputation = (state.reputation||0) + 3;
          pushTerm("result","🔥 Twitter 爆款 +3 reputation（互联网的馈赠）"); render(); } },
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
      { label: "偷偷休一周（+3 Judgment，清空内心包袱）",
        fn: () => { state.reputation = (state.reputation||0);
          pushChat("sys","— 你放松了两天，思路反而更清晰了 +3 Judgment（满血复活）—");
          pushTerm("result","🏖️ 摸鱼有道 +3 Judgment（系主任不在，猫就跳上桌）"); render(); } },
      { label: "加班赶进度（+2 slots，以我手速）",
        fn: () => { state.highQCount = (state.highQCount||0) + 2; checkPapers();
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
    body: "某 AI 独角兽的 Research Director 发来 DM：\n\n「看了你们最近的 preprint，我们公司所有研究员都在讨论。想邀请你来做 invited talk，$2,000 honorarium，差旅全包。」\n\n你打开日历，发现下周还有两个 deadline。",
    options: [
      { label: "接受（+$2,000，-2 Judgment，本周进度暂停）",
        fn: () => { state.cash += 2000; bounceEl("cashM");
          pushChat("sys","— 你做了一场精彩的 invited talk，honorarium 进账！—");
          pushTerm("result","🎤 Talk 完成 +$2,000 （-2 Judgment，但值了）"); render(); } },
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
    body: "NeurIPS Program Chair 发来私信：\n\n「Congratulations! Your paper has been selected as a Best Paper Award nominee. Please confirm your attendance at the awards ceremony.」\n\n你把那条消息截图发给了父母。",
    options: [
      { label: "飞去现场（-$800，-1 周，+5 reputation，值！）",
        fn: () => { state.cash -= 800; state.reputation = (state.reputation||0) + 5; bounceEl("cashM");
          flashScreen("rgba(255,215,0,0.35)"); playDing();
          pushChat("sys","— 你亲自出席颁奖典礼，握到了那块奖牌 🏆 —");
          pushTerm("result","🏆 Best Paper 现场 -$800 +5 reputation（值得！）"); render(); } },
      { label: "线上 Zoom 参加（省机票，-2 reputation）",
        fn: () => { state.reputation = (state.reputation||0) - 2;
          pushChat("sys","— 你在宿舍用 Zoom 出席……掌声通过扬声器传来，有点尴尬 —");
          pushTerm("result","💻 Zoom 参会 -2 reputation（省了机票钱）"); render(); } },
    ],
  },
  {
    id: "reproduce_crisis",
    emoji: "🔬", title: "复现危机",
    body: "Retraction Watch 发了一篇博文，圈了你组之前某篇 paper 的图——有读者发现曲线和原始 CSV 对不上。\n\n评论区已经有 47 条回复，两条点了你的 GitHub 账号。",
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
            state.papers = Math.max(0, state.papers - 1); state.hiddenFraud = Math.max(0, state.hiddenFraud - 1);
            pushChat("sys","— 论文被撤稿，Retraction Watch 发了正式报道 😱 —");
            pushTerm("result","💀 撤稿 -1 paper（嘴硬输了）"); screenShake(); flashScreen("rgba(255,83,112,0.4)");
          }
          render(); } },
    ],
  },
  {
    id: "shower_idea",
    emoji: "💡", title: "洗澡时的灵感",
    body: "凌晨 1 点，你在洗澡。\n\n热水哗哗流着，脑子却突然高速转动——一个把 attention 机制和强化学习信号结合的新框架，清晰得像是被人在白板上写出来的。\n\n你冲出浴室，头发没擦，拿起手机开始录音。",
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
    body: "GitHub 通知涌进来：你上周整理的代码仓库在 r/MachineLearning 被人分享，一夜之间被 fork 了 507 次，还有人在 Issues 里问「能出个 paper 版本吗？」\n\n500 个人正在用你的代码做实验。",
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
    excuseCount: 0,
    ended: false,
    seq: 0,
    tickerIdx: 0,
    hiddenFraud: 0,
    suspiciousPending: [],
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
  // 方差 ±8% → zero-shot 范围 0.62~0.78，有真实波动感（有时合格有时翻车）
  const q = Math.max(0, Math.min(1, mode.q + (Math.random()-0.5)*0.16));

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
          state.hiddenFraud += 1;
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
      pushChat("them", pick(STUDENT_LINES.excuse), "excuse");
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
      // Suspicious delivery check: high-workload tasks finished too fast
      const isSuspicious = (s.workload >= 4 && s.age <= 2 && Math.random() < 0.5);
      if (isSuspicious) {
        s.done = false;
        s.suspicious = true;
        state.suspiciousPending.push(s);
        pushChat("them", pick(STUDENT_LINES.shady), "shady");
        pushChat("sys", `— 小王提交了「${s.name}」但交得太快了… —`);
        updateSuspiciousCounter();
      } else {
        s.done = true;
        s.quality = 0.45 + Math.random() * 0.30;
        pushChat("them", pick(STUDENT_LINES.done));
      }
    }
  }

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

  state.week += 1;

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

  spawnInboxForWeek();
  state.rivalIdx = (state.rivalIdx + 1) % RIVAL_TICKER.length;
  rotateTicker();
  checkPapers();
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
  const highQ = state.aiDone.filter(d => d.quality >= 0.68).length +
                state.assignedStudent.filter(s => s.done && s.quality >= 0.55).length;
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
  resumeAudio(); playClick();
  const kwOpts = ["efficiency","safety","reasoning","alignment","scaling","data"];
  const hotKws = ["safety","alignment"];
  const selected = [];

  // Build keyword selection modal body
  const kw1 = kwOpts[Math.floor(Math.random()*3)];
  const kw2 = kwOpts[3 + Math.floor(Math.random()*3)];
  const kw3 = hotKws[Math.floor(Math.random()*2)];
  const kws = [kw1, kw2, kw3];

  const hotCount = kws.filter(k => hotKws.includes(k)).length;
  const successRate = Math.min(95, 30 + 20 * state.papers + 5 * hotCount + (state.nsfBonus||0));
  const bodyText = `你决定以以下 3 个方向提交 Research Statement：\n  1. "${kw1}"  2. "${kw2}"  3. "${kw3}"\n\n热词命中：${hotCount}（safety / alignment 现在很热）\n你的发表数：${state.papers} 篇\n\n综合成功率：${successRate}%\n\n祝你好运——Reviewer 3 正在虎视眈眈。`;

  showModal("📄 申请 NSF Grant", bodyText, false, [
    {
      label: `提交申请（成功率 ${successRate}%）`,
      fn: () => {
        state.grantApplied = true;
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
    from: "pc-chair@icml2026.org",
    subj: "Invitation: PC Reviewer · ICML 2026 · +$200",
    body: "Dear Prof. " + state.name + ",\n\nWe would like to invite you to serve as a reviewer for ICML 2026. Honorarium: $200 per paper reviewed. Estimated effort: 1 unit of Judgment.\n\n-- PC Chair",
    workload: 1,
    assigned: null,
    isPeerReview: true,
  };
  state.inbox.push(inboxItem);
  pushChat("sys","— 📝 ICML PC Chair 发来审稿邀请，+$200 接不接？—");
}

function acceptPeerReview(uid) {
  resumeAudio(); playClick();
  const t = state.inbox.find(x => x.uid === uid);
  if (!t) return;
  t.assigned = "done";
  state.cash += 200; bounceEl("cashM");
  pushTerm("result","📝 peer review 接单 +$200（学界互助，回报立竿见影）");
  pushChat("sys","— 你接受了审稿邀请，$200 进账 —");
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
        `小王发来截图，脸上写满震惊：\n\n「老师！Wang 组今天挂上 arXiv 了，题目叫『Efficient Attention via Structured Sparsity』——这不就是我们做的东西吗！」\n\n你打开那篇 preprint，越读越心凉。方向高度重合，实验设置也撞了七八成。Wang 有 5 个学生，你只有 1 个。\n\n—— 怎么办？`,
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
  const fraud = state.hiddenFraud || 0;

  // Retraction check: each hidden-fraud paper has 30% chance of getting caught
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
> "这个 Lemma 的证明明显有问题，一眼就能看出来。"
> "导师在干什么？自己不看学生的工作吗？"

小王这时候已经去了某某 AI Lab，年薪 500k，在 Twitter 上发：
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
5 个学生，年度预算 $340,000，发了 1 篇 workshop。

三年后有人想复现你的结果。你 git pull 了一下仓库，十分钟后跑出了完全一样的图。
小王？小王去 industry 了，现在一年赚 300k。你们偶尔还会发微信。`;
  } else {
    title = "📦 Tenure 未通过";
    body = `12 周结束。你只发了 ${state.papers} 篇论文（目标 ${PAPERS_GOAL}）。

复盘：
• AI 流水线：${aiN} 个成品 · $${state.aiCost.toFixed(2)}
• 学生队列：${sDone} 完成 / ${pending} 还在拖 · $${state.studentCost.toFixed(0)}${fraud > 0 ? `\n• 可疑交付（你选择相信）：${fraud} 次` : ""}

${pending > aiN ? "你给小王派了太多活。她还在调环境你就没时间了。\n下局试试把任务都丢给 Claude。" : "AI 模型用得不够狠，你一直抠 Haiku。\n下局解锁 Sonnet / Opus / Mythos 之后别犹豫，贵 10 倍也比等学生强。"}`;
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

function render() {
  const s = state;
  const highQ = s.highQCount || 0;
  const inProgress = Math.max(0, highQ - s.papers * 4); // 距离下一篇还差多少成品
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
  document.getElementById("rivalPapers").textContent = s.rivalPapers || 0;

  // NSF button unlock state
  const nsfBtn = document.getElementById("nsfGrantBtn");
  if (nsfBtn) {
    const ready = s.week >= 4 && !s.grantApplied;
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
          <div class="taskCard" style="border-color:rgba(77,171,247,0.4)">
            <div class="from" style="color:var(--link)">From: ${esc(t.from)}</div>
            <div class="subj"><span class="emojiPill">${t.emoji}</span>${esc(t.subj)}</div>
            <div class="body" style="white-space:pre-wrap">${esc(t.body)}</div>
            <div class="actions">
              <button class="toA" onclick="acceptPeerReview(${t.uid})">✅ 接受审稿 +$200</button>
              <button class="toS" onclick="skipPeerReview(${t.uid})">⛔ 拒绝</button>
            </div>
          </div>`;
      }
      return `
        <div class="taskCard">
          <div class="from">From: ${esc(t.from)}</div>
          <div class="subj"><span class="emojiPill">${t.emoji}</span>${esc(t.subj)}</div>
          <div class="body">${esc(t.body)}</div>
          <div class="actions">
            <button class="toS" onclick="assignStudent(${t.uid})">→ 派给小王</button>
            <button class="toA" onclick="assignAI(${t.uid})">→ 跑 AI ($${aiCostFor(t).toFixed(1)})</button>
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

function aiCostFor(t) { return AI_MODES[state.mode].cost * t.workload / 3; }
function pick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function esc(s) { return String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c])); }

// Modal queue — 防止多个 setTimeout 同时弹窗互相覆盖（endWeek 在 W5/W9 同时排多 modal）
const _modalQueue = [];
let _modalOpen = false;
function showModal(title, body, pass, options) {
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
    state.hiddenFraud += 1;
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

// Expose to onclick handlers
window.assignStudent = assignStudent;
window.assignAI = assignAI;
window.handleSuspicious = handleSuspicious;
window.scrollToSuspicious = scrollToSuspicious;
window.acceptPeerReview = acceptPeerReview;
window.skipPeerReview = skipPeerReview;
window.openNSFGrant = openNSFGrant;
