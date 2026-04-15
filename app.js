/* ═══════════════════════════════════════════════════
   AI科研生存模拟器 · 新时代青椒的挣扎
   Fake university portal style · Quarter-based
   ═══════════════════════════════════════════════════ */

const SAVE_KEY = "ai-research-sim-v3";
const META_KEY = "ai-research-sim-meta-v3";
const TOTAL_YEARS = 6;

/* ═══ DATA ═══ */

const NAMES = [
  "张三丰","李思远","王小明","赵德柱","钱多多","孙悟净","周不通","吴用功",
  "郑大钱","朱二狗","刘看山","陈独秀","黄牛皮","杨过儿","马什么梅",
];

const DIRECTIONS = [
  { id: "llm", icon: "🤖", name: "大模型", desc: "卷到飞起的赛道" },
  { id: "cv", icon: "👁️", name: "计算机视觉", desc: "一切皆可 diffusion" },
  { id: "bio", icon: "🧬", name: "AI+生物", desc: "AlphaFold 之后的世界" },
  { id: "physics", icon: "⚛️", name: "AI+物理", desc: "用神经网络解薛定谔" },
  { id: "social", icon: "📊", name: "计算社科", desc: "大数据治理一切" },
  { id: "achem", icon: "🧪", name: "AI+化学", desc: "让 AI 帮你找新材料" },
];

const STRATEGIES = [
  {
    id: "methodical", name: "稳扎稳打型",
    desc: "先把基础打好，慢慢来。风险低，但可能被对手抢先。",
    passive: "每季度 evidence 自然 +2",
    start: { funding: 30, morale: 80, reputation: 10, tokens: 15, compute: 12, suspicion: 0 },
    project: { progress: 5, evidence: 10 },
    abilities: { research: 25, teaching: 30, admin: 20 },
  },
  {
    id: "ai-first", name: "AI 优先型",
    desc: "相信 AI 能加速一切。Tokens 充足，但要小心翻车。",
    passive: "AI 工具 token 消耗 -20%",
    start: { funding: 25, morale: 60, reputation: 5, tokens: 30, compute: 18, suspicion: 0 },
    project: { progress: 3, evidence: 5 },
    abilities: { research: 20, teaching: 15, admin: 15 },
  },
  {
    id: "networker", name: "社交达人型",
    desc: "人脉就是生产力。经费多，但学术底子薄。",
    passive: "每季度 funding 自然 +3",
    start: { funding: 40, morale: 70, reputation: 15, tokens: 10, compute: 8, suspicion: 0 },
    project: { progress: 5, evidence: 5 },
    abilities: { research: 15, teaching: 25, admin: 35 },
  },
];

/* ─── Students ─── */
const STUDENT_TYPES = {
  diligent: {
    trait: "勤奋踏实", icon: "📚",
    desc: "每天第一个到实验室",
    output: { progress: 3, evidence: 2 },
    cost: { tokens: 1, compute: 1, funding: 1 },
    troubleChance: 0.05,
    paperSpeed: 0.15,
  },
  creative: {
    trait: "脑洞很大", icon: "💡",
    desc: "总有新想法，不一定靠谱",
    output: { progress: 4, evidence: 0 },
    cost: { tokens: 2, compute: 2, funding: 1 },
    troubleChance: 0.15,
    paperSpeed: 0.12,
  },
  slacker: {
    trait: "佛系选手", icon: "🧘",
    desc: "对科研「很感兴趣」",
    output: { progress: 0, evidence: 0 },
    cost: { tokens: 1, compute: 0, funding: 1 },
    troubleChance: 0.35,
    paperSpeed: 0.03,
  },
  gpuBurner: {
    trait: "算力黑洞", icon: "🔥",
    desc: "特别喜欢跑大实验",
    output: { progress: 5, evidence: 1 },
    cost: { tokens: 2, compute: 6, funding: 2 },
    troubleChance: 0.2,
    paperSpeed: 0.18,
  },
  tokenDrain: {
    trait: "API 杀手", icon: "💸",
    desc: "对 AI 工具非常熟练",
    output: { progress: 4, evidence: -1 },
    cost: { tokens: 8, compute: 1, funding: 1 },
    troubleChance: 0.25,
    paperSpeed: 0.14,
  },
  faker: {
    trait: "数据很漂亮", icon: "🎭",
    desc: "结果总是比别人好",
    output: { progress: 6, evidence: -2 },
    cost: { tokens: 2, compute: 2, funding: 1 },
    troubleChance: 0.3,
    paperSpeed: 0.2,
    suspicionPerQ: 3,
  },
  ghost: {
    trait: "深居简出", icon: "👻",
    desc: "联系方式经常换",
    output: { progress: 0, evidence: 0 },
    cost: { tokens: 0, compute: 0, funding: 1 },
    troubleChance: 0.5,
    paperSpeed: 0.01,
  },
};

const STUDENT_NAMES = [
  "小张","小李","小王","小刘","小陈","小杨","小赵","小孙",
  "小周","小吴","小郑","小马","小何","小钱","小冯","小林",
];

const HIRE_WEIGHTS = [
  { type: "diligent", w: 15 },
  { type: "creative", w: 20 },
  { type: "slacker", w: 20 },
  { type: "gpuBurner", w: 15 },
  { type: "tokenDrain", w: 12 },
  { type: "faker", w: 10 },
  { type: "ghost", w: 8 },
];

/* ─── Rivals ─── */
const RIVALS = [
  {
    id: "sprint", name: "快手组", avatar: "🏃", style: "速度优先",
    desc: "一年发十篇 preprint 的那种组",
    progressPerQ: () => rand(3, 8), evidencePerQ: () => rand(1, 3),
    actions: [
      "又挂了一篇 preprint",
      "把你的方向也做了一版",
      "在推特上疯狂宣传新结果",
      "投了四个 workshop",
      "用 GPT-6 一天写完初稿",
    ],
  },
  {
    id: "money", name: "财大气粗组", avatar: "💰", style: "有钱就行",
    desc: "经费多到可以租整个集群",
    progressPerQ: () => rand(3, 6), evidencePerQ: () => rand(2, 5),
    actions: [
      "又买了一批 H100",
      "请了一位大佬 visiting",
      "办了个豪华 workshop",
      "在 Nature 子刊上投了稿",
      "给学生发了双倍奖学金",
    ],
  },
  {
    id: "solid", name: "老牌强组", avatar: "🏛️", style: "底蕴深厚",
    desc: "慢但几乎不出错",
    progressPerQ: () => rand(2, 4), evidencePerQ: () => rand(3, 6),
    actions: [
      "补了三组对照实验",
      "发了一篇方法论综述",
      "被邀请做 AAAI 的 keynote",
      "拿到了国家重点研发",
      "又培养了一位优博",
    ],
  },
];

/* ─── AI Tools ─── */
const AI_TOOLS = [
  { id: "ai-draft", name: "AI 写稿", icon: "✍️",
    desc: "让 AI 帮你写论文初稿",
    cost: { tokens: 8 }, effect: { progress: 10, suspicion: 3 },
  },
  { id: "ai-code", name: "AI 写代码", icon: "💻",
    desc: "让 AI 生成实验代码",
    cost: { tokens: 6, compute: 3 }, effect: { progress: 8, suspicion: 2 },
  },
  { id: "ai-review", name: "AI 文献综述", icon: "📖",
    desc: "让 AI 梳理相关工作",
    cost: { tokens: 5 }, effect: { progress: 5, evidence: 3, suspicion: 2 },
  },
  { id: "ai-data", name: "AI 数据分析", icon: "📊",
    desc: "让 AI 分析实验数据",
    cost: { tokens: 7, compute: 4 }, effect: { evidence: 6, progress: 4, suspicion: 4 },
  },
  { id: "ai-rebuttal", name: "AI 写 Rebuttal", icon: "📝",
    desc: "让 AI 回复审稿意见",
    cost: { tokens: 5 }, effect: { progress: 4, reputation: 1, suspicion: 3 },
  },
  { id: "ai-grant", name: "AI 写基金本子", icon: "📋",
    desc: "让 AI 帮你写申请书",
    cost: { tokens: 8 }, effect: { funding: 8, suspicion: 4 },
  },
];

const TRAD_TOOLS = [
  { id: "lit-sweep", name: "手动文献调研", icon: "📚",
    desc: "老老实实读论文",
    cost: { morale: 3 }, effect: { evidence: 5, progress: 2 },
  },
  { id: "manual-code", name: "自己写代码", icon: "⌨️",
    desc: "一行一行 debug",
    cost: { compute: 4, morale: 4 }, effect: { progress: 6, evidence: 3 },
  },
  { id: "benchmark", name: "跑 Benchmark", icon: "🧪",
    desc: "认真做对比实验",
    cost: { compute: 5, morale: 3 }, effect: { evidence: 8, suspicion: -3 },
  },
  { id: "audit", name: "内部审计", icon: "🔍",
    desc: "检查所有结果的可靠性",
    cost: { morale: 5 }, effect: { suspicion: -8, evidence: 3 },
  },
  { id: "write-draft", name: "手写论文", icon: "📝",
    desc: "自己逐字逐句写",
    cost: { morale: 6 }, effect: { progress: 5, evidence: 2, reputation: 1 },
  },
  { id: "buy-tokens", name: "购买 Tokens", icon: "🎟️",
    desc: "把经费变成 API 额度",
    cost: { funding: 5 }, effect: { tokens: 12 },
  },
  { id: "buy-compute", name: "租 GPU", icon: "⚡",
    desc: "花钱买算力",
    cost: { funding: 4 }, effect: { compute: 10 },
  },
];

/* ─── Season Events ─── */
const SEASON_CONFIG = {
  Q1: { name: "春季", desc: "申请国家基金的黄金季节。本季度可以提交基金申请。", color: "green" },
  Q2: { name: "夏季", desc: "毕业季。满足条件的学生将答辩毕业。投稿也在这个季度结算。", color: "yellow" },
  Q3: { name: "秋季", desc: "招生季。可以面试和招收新学生（如果你还敢招的话）。", color: "orange" },
  Q4: { name: "冬季", desc: "年终总结。学校会评估你的年度表现。教龄 +1。", color: "blue" },
};

/* ─── Random Events ─── */
const RANDOM_EVENTS = [
  {
    id: "api-price", title: "API 涨价通知",
    desc: "您常用的模型 API 宣布下季度起价格上调 50%。「感谢您一直以来的支持。」",
    choices: [
      { label: "趁涨价前囤货", desc: "-8 经费, +15 tokens", fx: { funding: -8, tokens: 15 } },
      { label: "切换到开源模型", desc: "本局 AI 工具效果 -20%", fx: { _weakenAI: true } },
      { label: "减少使用，回归手工", desc: "+3 morale（手动的快乐）", fx: { morale: 3 } },
    ],
  },
  {
    id: "hallucination", title: "论文被质疑",
    desc: "有同行发现你上篇论文的 related work 里有两条引用不存在。「请问这篇是 AI 写的吗？」",
    choices: [
      { label: "立刻发勘误", desc: "-3 reputation, -5 suspicion", fx: { reputation: -3, suspicion: -5 } },
      { label: "说是笔误", desc: "+5 suspicion", fx: { suspicion: 5 } },
      { label: "核查所有论文引用", desc: "-5 morale, -8 suspicion", fx: { morale: -5, suspicion: -8 } },
    ],
  },
  {
    id: "student-side-project", title: "学生拿 API 做私活",
    desc: "你发现 API 账单异常。某同学拿你的 key 做了个「AI 女友聊天机器人」。",
    choices: [
      { label: "严厉警告并换 key", desc: "-8 tokens, -3 morale", fx: { tokens: -8, morale: -3 } },
      { label: "让 TA 写篇论文赎罪", desc: "-5 tokens, +3 progress", fx: { tokens: -5, progress: 3 } },
      { label: "算了（心累）", desc: "-5 tokens", fx: { tokens: -5 } },
    ],
  },
  {
    id: "gpu-fire", title: "GPU 烧了",
    desc: "学生忘记设散热，一张 A100 冒烟了。机房管理员的表情可以用来发 meme。",
    choices: [
      { label: "赔钱", desc: "-10 经费", fx: { funding: -10 } },
      { label: "走保险", desc: "-3 经费, -5 morale（填表填到崩溃）", fx: { funding: -3, morale: -5 } },
    ],
  },
  {
    id: "preprint-scoop", title: "被抢发了",
    desc: "ArXiv 上出现一篇几乎和你一样的工作。隔壁组的。他们用 GPT 写的，你手写了三个月。",
    choices: [
      { label: "加速冲刺差异化", desc: "+6 progress, -5 morale, +3 risk", fx: { progress: 6, morale: -5 } },
      { label: "找不同的角度切入", desc: "+5 evidence, -3 progress", fx: { evidence: 5, progress: -3 } },
      { label: "躺平接受现实", desc: "-5 morale", fx: { morale: -5 } },
    ],
  },
  {
    id: "invited-talk", title: "受邀做报告",
    desc: "有人邀请你在一个 workshop 上做 invited talk。你的 PPT 还没做。",
    choices: [
      { label: "用 AI 做 PPT 然后去", desc: "-4 tokens, +5 reputation, +3 suspicion", fx: { tokens: -4, reputation: 5, suspicion: 3 } },
      { label: "认真准备再去", desc: "-5 morale, +6 reputation", fx: { morale: -5, reputation: 6 } },
      { label: "婉拒", desc: "-1 reputation, +3 morale", fx: { reputation: -1, morale: 3 } },
    ],
  },
  {
    id: "student-breakdown", title: "学生深夜发长消息",
    desc: "凌晨两点，一条 2000 字的微信。不是汇报进展。",
    choices: [
      { label: "认真回复并约谈", desc: "-5 morale, 学生状态恢复", fx: { morale: -5, _healStudent: true } },
      { label: "明天再说", desc: "-2 morale, 学生可能更差", fx: { morale: -2 } },
    ],
  },
  {
    id: "collab-invite", title: "合作邀请",
    desc: "一个大组想和你联合投稿。好消息：他们有 GPU。坏消息：他们要一作。",
    choices: [
      { label: "接受（他们一作）", desc: "+8 progress, +4 reputation", fx: { progress: 8, reputation: 4 } },
      { label: "谈判共同一作", desc: "+5 progress, +2 reputation, -2 morale", fx: { progress: 5, reputation: 2, morale: -2 } },
      { label: "拒绝", desc: "+3 morale", fx: { morale: 3 } },
    ],
  },
  {
    id: "model-update", title: "大模型又更新了",
    desc: "新版模型效果碾压旧版。你基于旧版做的三个月实验全部需要重新跑。",
    choices: [
      { label: "全部重跑", desc: "-8 compute, -6 progress, +5 evidence", fx: { compute: -8, progress: -6, evidence: 5 } },
      { label: "在 appendix 里加个新模型结果", desc: "-3 compute, +3 suspicion", fx: { compute: -3, suspicion: 3 } },
      { label: "假装没看到", desc: "+5 suspicion", fx: { suspicion: 5 } },
    ],
  },
  {
    id: "teaching-load", title: "教学任务",
    desc: "院长说你下学期要带两门本科课。「青年教师要多承担教学任务嘛。」",
    choices: [
      { label: "用 AI 备课", desc: "-4 tokens, +3 teaching, +3 suspicion", fx: { tokens: -4, _boostTeaching: 3, suspicion: 3 } },
      { label: "认真备课", desc: "-8 morale, +5 teaching", fx: { morale: -8, _boostTeaching: 5 } },
      { label: "能推就推", desc: "-3 reputation, +3 morale", fx: { reputation: -3, morale: 3 } },
    ],
  },
  {
    id: "retraction-news", title: "学术圈大瓜",
    desc: "某顶会最佳论文被爆出数据造假。整个领域开始互相审视。审稿标准突然变严了。",
    choices: [
      { label: "趁机做一波 reproducibility", desc: "+6 evidence, +3 reputation, -3 morale", fx: { evidence: 6, reputation: 3, morale: -3 } },
      { label: "默默检查自己的数据", desc: "-3 suspicion, -2 morale", fx: { suspicion: -3, morale: -2 } },
      { label: "吃瓜看戏", desc: "无事发生", fx: {} },
    ],
  },
  {
    id: "phd-quit", title: "学生说要退学",
    desc: "「老师，我觉得我不适合做科研。」",
    choices: [
      { label: "促膝长谈挽留", desc: "-5 morale, 60%留住", fx: { morale: -5, _retainRoll: true } },
      { label: "尊重选择", desc: "失去一个学生", fx: { _loseStudent: true } },
      { label: "画饼：你马上就能发论文了", desc: "-2 morale, 40%留住", fx: { morale: -2, _retainRoll40: true } },
    ],
  },
];

const STUDENT_TROUBLE_EVENTS = [
  { title: "学生把超算额度烧空了", desc: "开了 16 张卡跑 grid search，参数空间是 10^8。",
    choices: [
      { label: "扣额度", effect: { compute: -8 }, text: "compute -8" },
      { label: "下次注意", effect: { compute: -4, morale: -2 }, text: "compute -4, morale -2" },
    ] },
  { title: "学生拿 tokens 跑了个人项目", desc: "你的 API key 出现在了一个「AI 算命」网站上。",
    choices: [
      { label: "换 key 并警告", effect: { tokens: -10, morale: -3 }, text: "tokens -10, morale -3" },
      { label: "算了", effect: { tokens: -6 }, text: "tokens -6" },
    ] },
  { title: "学生提交了可疑数据", desc: "三组实验的方差一模一样。概率大约是中彩票的平方。",
    choices: [
      { label: "全部推翻重做", effect: { progress: -8, suspicion: -8 }, text: "progress -8, suspicion -8" },
      { label: "只改最明显的", effect: { progress: -3, suspicion: 3 }, text: "progress -3, suspicion +3" },
    ] },
  { title: "学生消失了一周", desc: "微信不回，邮件不看，座位上长出了蘑菇。",
    choices: [
      { label: "打电话找人", effect: { morale: -3 }, text: "morale -3" },
      { label: "等 TA 自己回来", effect: { morale: -1 }, text: "morale -1（随缘）" },
    ] },
  { title: "学生引用了不存在的文献", desc: "审稿人说 Ref[17] 查不到。因为它是 AI 编的。",
    choices: [
      { label: "核查所有引用", effect: { tokens: -3, suspicion: -5 }, text: "tokens -3, suspicion -5" },
      { label: "只删这一条", effect: { suspicion: 3 }, text: "suspicion +3" },
    ] },
  { title: "GPU 空转了一个周末", desc: "学生周五开了实验，忘了设 early stopping。两天的算力全浪费了。",
    choices: [
      { label: "加自动关机脚本", effect: { compute: -6 }, text: "compute -6" },
      { label: "申请补偿", effect: { compute: -3, funding: -2 }, text: "compute -3, funding -2" },
    ] },
];

const NEWS_TEMPLATES = [
  "📰 某顶会论文被曝使用 AI 生成，审稿人表示「看不出来」",
  "📰 API 价格战：某大厂宣布模型推理成本再降 30%",
  "📰 调查显示 78% 的研究者承认使用过 AI 辅助写作",
  "📰 Nature 发表社论：AI 时代的学术诚信何去何从",
  "📰 某大学出台规定：论文中使用 AI 需明确标注",
  "📰 开源模型性能首次超越闭源，社区欢呼",
  "📰 某实验室年度 API 账单曝光：47 万美元",
  "📰 AI 审稿系统上线，审稿人表示「终于轮到你们了」",
  "📰 某博士用 AI 写了整篇毕业论文，答辩时被问懵",
  "📰 GPU 价格再创新高，有组开始用 CPU 「省着跑」",
  "📰 ChatGPT 出现幻觉引用了一篇不存在的 Nature 论文",
  "📰 某青椒用 AI 一年发了 20 篇，被学校表彰后被同行举报",
  "📰 AI+Science 专项基金发布，评审专家平均年龄 65 岁",
  "📰 Arxiv 日均提交量突破 1000 篇，其中 AI 辅助占比 60%",
  "📰 某组学生集体用 ChatGPT 写周报，导师看了三个月才发现",
];

const BIOS = [
  "毕业于海外名校，师从某诺奖得主的学生的学生。回国后致力于用 AI 改变世界（的论文数量）。",
  "发表 SCI 论文若干篇，其中几篇还真的有人引用。国家级青年项目获得者（pending）。",
  "研究兴趣广泛，广泛到连自己都不知道主线是什么。相信 AI 能帮忙找到方向。",
  "坚信「先把 paper 发出来再说」的学术哲学。目前正在和 GPT 联合培养研究生。",
];

const QUOTES = [
  "科研是神圣的，我们要为了全人类的未来而奋斗（顺便发几篇 Paper）。",
  "If it works, don't ask why. If it publishes, don't look back.",
  "我的研究方向就是哪个能发论文就往哪个方向研究。",
  "在 AI 时代做科研，就像在高速公路上换轮胎。",
  "Publish or perish, 现在变成了 Prompt or perish。",
];

/* ═══ STATE ═══ */
let S = null; // game state
let meta = loadMeta();
let toastTimer = null;

/* ═══ DOM ═══ */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const dom = {};

function cacheDom() {
  const ids = [
    "start-screen","game-screen","end-screen",
    "player-name","btn-reroll-name","direction-grid","strategy-grid","btn-start","save-row","btn-continue","btn-wipe","meta-line",
    "game-url","profile-avatar","profile-name","profile-title","profile-dept","profile-year",
    "resource-bars","ability-bars","self-care-actions","stat-papers","stat-graduated",
    "top-name","top-meta","quarter-badge","btn-end-quarter",
    "tab-nav","team-count",
    "home-bio","home-quote","home-direction","home-tracks",
    "season-title","season-desc","season-actions",
    "event-card","event-title","event-desc","event-choices",
    "team-grid","team-empty","btn-recruit",
    "ai-tools","trad-tools","paper-list",
    "rival-grid","news-feed",
    "modal-overlay","modal-panel","modal-title","modal-desc","modal-body",
    "end-title","end-copy","end-stats","end-ranking","btn-restart","btn-copy-report",
    "toast",
  ];
  for (const id of ids) dom[id.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = $(`#${id}`);
}

/* ═══ BOOTSTRAP ═══ */
document.addEventListener("DOMContentLoaded", () => {
  cacheDom();
  setupStart();
});

function setupStart() {
  rerollName();
  renderDirections();
  renderStrategies();
  renderMeta();

  dom.btnRerollName.onclick = rerollName;
  dom.btnStart.onclick = startGame;
  dom.btnContinue.onclick = continueGame;
  dom.btnWipe.onclick = wipeGame;
  dom.btnEndQuarter.onclick = endQuarter;
  dom.btnRestart.onclick = restartGame;
  dom.btnCopyReport.onclick = copyReport;

  // Tab switching
  for (const btn of $$("#tab-nav .tab-btn")) {
    btn.onclick = () => switchTab(btn.dataset.tab);
  }
}

/* ═══ START SCREEN ═══ */
let selectedDirection = null;
let selectedStrategy = null;

function rerollName() {
  dom.playerName.textContent = sample(NAMES);
  checkStartReady();
}

function renderDirections() {
  dom.directionGrid.innerHTML = "";
  for (const d of DIRECTIONS) {
    const el = document.createElement("div");
    el.className = "direction-card";
    el.innerHTML = `<div class="dir-icon">${d.icon}</div><div class="dir-name">${d.name}</div><div class="dir-desc">${d.desc}</div>`;
    el.onclick = () => {
      $$(".direction-card").forEach(c => c.classList.remove("selected"));
      el.classList.add("selected");
      selectedDirection = d;
      checkStartReady();
    };
    dom.directionGrid.appendChild(el);
  }
}

function renderStrategies() {
  dom.strategyGrid.innerHTML = "";
  for (const s of STRATEGIES) {
    const el = document.createElement("div");
    el.className = "strategy-card";
    el.innerHTML = `
      <div class="strat-name">${s.name}</div>
      <div class="strat-desc">${s.desc}</div>
      <div class="strat-passive">${s.passive}</div>
    `;
    el.onclick = () => {
      $$(".strategy-card").forEach(c => c.classList.remove("selected"));
      el.classList.add("selected");
      selectedStrategy = s;
      checkStartReady();
    };
    dom.strategyGrid.appendChild(el);
  }
}

function checkStartReady() {
  dom.btnStart.disabled = !(selectedDirection && selectedStrategy);
}

function renderMeta() {
  if (meta.runs > 0) {
    dom.metaLine.textContent = `历史: ${meta.runs} 局 | 最高分 ${meta.best} | 最佳结局: ${meta.bestTitle || "无"}`;
  }
  const save = loadSave();
  if (save) {
    dom.saveRow.style.display = "";
  }
}

/* ═══ GAME INIT ═══ */
function startGame() {
  const name = dom.playerName.textContent;
  const dir = selectedDirection;
  const strat = selectedStrategy;

  S = {
    name,
    direction: dir,
    strategyId: strat.id,
    year: 1, quarter: 1, // Q1=spring, Q2=summer, Q3=fall, Q4=winter
    totalYears: TOTAL_YEARS,

    // Resources
    funding: strat.start.funding,
    morale: strat.start.morale,
    reputation: strat.start.reputation,
    tokens: strat.start.tokens,
    compute: strat.start.compute,
    suspicion: strat.start.suspicion,

    // Abilities
    research: strat.abilities.research,
    teaching: strat.abilities.teaching,
    admin: strat.abilities.admin,

    // Project
    progress: strat.project.progress,
    evidence: strat.project.evidence,

    // Team
    students: [],
    graduatedCount: 0,

    // Papers
    papers: [], // { title, status: draft|submitted|published|rejected, quality }
    paperCount: 0,

    // Rivals
    rivals: RIVALS.map(r => ({
      id: r.id, name: r.name, avatar: r.avatar, style: r.style,
      papers: 0, reputation: rand(5, 15), lastAction: "",
    })),

    // AI state
    aiWeakened: false,
    actionsThisQ: 0,
    maxActionsPerQ: 4,

    // Events
    eventResolved: false,
    currentEvent: null,
    pendingStudentEvent: null,
    grantApplied: false,

    // Log
    news: [],
    log: [],

    ended: false,
    ending: null,
    summaryText: "",
  };

  dom.startScreen.classList.add("hidden");
  dom.gameScreen.classList.remove("hidden");
  generateQuarterContent();
  renderAll();
  addNews(`${name}老师入职 AI大学，开始了 tenure-track 之旅。研究方向：${dir.name}。`);
  saveState();
}

function continueGame() {
  S = loadSave();
  if (!S) return;
  dom.startScreen.classList.add("hidden");
  dom.gameScreen.classList.remove("hidden");
  renderAll();
}

function wipeGame() {
  clearSave();
  dom.saveRow.style.display = "none";
  toast("存档已清除");
}

function restartGame() {
  S = null;
  dom.endScreen.classList.add("hidden");
  dom.gameScreen.classList.add("hidden");
  dom.startScreen.classList.remove("hidden");
  selectedDirection = null;
  selectedStrategy = null;
  $$(".direction-card,.strategy-card").forEach(c => c.classList.remove("selected"));
  dom.btnStart.disabled = true;
  renderMeta();
}

/* ═══ QUARTER FLOW ═══ */
function getQLabel() { return `Q${S.quarter}`; }
function getSeasonKey() { return `Q${S.quarter}`; }
function getFullLabel() { return `${S.year}年 ${getQLabel()}`; }

function generateQuarterContent() {
  S.actionsThisQ = 0;
  S.eventResolved = false;
  S.grantApplied = false;

  // Random event (60% chance)
  if (Math.random() < 0.6 && S.year > 1) {
    S.currentEvent = deepCopy(sample(RANDOM_EVENTS));
  } else if (S.year === 1 && S.quarter === 1) {
    // First quarter: welcome event
    S.currentEvent = {
      id: "welcome", title: "入职第一天",
      desc: "HR 带你参观了办公室。隔壁工位的青椒已经秃了。「你慢慢适应，有什么不懂的问 ChatGPT。」",
      choices: [
        { label: "充满干劲", desc: "+5 morale", fx: { morale: 5 } },
        { label: "有点慌", desc: "+3 reputation（看起来很谦虚）", fx: { reputation: 3 } },
        { label: "先买点 tokens 再说", desc: "+8 tokens, -3 funding", fx: { tokens: 8, funding: -3 } },
      ],
    };
  } else {
    S.currentEvent = null;
  }

  // Add seasonal news
  if (Math.random() < 0.5) {
    addNews(sample(NEWS_TEMPLATES));
  }
}

function endQuarter() {
  if (S.ended) return;
  if (S.pendingStudentEvent) { toast("请先处理学生事件"); return; }

  // Process students
  processStudents();

  // Process rivals
  processRivals();

  // Season-specific effects
  processSeasonEffects();

  // Check student trouble
  const trouble = checkStudentTrouble();
  if (trouble) {
    S.pendingStudentEvent = trouble;
    showModal(trouble.title, trouble.desc, trouble.choices.map((ch, i) => ({
      label: ch.label,
      desc: ch.text,
      onclick: () => resolveStudentTrouble(i),
    })));
    return;
  }

  // Strategy passive
  applyStrategyPassive();

  // Quarterly upkeep
  S.funding -= 2;
  S.morale -= 1;
  S.compute = Math.max(0, S.compute - 1);

  normalizeState();

  // Check fail conditions
  const collapse = checkCollapse();
  if (collapse) { finishGame(collapse); return; }

  // Advance quarter
  S.quarter++;
  if (S.quarter > 4) {
    S.quarter = 1;
    S.year++;
    if (S.year > TOTAL_YEARS) {
      finishGame(getFinalEnding());
      return;
    }
  }

  generateQuarterContent();
  saveState();
  renderAll();
}

function processStudents() {
  for (const s of S.students) {
    if (s.graduated || s.quit) continue;
    const type = STUDENT_TYPES[s.type];
    // Pay costs
    for (const [k, v] of Object.entries(type.cost)) S[k] = Math.max(0, S[k] - v);
    // Output (with random variance)
    if (s.type !== "ghost" || Math.random() > 0.5) {
      S.progress += type.output.progress + rand(-1, 1);
      S.evidence += type.output.evidence;
    }
    // Suspicion from faker
    if (type.suspicionPerQ) S.suspicion += type.suspicionPerQ;
    // Paper progress
    s.paperProgress = (s.paperProgress || 0) + type.paperSpeed + Math.random() * 0.05;
    if (s.paperProgress >= 1) {
      s.paperProgress = 0;
      const quality = Math.max(10, S.evidence + S.research + rand(-10, 10));
      const paper = {
        title: generatePaperTitle(),
        status: "draft",
        quality,
        author: s.name,
        quarter: getFullLabel(),
      };
      S.papers.push(paper);
      addNews(`${s.name}完成了一篇论文草稿：「${paper.title}」`);
    }
    // Year progression
    s.yearInLab = (s.yearInLab || 0) + 0.25;
  }
}

function processRivals() {
  for (const r of S.rivals) {
    const def = RIVALS.find(x => x.id === r.id);
    r.reputation += rand(1, 3);
    r.papers += Math.random() < 0.3 ? 1 : 0;
    r.lastAction = sample(def.actions);
  }
}

function processSeasonEffects() {
  const q = S.quarter;

  // Q1: Grant results from last year's application
  if (q === 1 && S.year > 1) {
    // Nothing special in Q1 itself, grants are applied during Q1
  }

  // Q2: Paper submission results + graduation
  if (q === 2) {
    // Process submitted papers
    for (const p of S.papers) {
      if (p.status === "submitted") {
        const accept = (p.quality + S.reputation + rand(-20, 20)) > 50;
        if (accept) {
          p.status = "published";
          S.paperCount++;
          S.reputation += 3;
          addNews(`论文「${p.title}」被接收！🎉`);
        } else {
          p.status = "rejected";
          S.morale -= 3;
          addNews(`论文「${p.title}」被拒了。审稿人说「novelty 不足」。`);
        }
      }
    }
    // Graduation check
    for (const s of S.students) {
      if (s.graduated || s.quit) continue;
      if (s.yearInLab >= 3 && S.papers.some(p => p.author === s.name && p.status === "published")) {
        s.graduated = true;
        S.graduatedCount++;
        addNews(`${s.name}顺利毕业！🎓`);
      }
    }
  }

  // Q3: Recruitment season (handled by UI button)

  // Q4: Annual review
  if (q === 4) {
    const yearPapers = S.papers.filter(p => p.status === "published").length;
    if (yearPapers === 0 && S.year > 1) {
      S.morale -= 5;
      addNews("年终总结：本年度零论文产出。院长约你「谈谈」。");
    }
    // Teaching evaluation
    if (S.teaching > 40) {
      S.reputation += 1;
    }
    // Research bonus
    S.research = Math.min(100, S.research + 2);
  }
}

function applyStrategyPassive() {
  if (S.strategyId === "methodical") S.evidence += 2;
  if (S.strategyId === "networker") S.funding += 3;
  // ai-first passive is handled in cost calculation
}

function checkStudentTrouble() {
  for (const s of S.students) {
    if (s.graduated || s.quit) continue;
    const type = STUDENT_TYPES[s.type];
    if (Math.random() < type.troubleChance) {
      return deepCopy(sample(STUDENT_TROUBLE_EVENTS));
    }
  }
  return null;
}

function resolveStudentTrouble(choiceIdx) {
  const evt = S.pendingStudentEvent;
  const ch = evt.choices[choiceIdx];
  for (const [k, v] of Object.entries(ch.effect)) {
    if (k === "progress" || k === "evidence") S[k] += v;
    else S[k] += v;
  }
  addNews(`学生事故：${evt.title}`);
  S.pendingStudentEvent = null;
  hideModal();
  normalizeState();
  // Continue quarter end
  applyStrategyPassive();
  S.funding -= 2; S.morale -= 1; S.compute = Math.max(0, S.compute - 1);
  normalizeState();
  const collapse = checkCollapse();
  if (collapse) { finishGame(collapse); return; }
  S.quarter++;
  if (S.quarter > 4) { S.quarter = 1; S.year++; if (S.year > TOTAL_YEARS) { finishGame(getFinalEnding()); return; } }
  generateQuarterContent();
  saveState();
  renderAll();
}

/* ═══ ACTIONS ═══ */
function canAct() { return S && !S.ended && S.actionsThisQ < S.maxActionsPerQ; }

function useTool(tool) {
  if (!canAct()) { toast("本季度行动次数已用完"); return; }
  // Check cost
  for (const [k, v] of Object.entries(tool.cost)) {
    let cost = v;
    if (k === "tokens" && S.strategyId === "ai-first") cost = Math.ceil(cost * 0.8);
    if ((S[k] ?? 0) < cost) { toast("资源不足！"); return; }
  }
  // Pay cost
  for (const [k, v] of Object.entries(tool.cost)) {
    let cost = v;
    if (k === "tokens" && S.strategyId === "ai-first") cost = Math.ceil(cost * 0.8);
    S[k] -= cost;
  }
  // Apply effect
  for (const [k, v] of Object.entries(tool.effect)) {
    let val = v;
    if (S.aiWeakened && tool.id.startsWith("ai-") && (k === "progress" || k === "evidence")) {
      val = Math.ceil(val * 0.8);
    }
    if (k === "progress" || k === "evidence") S[k] += val;
    else S[k] += val;
  }
  S.actionsThisQ++;
  addLog(`使用了「${tool.name}」`);
  normalizeState();
  saveState();
  renderAll();
}

function makeEventChoice(idx) {
  if (S.eventResolved) return;
  const ch = S.currentEvent.choices[idx];
  for (const [k, v] of Object.entries(ch.fx)) {
    if (k.startsWith("_")) {
      handleSpecialFx(k, v);
    } else if (k === "progress" || k === "evidence") {
      S[k] += v;
    } else {
      S[k] += v;
    }
  }
  S.eventResolved = true;
  addLog(`事件「${S.currentEvent.title}」→「${ch.label}」`);
  normalizeState();
  saveState();
  renderAll();
}

function handleSpecialFx(key, val) {
  if (key === "_weakenAI") S.aiWeakened = true;
  if (key === "_healStudent") {
    const stressed = S.students.find(s => !s.graduated && !s.quit);
    if (stressed) addLog(`安抚了${stressed.name}`);
  }
  if (key === "_boostTeaching") S.teaching = Math.min(100, S.teaching + val);
  if (key === "_loseStudent") {
    const active = S.students.filter(s => !s.graduated && !s.quit);
    if (active.length) { active[active.length - 1].quit = true; addNews(`一位学生退学了。`); }
  }
  if (key === "_retainRoll") {
    if (Math.random() >= 0.6) {
      const active = S.students.filter(s => !s.graduated && !s.quit);
      if (active.length) { active[active.length - 1].quit = true; addNews(`没留住，学生还是走了。`); }
    } else { addNews("学生被说服留下来了。"); }
  }
  if (key === "_retainRoll40") {
    if (Math.random() >= 0.4) {
      const active = S.students.filter(s => !s.graduated && !s.quit);
      if (active.length) { active[active.length - 1].quit = true; addNews(`饼没画住，学生走了。`); }
    } else { addNews("学生暂时被画饼稳住了。"); }
  }
}

function applyGrant() {
  if (S.grantApplied) { toast("本季度已经申请过了"); return; }
  if (!canAct()) { toast("本季度行动次数已用完"); return; }
  S.grantApplied = true;
  S.actionsThisQ++;
  const success = (S.research + S.reputation + rand(-30, 30)) > 50;
  if (success) {
    const amount = rand(15, 30);
    S.funding += amount;
    addNews(`基金申请成功！获得 ¥${amount}万 经费！🎉`);
    toast(`基金中了！+${amount} 经费`);
  } else {
    S.morale -= 5;
    addNews("基金申请失败。评审意见：「创新性不足」。");
    toast("基金没中...");
  }
  saveState();
  renderAll();
}

function submitPaper(paperIdx) {
  if (!canAct()) { toast("本季度行动次数已用完"); return; }
  const p = S.papers[paperIdx];
  if (!p || p.status !== "draft") return;
  p.status = "submitted";
  S.actionsThisQ++;
  addNews(`论文「${p.title}」已投稿，等待审稿结果...`);
  saveState();
  renderAll();
}

function recruitStudent() {
  if (!canAct()) { toast("本季度行动次数已用完"); return; }
  if (S.quarter !== 3) { toast("只能在 Q3 招生季招收学生"); return; }
  const type = weightedSample(HIRE_WEIGHTS);
  const typeDef = STUDENT_TYPES[type];
  const name = sample(STUDENT_NAMES.filter(n => !S.students.some(s => s.name === n)));
  const student = {
    name: name || "小" + String.fromCharCode(65 + S.students.length),
    type,
    icon: typeDef.icon,
    trait: typeDef.trait,
    desc: typeDef.desc,
    yearInLab: 0,
    paperProgress: 0,
    graduated: false,
    quit: false,
  };
  S.students.push(student);
  S.actionsThisQ++;
  addNews(`招收了新学生：${student.name}（${student.desc}）`);
  toast(`新学生：${student.name}`);
  saveState();
  renderAll();
}

function selfCare(type) {
  if (type === "walk") {
    S.morale = Math.min(100, S.morale + 5);
    if (Math.random() < 0.2) {
      S.morale += 3;
      toast("散步时突然有了灵感！morale +8");
    } else {
      toast("校园漫步：morale +5");
    }
  } else if (type === "massage") {
    if (S.funding < 1) { toast("没钱了..."); return; }
    S.funding -= 1;
    S.morale = Math.min(100, S.morale + 15);
    toast("全身按摩：morale +15, funding -1");
  } else if (type === "retract") {
    const published = S.papers.filter(p => p.status === "published");
    if (!published.length) { toast("没有可以撤的论文"); return; }
    const worst = published.reduce((a, b) => a.quality < b.quality ? a : b);
    worst.status = "retracted";
    S.suspicion = Math.max(0, S.suspicion - 15);
    S.reputation -= 5;
    addNews(`主动撤回论文「${worst.title}」。学术圈表示「至少态度端正」。`);
    toast("撤稿：suspicion -15, reputation -5");
  }
  saveState();
  renderAll();
}

/* ═══ ENDINGS ═══ */
function checkCollapse() {
  if (S.morale <= 0) return { title: "精神崩溃 💀", copy: "你发了一条朋友圈「不干了」然后把手机关了。三天后 HR 打来电话问你还来不来。你说再想想。想了一个月。没想出来。", key: "burnout", bonus: -20 };
  if (S.funding <= -15) return { title: "破产清算 💸", copy: "实验室的 GPU 被收回了。学生问你「老师我们还做不做」。你看着空荡荡的服务器机架，感觉自己就是那个空荡荡的机架。", key: "bankrupt", bonus: -15 };
  if (S.suspicion >= 100) return { title: "学术不端调查 🔍", copy: "匿名举报信到了学术委员会。委员会看了你最近的论文，发现 related work 里有 5 篇不存在的文献。你说是学生写的。委员会说「AI 写的吧」。", key: "fraud", bonus: -30 };
  if (S.reputation <= -20) return { title: "社死 😶", copy: "你在一次学术会议上被人当面问「你那篇论文是不是 AI 写的」。你说不是。全场沉默。", key: "shame", bonus: -10 };
  return null;
}

function getFinalEnding() {
  const score = calcScore();
  if (score >= 200 && S.paperCount >= 10) return { title: "学术新星 ⭐", copy: "你不仅活过了聘期，还成了领域里被频繁引用的人。隔壁组开始模仿你的方法。有人说你是靠 AI，但你的数据经得住检验。", key: "star", bonus: 30 };
  if (score >= 120) return { title: "顺利续聘 ✅", copy: "院长说「还行」。这是你听过最好听的两个字。聘期续了，工资涨了一点点。你终于可以喘口气了——直到下一个聘期。", key: "survive", bonus: 10 };
  if (S.suspicion >= 60) return { title: "带着嫌疑续聘 ⚠️", copy: "论文数量够了，但同行私下里说你的东西「不太靠谱」。你续聘了，但申请合作时总是被婉拒。", key: "suspect", bonus: -5 };
  return { title: "聘期结束 📋", copy: "六年到了。你留下了一些论文、一些学生的回忆、和一笔还没报完的差旅费。HR 说「感谢您的付出」。你说「嗯」。", key: "expired", bonus: 0 };
}

function calcScore() {
  return Math.floor(
    S.paperCount * 15 +
    S.reputation * 2 +
    S.evidence * 0.8 +
    S.progress * 0.5 +
    S.graduatedCount * 10 -
    S.suspicion * 1.5 +
    S.morale * 0.2 +
    S.funding * 0.3
  );
}

function finishGame(ending) {
  S.ended = true;
  S.ending = ending;
  const score = calcScore() + (ending.bonus || 0);
  S.summaryText = `🎓 AI科研生存模拟器 · 评估报告\n结局: ${ending.title}\n分数: ${score}\n` +
    `方向: ${S.direction.name} | 策略: ${STRATEGIES.find(s=>s.id===S.strategyId).name}\n` +
    `论文: ${S.paperCount} 篇 | 毕业生: ${S.graduatedCount} 位\n` +
    `声望: ${S.reputation} | 嫌疑: ${S.suspicion} | 经费: ¥${S.funding}万`;

  meta.runs = (meta.runs || 0) + 1;
  if (score > (meta.best || 0)) { meta.best = score; meta.bestTitle = ending.title; }
  saveMeta();
  clearSave();

  // Show end screen
  dom.gameScreen.classList.add("hidden");
  dom.endScreen.classList.remove("hidden");
  dom.endTitle.textContent = ending.title;
  dom.endCopy.textContent = ending.copy;
  dom.endStats.innerHTML = [
    { l: "Score", v: score }, { l: "Papers", v: S.paperCount },
    { l: "Rep", v: S.reputation }, { l: "Suspicion", v: S.suspicion },
  ].map(s => `<div class="end-stat"><span>${s.l}</span><strong>${s.v}</strong></div>`).join("");

  const allEntries = [
    { name: "你", score: S.paperCount * 10 + S.reputation },
    ...S.rivals.map(r => ({ name: r.name, score: r.papers * 10 + r.reputation })),
  ].sort((a, b) => b.score - a.score);
  dom.endRanking.innerHTML = "<h3 style='font-size:.9rem;margin-bottom:.5rem'>同行排名</h3>" +
    allEntries.map((e, i) => {
      const isMe = e.name === "\u4f60";
      const style = isMe ? ' style="font-weight:700;color:var(--primary)"' : "";
      return `<div class="end-rank-row"${style}><span class="rank-num">#${i+1}</span><span>${e.name}</span><span class="rank-score">${e.score}</span></div>`;
    }).join("");
}

async function copyReport() {
  if (!S?.summaryText) return;
  try { await navigator.clipboard.writeText(S.summaryText); toast("评估报告已复制"); } catch { toast("复制失败"); }
}

/* ═══ RENDERING ═══ */
function renderAll() {
  if (!S) return;
  renderProfile();
  renderTopBar();
  renderHome();
  renderTeam();
  renderResearch();
  renderRivals();
  renderNews();
}

function renderProfile() {
  dom.profileName.textContent = `${S.name} 老师`;
  dom.profileTitle.textContent = getTitle();
  dom.profileDept.textContent = `${S.direction.name}方向`;
  dom.profileYear.textContent = getFullLabel();
  dom.gameUrl.textContent = `https://faculty.ai-university.edu.cn/~${S.name}`;

  // Resource bars
  const resources = [
    { key: "funding", label: "经费", max: 80, val: S.funding, color: "blue", fmt: v => `¥${v}万` },
    { key: "morale", label: "心态", max: 100, val: S.morale, color: "green", fmt: v => `${v}/100` },
    { key: "tokens", label: "Tokens", max: 60, val: S.tokens, color: "purple", fmt: v => v },
    { key: "compute", label: "算力", max: 40, val: S.compute, color: "blue", fmt: v => v },
    { key: "reputation", label: "声望", max: 60, val: S.reputation, color: "yellow", fmt: v => v },
    { key: "suspicion", label: "学术嫌疑", max: 100, val: S.suspicion, color: "red", fmt: v => `${v}/100` },
  ];
  dom.resourceBars.innerHTML = resources.map(r => {
    const pct = Math.max(0, Math.min(100, (r.val / r.max) * 100));
    const danger = (r.key === "suspicion" && r.val >= 60) || (r.key === "morale" && r.val <= 20) || (r.key === "funding" && r.val <= 0);
    return `<div class="stat-row ${danger ? 'danger' : ''}">
      <div class="stat-row-label"><span>${r.label}</span><span>${r.fmt(r.val)}</span></div>
      <div class="stat-bar"><div class="stat-bar-fill fill-${r.color}" style="width:${pct}%"></div></div>
    </div>`;
  }).join("");

  // Ability bars
  dom.abilityBars.innerHTML = [
    { label: "科研", val: S.research, color: "blue" },
    { label: "教学", val: S.teaching, color: "green" },
    { label: "行政", val: S.admin, color: "yellow" },
  ].map(a => `<div class="stat-row">
    <div class="stat-row-label"><span>${a.label}</span><span>${a.val}/100</span></div>
    <div class="stat-bar"><div class="stat-bar-fill fill-${a.color}" style="width:${a.val}%"></div></div>
  </div>`).join("");

  // Self care
  dom.selfCareActions.innerHTML = `
    <button class="btn-action" data-care="walk"><span class="action-icon">🚶</span><span class="action-label">校园漫步</span><span class="action-cost">免费</span></button>
    <button class="btn-action" data-care="massage"><span class="action-icon">💆</span><span class="action-label">按摩放松</span><span class="action-cost">¥1万</span></button>
    <button class="btn-action" data-care="retract"><span class="action-icon">📝</span><span class="action-label">撤稿止损</span><span class="action-cost">rep -5</span></button>
  `;
  for (const btn of dom.selfCareActions.querySelectorAll("[data-care]")) {
    btn.onclick = () => selfCare(btn.dataset.care);
  }

  dom.statPapers.textContent = S.paperCount;
  dom.statGraduated.textContent = S.graduatedCount;
}

function renderTopBar() {
  dom.topName.textContent = `${S.name} 老师`;
  dom.topMeta.textContent = `${getTitle()}, ${S.direction.name}方向`;
  dom.quarterBadge.textContent = getFullLabel();
  dom.btnEndQuarter.textContent = `结束本季度 → ${getNextQLabel()}`;
}

function renderHome() {
  dom.homeBio.textContent = sample(BIOS);
  dom.homeQuote.textContent = sample(QUOTES);
  dom.homeDirection.textContent = `${S.direction.icon} ${S.direction.name} — ${S.direction.desc}`;

  // Progress tracks
  dom.homeTracks.innerHTML = [
    { label: "Progress", val: S.progress, max: 100, color: "blue" },
    { label: "Evidence", val: S.evidence, max: 100, color: "green" },
  ].map(t => `<div class="progress-track"><div class="stat-row">
    <div class="stat-row-label"><span>${t.label}</span><span>${t.val}%</span></div>
    <div class="stat-bar"><div class="stat-bar-fill fill-${t.color}" style="width:${Math.min(100,t.val)}%"></div></div>
  </div></div>`).join("");

  // Season info
  const season = SEASON_CONFIG[getSeasonKey()];
  dom.seasonTitle.textContent = `${season.name} · ${getSeasonKey()}`;
  dom.seasonDesc.textContent = season.desc;
  dom.seasonActions.innerHTML = "";
  if (S.quarter === 1 && !S.grantApplied) {
    dom.seasonActions.innerHTML += `<button class="btn-action" onclick="applyGrant()"><span class="action-icon">📋</span><span class="action-label">申请国家基金</span><span class="action-cost">看命</span></button>`;
  }
  if (S.quarter === 3) {
    dom.seasonActions.innerHTML += `<button class="btn-action" onclick="recruitStudent()"><span class="action-icon">🎓</span><span class="action-label">招收新生</span><span class="action-cost">看运气</span></button>`;
  }
  const actionsLeft = S.maxActionsPerQ - S.actionsThisQ;
  dom.seasonActions.innerHTML += `<div class="hint" style="margin-top:.5rem">本季度剩余行动: ${actionsLeft}/${S.maxActionsPerQ}</div>`;

  // Event
  if (S.currentEvent && !S.eventResolved) {
    dom.eventCard.style.display = "";
    dom.eventTitle.textContent = S.currentEvent.title;
    dom.eventDesc.textContent = S.currentEvent.desc;
    dom.eventChoices.innerHTML = S.currentEvent.choices.map((ch, i) =>
      `<button class="btn-choice" onclick="makeEventChoice(${i})"><span class="choice-title">${ch.label}</span><span class="choice-desc">${ch.desc}</span></button>`
    ).join("");
  } else {
    dom.eventCard.style.display = "none";
  }
}

function renderTeam() {
  const active = S.students.filter(s => !s.graduated && !s.quit);
  dom.teamCount.textContent = active.length;
  dom.btnRecruit.style.display = S.quarter === 3 ? "" : "none";
  dom.btnRecruit.onclick = recruitStudent;

  if (active.length === 0) {
    dom.teamGrid.style.display = "none";
    dom.teamEmpty.style.display = "";
    return;
  }
  dom.teamGrid.style.display = "";
  dom.teamEmpty.style.display = "none";
  dom.teamGrid.innerHTML = active.map(s => {
    const pct = Math.floor((s.paperProgress || 0) * 100);
    return `<div class="student-card">
      <div class="student-header">
        <span class="student-icon">${s.icon}</span>
        <span class="student-name">${s.name}</span>
        <span class="student-year">第${Math.ceil(s.yearInLab || 0.25)}年</span>
      </div>
      <div class="student-trait">${s.desc}</div>
      <div class="student-progress">
        <div class="stat-row-label"><span>论文进度</span><span>${pct}%</span></div>
        <div class="stat-bar"><div class="stat-bar-fill fill-blue" style="width:${pct}%"></div></div>
      </div>
    </div>`;
  }).join("");
}

function renderResearch() {
  dom.aiTools.innerHTML = AI_TOOLS.map(t => {
    const costStr = Object.entries(t.cost).map(([k,v]) => {
      let cost = v;
      if (k === "tokens" && S.strategyId === "ai-first") cost = Math.ceil(cost * 0.8);
      return `${cost} ${k}`;
    }).join(", ");
    const disabled = !canAct() || Object.entries(t.cost).some(([k,v]) => {
      let cost = v;
      if (k === "tokens" && S.strategyId === "ai-first") cost = Math.ceil(cost * 0.8);
      return (S[k] ?? 0) < cost;
    });
    return `<button class="btn-action" data-tool-id="${t.id}" data-tool-type="ai" ${disabled ? "disabled" : ""}>
      <span class="action-icon">${t.icon}</span><span class="action-label">${t.name}</span><span class="action-cost">${costStr}</span>
    </button>`;
  }).join("");
  for (const btn of dom.aiTools.querySelectorAll("[data-tool-id]")) {
    btn.onclick = () => useTool(AI_TOOLS.find(t => t.id === btn.dataset.toolId));
  }

  dom.tradTools.innerHTML = TRAD_TOOLS.map(t => {
    const costStr = Object.entries(t.cost).map(([k,v]) => `${v} ${k}`).join(", ");
    const disabled = !canAct() || Object.entries(t.cost).some(([k,v]) => (S[k] ?? 0) < v);
    return `<button class="btn-action" data-tool-id="${t.id}" data-tool-type="trad" ${disabled ? "disabled" : ""}>
      <span class="action-icon">${t.icon}</span><span class="action-label">${t.name}</span><span class="action-cost">${costStr}</span>
    </button>`;
  }).join("");
  for (const btn of dom.tradTools.querySelectorAll("[data-tool-id]")) {
    btn.onclick = () => useTool(TRAD_TOOLS.find(t => t.id === btn.dataset.toolId));
  }

  // Papers
  dom.paperList.innerHTML = S.papers.length === 0
    ? "<p class='hint'>还没有论文。学生写完草稿后会出现在这里。</p>"
    : S.papers.slice().reverse().map((p, ri) => {
      const idx = S.papers.length - 1 - ri;
      const canSubmit = p.status === "draft" && canAct();
      return `<div class="paper-item">
        <span class="paper-status ${p.status}">${p.status}</span>
        <span>${p.title}</span>
        ${canSubmit ? `<button class="btn-secondary" style="margin-left:auto;font-size:.75rem;padding:2px 8px" onclick="submitPaper(${idx})">投稿</button>` : ""}
      </div>`;
    }).join("");
}

function renderRivals() {
  dom.rivalGrid.innerHTML = S.rivals.map(r => {
    const myScore = S.paperCount * 10 + S.reputation;
    const rScore = r.papers * 10 + r.reputation;
    return `<div class="rival-card ${rScore > myScore ? "ahead" : ""}">
      <div class="rival-header">
        <span class="rival-avatar">${r.avatar}</span>
        <span class="rival-name">${r.name}</span>
        <span class="rival-style">${r.style}</span>
      </div>
      <div class="rival-stats">${r.papers} 篇论文 · 声望 ${r.reputation}</div>
      <div class="rival-action">${r.lastAction || "暂无动态"}</div>
    </div>`;
  }).join("");
}

function renderNews() {
  dom.newsFeed.innerHTML = S.news.slice().reverse().slice(0, 15).map(n =>
    `<div class="news-item"><span class="news-time">${n.time}</span><div class="news-text">${n.text}</div></div>`
  ).join("");
}

/* ═══ MODAL ═══ */
function showModal(title, desc, choices) {
  dom.modalOverlay.classList.remove("hidden");
  dom.modalTitle.textContent = title;
  dom.modalDesc.textContent = desc;
  dom.modalBody.innerHTML = choices.map(ch =>
    `<button class="btn-choice"><span class="choice-title">${ch.label}</span><span class="choice-desc">${ch.desc || ""}</span></button>`
  ).join("");
  const btns = dom.modalBody.querySelectorAll(".btn-choice");
  choices.forEach((ch, i) => { btns[i].onclick = ch.onclick; });
}
function hideModal() { dom.modalOverlay.classList.add("hidden"); }

function switchTab(tab) {
  $$("#tab-nav .tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  $$(".tab-panel").forEach(p => p.classList.toggle("active", p.dataset.panel === tab));
}

/* ═══ HELPERS ═══ */
function getTitle() {
  if (S.year <= 2) return "讲师";
  if (S.year <= 4 && S.paperCount >= 3) return "副教授";
  if (S.paperCount >= 8 && S.reputation >= 30) return "教授";
  if (S.year > 2) return "讲师（焦虑中）";
  return "讲师";
}

function getNextQLabel() {
  let nq = S.quarter + 1, ny = S.year;
  if (nq > 4) { nq = 1; ny++; }
  return ny > TOTAL_YEARS ? "终审" : `${ny}年 Q${nq}`;
}

function generatePaperTitle() {
  const prefixes = ["Towards", "Rethinking", "A Novel", "On the", "Scaling", "Beyond", "Revisiting"];
  const topics = ["Representation Learning", "Token Efficiency", "Multimodal Fusion", "Few-Shot Adaptation",
    "Data-Driven Discovery", "Neural Architecture", "Prompt Engineering", "Self-Supervised Pre-training"];
  const suffixes = ["in the Age of Foundation Models", "with Limited Supervision", "at Scale",
    "via Reinforcement Learning", "for Scientific Discovery", "without Labels"];
  return `${sample(prefixes)} ${sample(topics)} ${sample(suffixes)}`;
}

function addNews(text) {
  S.news.push({ time: getFullLabel(), text });
}
function addLog(text) {
  S.log.push({ time: getFullLabel(), text });
}

function normalizeState() {
  S.funding = clamp(S.funding, -20, 99);
  S.morale = clamp(S.morale, 0, 100);
  S.tokens = clamp(S.tokens, 0, 99);
  S.compute = clamp(S.compute, 0, 50);
  S.reputation = clamp(S.reputation, -30, 80);
  S.suspicion = clamp(S.suspicion, 0, 100);
  S.progress = clamp(S.progress, 0, 100);
  S.evidence = clamp(S.evidence, 0, 100);
  S.research = clamp(S.research, 0, 100);
  S.teaching = clamp(S.teaching, 0, 100);
  S.admin = clamp(S.admin, 0, 100);
}

function toast(msg) {
  dom.toast.textContent = msg;
  dom.toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => dom.toast.classList.add("hidden"), 2500);
}

function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffle(a) { const c = [...a]; for (let i = c.length-1; i > 0; i--) { const j = rand(0,i); [c[i],c[j]]=[c[j],c[i]]; } return c; }
function sample(a) { return a[Math.floor(Math.random() * a.length)]; }
function deepCopy(v) { return JSON.parse(JSON.stringify(v)); }
function weightedSample(items) {
  const total = items.reduce((s,i) => s + i.w, 0);
  let r = Math.random() * total;
  for (const item of items) { r -= item.w; if (r <= 0) return item.type; }
  return items[items.length-1].type;
}

/* ═══ PERSISTENCE ═══ */
function saveState() { if (S && !S.ended) localStorage.setItem(SAVE_KEY, JSON.stringify(S)); }
function loadSave() { try { const r = localStorage.getItem(SAVE_KEY); return r ? JSON.parse(r) : null; } catch { return null; } }
function clearSave() { localStorage.removeItem(SAVE_KEY); }
function loadMeta() { try { const r = localStorage.getItem(META_KEY); return r ? JSON.parse(r) : { runs: 0, best: 0, bestTitle: "" }; } catch { return { runs: 0, best: 0, bestTitle: "" }; } }
function saveMeta() { localStorage.setItem(META_KEY, JSON.stringify(meta)); }
