/* ═══════════════════════════════════════════════════
   vibe科研牌桌 · Research Tactics Roguelite
   Complete rewrite — rival labs, toxic students, AI traps
   ═══════════════════════════════════════════════════ */

const SAVE_KEY = "vibe-rt-save-v2";
const META_KEY = "vibe-rt-meta-v2";
const TOTAL_WEEKS = 16;
const ACTIONS_PER_WEEK = 3;
const HAND_SIZE = 5;

/* ─── Resource definitions ─── */
const RES_CONFIG = [
  { key: "cash",     icon: "💰", label: "Cash",    bad: v => v <= 0 },
  { key: "tokens",   icon: "🎟️", label: "Tokens",  bad: v => v <= 5 },
  { key: "compute",  icon: "⚡", label: "Compute", bad: v => v <= 3 },
  { key: "morale",   icon: "❤️", label: "Morale",  bad: v => v <= 20 },
  { key: "reputation", icon: "⭐", label: "Rep",   bad: v => v <= 3 },
  { key: "risk",     icon: "⚠️",  label: "Risk",    bad: v => v >= 70 },
];

/* ─── Card Library ─── */
const CARDS = {
  // === RESEARCH ===
  litSweep: {
    id: "litSweep", name: "文献扫描", type: "research",
    copy: "先搞清楚别人做了什么，再决定你做什么。",
    cost: { tokens: 3 }, effect: { progress: 5, evidence: 3 },
  },
  codeProto: {
    id: "codeProto", name: "原型冲刺", type: "research",
    copy: "先跑起来再说。跑起来不等于跑对了。",
    cost: { compute: 4, morale: 3 }, effect: { progress: 10, risk: 5 },
  },
  benchmark: {
    id: "benchmark", name: "跑 Benchmark", type: "research",
    copy: "数字不会说谎，但选哪个数字展示是一门艺术。",
    cost: { compute: 5, tokens: 2 }, effect: { evidence: 10, risk: -4 },
  },
  writeDraft: {
    id: "writeDraft", name: "写论文初稿", type: "research",
    copy: "先把故事讲出来，哪怕证据还没完全跟上。",
    cost: { tokens: 4, morale: 2 }, effect: { progress: 7, reputation: 2, risk: 3 },
  },
  methodMemo: {
    id: "methodMemo", name: "方法备忘", type: "research",
    copy: "把假设和边界写清楚，慢一点但后面少翻车。",
    cost: { tokens: 2 }, effect: { evidence: 5, risk: -3 },
  },

  // === AI TOOLS (high power, high risk) ===
  aiDraft: {
    id: "aiDraft", name: "AI 写稿", type: "research",
    copy: "它写得又快又顺，顺到你忘了检查它是不是在编。",
    cost: { tokens: 8 }, effect: { progress: 14, risk: 10, evidence: -2 },
  },
  aiCodeGen: {
    id: "aiCodeGen", name: "AI 生成代码", type: "infra",
    copy: "一个下午的量它十分钟出完了。但你花了三天 debug。",
    cost: { tokens: 10, compute: 3 }, effect: { progress: 12, risk: 8 },
  },
  aiLitReview: {
    id: "aiLitReview", name: "AI 文献综述", type: "research",
    copy: "引用格式完美，就是有三篇文献不存在。",
    cost: { tokens: 6 }, effect: { progress: 8, evidence: 4, risk: 7 },
  },
  aiDataAnalysis: {
    id: "aiDataAnalysis", name: "AI 数据分析", type: "research",
    copy: "它会给你一个漂亮的结论，附带一个你没注意到的 p-hacking。",
    cost: { tokens: 7, compute: 4 }, effect: { evidence: 8, progress: 6, risk: 9 },
  },
  aiRebuttal: {
    id: "aiRebuttal", name: "AI 写 Rebuttal", type: "research",
    copy: "审稿人说的每一点它都能回，但它回的方式有时候是在编新实验。",
    cost: { tokens: 5 }, effect: { progress: 6, reputation: 3, risk: 6 },
  },

  // === SOCIAL ===
  labMeeting: {
    id: "labMeeting", name: "开组会", type: "social",
    copy: "你花一回合稳定气压，不是管理学，是续命。",
    cost: { cash: 2 }, effect: { morale: 12 },
  },
  fireStudent: {
    id: "fireStudent", name: "劝退学生", type: "social",
    copy: "你终于做了那个所有人都建议你做的决定。",
    cost: { morale: 8, reputation: -2 }, effect: { _special: "fireStudent" },
  },
  hireStudent: {
    id: "hireStudent", name: "招新学生", type: "social",
    copy: "简历很漂亮。简历都很漂亮。",
    cost: { cash: 5 }, effect: { _special: "hireStudent" },
  },
  officeHours: {
    id: "officeHours", name: "答疑时间", type: "social",
    copy: "不是管理学，是把人从崩溃边缘先拉回来。",
    cost: { morale: 2 }, effect: { morale: 6, risk: -2 },
  },
  goFullAI: {
    id: "goFullAI", name: "全面转向 AI", type: "gambit",
    copy: "你决定不再依赖学生了。从现在开始，你和 AI 单挑这个世界。",
    cost: { morale: 5, reputation: -3 }, effect: { _special: "goFullAI" },
  },

  // === FINANCE ===
  grantPitch: {
    id: "grantPitch", name: "基金游说", type: "finance",
    copy: "你把未来包装成一个别人愿意付钱的版本。",
    cost: { morale: 3, tokens: 2 }, effect: { cash: 10, reputation: 1 },
  },
  buyTokens: {
    id: "buyTokens", name: "购买 Tokens", type: "finance",
    copy: "打开钱包，把现金变成 AI 的燃料。",
    cost: { cash: 6 }, effect: { tokens: 15 },
  },
  buyCompute: {
    id: "buyCompute", name: "租 GPU", type: "infra",
    copy: "销售说 low latency。现实说排队两小时。",
    cost: { cash: 5 }, effect: { compute: 12 },
  },
  sponsorCall: {
    id: "sponsorCall", name: "金主电话", type: "finance",
    copy: "不一定体面，但能换 runway。",
    cost: { morale: 2 }, effect: { cash: 8, reputation: 1 },
  },

  // === RECOVERY ===
  sleep: {
    id: "sleep", name: "强制休整", type: "recovery",
    copy: "项目没涨，但你不会在下周先碎掉。",
    cost: {}, effect: { morale: 15, risk: -5 },
  },
  vacation: {
    id: "vacation", name: "放个假", type: "recovery",
    copy: "你终于承认自己也是个人了。",
    cost: { cash: 3 }, effect: { morale: 20, risk: -8 },
  },
  audit: {
    id: "audit", name: "内部审计", type: "research",
    copy: "花时间把之前做的东西检查一遍，代价是速度，收益是少翻车。",
    cost: { compute: 2, morale: 3 }, effect: { risk: -12, evidence: 4 },
  },

  // === BOSS / REWARD CARDS ===
  redTeam: {
    id: "redTeam", name: "红队内审", type: "boss",
    copy: "高价值强牌：速度慢一点，风险大幅下降。",
    cost: { morale: 3 }, effect: { evidence: 6, risk: -12, reputation: 2 },
    rewardOnly: true,
  },
  topPostdoc: {
    id: "topPostdoc", name: "靠谱博后", type: "boss",
    copy: "TA 不坑你 tokens，不坑你机时，甚至还能干活。传说中的存在。",
    cost: { cash: 2 }, effect: { progress: 8, evidence: 5, morale: 4 },
    rewardOnly: true,
  },
  openSourceHit: {
    id: "openSourceHit", name: "开源爆款", type: "boss",
    copy: "你的代码上了 trending，一夜之间 reputation 拉满。",
    cost: { tokens: 3 }, effect: { reputation: 8, progress: 5 },
    rewardOnly: true,
  },
  grantJackpot: {
    id: "grantJackpot", name: "基金大奖", type: "boss",
    copy: "评委说你的项目 '有重要意义'，翻译：给钱。",
    cost: {}, effect: { cash: 15, compute: 8, reputation: 3 },
    rewardOnly: true,
  },
  aiBreakthrough: {
    id: "aiBreakthrough", name: "AI 突破", type: "boss",
    copy: "这次 AI 真的做对了，而且你能证明它做对了。",
    cost: { tokens: 5 }, effect: { progress: 12, evidence: 8, risk: -5 },
    rewardOnly: true,
  },
};

const BASE_DECK = [
  "litSweep", "litSweep", "codeProto", "benchmark", "writeDraft",
  "labMeeting", "grantPitch", "buyTokens", "sleep", "methodMemo",
  "aiDraft", "aiCodeGen", "officeHours", "goFullAI",
];

/* ─── Doctrines ─── */
const DOCTRINES = [
  {
    id: "method-pi", name: "方法派 PI", engine: "Evidence Stack",
    copy: "你不会最快，但你会把错误拦在出手之前。证据线慢慢滚雪球。",
    passiveName: "Evidence First",
    passiveCopy: "每周第一张 research 牌额外 +3 Evidence。",
    start: { cash: 20, tokens: 20, compute: 14, morale: 70, reputation: 8, risk: 15 },
    project: { progress: 10, evidence: 15 },
    extraCards: ["methodMemo", "benchmark", "audit"],
    students: ["normal", "sloppy"],
  },
  {
    id: "ai-maximalist", name: "AI 极端主义者", engine: "Token Burner",
    copy: "学生？不需要。你相信 AI 能搞定一切。代价是你的 token 账单和翻车风险。",
    passiveName: "Full Stack AI",
    passiveCopy: "AI 牌的 token 消耗 -2，但起始 risk +10。",
    start: { cash: 18, tokens: 30, compute: 16, morale: 55, reputation: 5, risk: 25 },
    project: { progress: 8, evidence: 8 },
    extraCards: ["aiDraft", "aiCodeGen", "aiLitReview", "aiDataAnalysis"],
    students: [],
  },
  {
    id: "grant-hustler", name: "经费投机客", engine: "Funding Stack",
    copy: "先解决 runway，再把钱变成牌桌主动权。Money 线更强但也更躁。",
    passiveName: "Money Talks",
    passiveCopy: "每打一张 finance 牌额外 +3 Cash。",
    start: { cash: 28, tokens: 15, compute: 10, morale: 60, reputation: 7, risk: 20 },
    project: { progress: 8, evidence: 10 },
    extraCards: ["sponsorCall", "buyCompute", "buyTokens"],
    students: ["normal", "burner"],
  },
];

/* ─── Students (the chaos engine) ─── */
const STUDENT_TEMPLATES = {
  normal: {
    names: ["小张", "小李", "小王", "小陈", "小林", "小赵"],
    trait: "正常发挥",
    traitDesc: "偶尔能干活，偶尔摸鱼",
    icon: "🧑‍🎓",
    weeklyOutput: { progress: 2, evidence: 1 },
    weeklyCost: { tokens: 2, compute: 1 },
    troubleChance: 0.15,
    troubleEvents: ["摸鱼了一整周", "论文写了一半去打游戏了"],
  },
  sloppy: {
    names: ["小刘·粗心版", "小杨·随缘版", "小周·差不多版"],
    trait: "手滑型选手",
    traitDesc: "产出有但经常需要返工，消耗额外 tokens",
    icon: "🫠",
    weeklyOutput: { progress: 3, evidence: -1 },
    weeklyCost: { tokens: 5, compute: 2 },
    troubleChance: 0.3,
    troubleEvents: [
      "把训练数据搞混了，浪费 8 tokens 重跑",
      "提交了错误的代码版本，consume 额外 5 compute",
      "引用了一篇被撤稿的论文",
    ],
  },
  burner: {
    names: ["小吴·烧钱版", "小孙·GPU杀手", "小何·算力黑洞"],
    trait: "算力黑洞",
    traitDesc: "能出活但会把 GPU 额度一周烧空",
    icon: "🔥",
    weeklyOutput: { progress: 4, evidence: 2 },
    weeklyCost: { tokens: 3, compute: 6 },
    troubleChance: 0.25,
    troubleEvents: [
      "开了 8 张卡跑 ablation，一晚上烧掉 10 compute",
      "忘记关实验，GPU 空转了整个周末",
      "把超算额度用来跑自己的 side project",
    ],
  },
  ghost: {
    names: ["小马·隐身版", "小郑·蒸发版", "小黄·量子态"],
    trait: "量子态学生",
    traitDesc: "观测时存在，不观测时蒸发。产出极不稳定",
    icon: "👻",
    weeklyOutput: { progress: 0, evidence: 0 },
    weeklyCost: { tokens: 1, compute: 1 },
    troubleChance: 0.5,
    troubleEvents: [
      "本周完全联系不上",
      "说在写论文，其实在准备跳组",
      "消失了一周，回来说「有点私事」",
      "组会当天突然请假",
    ],
  },
  faker: {
    names: ["小钱·美化版", "小冯·P值猎人"],
    trait: "结果美化师",
    traitDesc: "数据永远漂亮，漂亮到不真实",
    icon: "🎭",
    weeklyOutput: { progress: 5, evidence: -3 },
    weeklyCost: { tokens: 3, compute: 2 },
    troubleChance: 0.35,
    troubleEvents: [
      "偷偷改了三个 outlier，risk +8",
      "p-hacking 被你发现了，但论文已经投出去了",
      "数据看起来太完美了，审稿人开始怀疑",
      "手动挑选了最好看的那组实验结果",
    ],
  },
};

/* ─── Student hire pool (random when hiring) ─── */
const HIRE_POOL_WEIGHTS = [
  { type: "normal", weight: 25 },
  { type: "sloppy", weight: 25 },
  { type: "burner", weight: 20 },
  { type: "ghost", weight: 15 },
  { type: "faker", weight: 15 },
];

/* ─── Rival Labs ─── */
const RIVALS = [
  {
    id: "sprint-lab", name: "速推组",
    avatar: "🏃", color: "#f85149",
    style: "先发为王",
    desc: "疯狂发 preprint，质量可疑但速度惊人",
    weeklyProgress: () => 4 + rand(0, 4),
    weeklyEvidence: () => 1 + rand(0, 2),
    actions: [
      "又发了一篇 preprint", "把你的选题也做了一版", "在 Twitter 上疯狂宣传",
      "投了三个会议", "速推了一个 demo", "用 AI 一天写完了初稿",
    ],
    stealChance: 0.2,
    stealText: "速推组在你的方向上抢发了一篇 preprint！你的 novelty 受损。",
  },
  {
    id: "money-lab", name: "资本组",
    avatar: "💎", color: "#e3b341",
    style: "有钱任性",
    desc: "经费无限，能买最好的 GPU 和最贵的模型",
    weeklyProgress: () => 3 + rand(0, 3),
    weeklyEvidence: () => 2 + rand(0, 3),
    actions: [
      "又买了一批 A100", "请了一个 visiting professor", "在 Nature 上投了稿",
      "办了一个豪华 workshop", "用最贵的模型跑了全量实验", "基金拿到手软",
    ],
    stealChance: 0.15,
    stealText: "资本组的经费挤占了你的基金申请空间！Cash -5。",
  },
  {
    id: "solid-lab", name: "稳健组",
    avatar: "🧱", color: "#3fb950",
    style: "稳扎稳打",
    desc: "慢但几乎不犯错，evidence 积累很快",
    weeklyProgress: () => 2 + rand(0, 2),
    weeklyEvidence: () => 3 + rand(0, 3),
    actions: [
      "又做了一轮 ablation", "补了对照实验", "认真写了 method section",
      "开了一次严格的内审", "验证了所有 baseline", "证据链越来越扎实",
    ],
    stealChance: 0.1,
    stealText: "稳健组发表了一篇高质量论文，审稿人开始拿你和他们比较。Rep -2。",
  },
];

/* ─── Weekly Events ─── */
const EVENTS = [
  {
    id: "reviewer-nightmare", kicker: "Peer Review", title: "审稿人要求补实验",
    copy: "三个 reviewer 意见互相矛盾。R2 想要更多 ablation，R3 觉得你的方法 '缺乏新意'。",
    choices: [
      { label: "认真补实验", desc: "-5 compute, -3 tokens, +8 evidence, -3 risk", fx: { compute: -5, tokens: -3, evidence: 8, risk: -3 } },
      { label: "用 AI 编一个 rebuttal", desc: "-6 tokens, +4 progress, +8 risk", fx: { tokens: -6, progress: 4, risk: 8 } },
      { label: "直接怼回去", desc: "-3 morale, +2 reputation (或 -4)", fx: { morale: -3, reputation: 2, risk: 5 } },
    ],
  },
  {
    id: "gpu-queue", kicker: "Infrastructure", title: "GPU 队列爆满",
    copy: "整个集群都在排队。你的实验预计排到下周三。",
    choices: [
      { label: "花钱租商业云", desc: "-8 cash, +8 compute", fx: { cash: -8, compute: 8 } },
      { label: "让学生手动优化代码", desc: "-3 morale, +3 compute, +2 risk", fx: { morale: -3, compute: 3, risk: 2 } },
      { label: "等，反正也不差这几天", desc: "-2 progress", fx: { progress: -2 } },
    ],
  },
  {
    id: "preprint-war", kicker: "Competition", title: "竞争对手发了 preprint",
    copy: "你打开 ArXiv，发现一篇和你选题几乎一样的 preprint，来自隔壁大学。",
    choices: [
      { label: "加速冲刺抢发", desc: "+8 progress, +6 risk, -5 morale", fx: { progress: 8, risk: 6, morale: -5 } },
      { label: "转 pivot 找差异化", desc: "-4 progress, +6 evidence, -3 risk", fx: { progress: -4, evidence: 6, risk: -3 } },
      { label: "无视它继续做", desc: "无立即效果，但对手进度+5", fx: { _rivalBoost: 5 } },
    ],
  },
  {
    id: "student-crisis", kicker: "Lab", title: "学生集体摸鱼",
    copy: "你发现整个组最近两周的实验产出几乎为零。组会上所有人都在看手机。",
    choices: [
      { label: "严肃谈话", desc: "-5 morale, 下周学生产出翻倍", fx: { morale: -5, _studentBoost: true } },
      { label: "请大家吃顿饭", desc: "-4 cash, +8 morale", fx: { cash: -4, morale: 8 } },
      { label: "算了，自己做", desc: "-8 morale, +5 progress", fx: { morale: -8, progress: 5 } },
    ],
  },
  {
    id: "grant-window", kicker: "Funding", title: "基金窗口突然打开",
    copy: "一个新的专项基金刚发了通知，deadline 在两周后。但你的材料还没准备好。",
    choices: [
      { label: "全力准备申请", desc: "-6 tokens, -3 morale, 70%概率 +12 cash", fx: { tokens: -6, morale: -3, _grantRoll: true } },
      { label: "让 AI 帮你写申请书", desc: "-8 tokens, 50%概率 +12 cash, +5 risk", fx: { tokens: -8, risk: 5, _grantRoll50: true } },
      { label: "放弃，专注做研究", desc: "+3 progress, +2 evidence", fx: { progress: 3, evidence: 2 } },
    ],
  },
  {
    id: "ai-hallucination", kicker: "AI Crisis", title: "AI 生成的数据有问题",
    copy: "你发现上周 AI 生成的分析结果里有明显的 hallucination。已经写进了论文初稿。",
    choices: [
      { label: "停下来全面排查", desc: "-5 progress, +8 evidence, -8 risk", fx: { progress: -5, evidence: 8, risk: -8 } },
      { label: "只修最明显的问题", desc: "-2 progress, +3 evidence, -2 risk", fx: { progress: -2, evidence: 3, risk: -2 } },
      { label: "审稿人应该看不出来吧", desc: "+10 risk", fx: { risk: 10 } },
    ],
  },
  {
    id: "collab-offer", kicker: "Opportunity", title: "有人想和你合作",
    copy: "一个大组的 PI 发邮件说对你的工作感兴趣，想联合投稿。但他们要第一作者。",
    choices: [
      { label: "接受合作", desc: "+8 progress, +5 reputation, -挂名作者", fx: { progress: 8, reputation: 5, evidence: 3 } },
      { label: "谈判要共一", desc: "-2 morale, +5 progress, +3 reputation", fx: { morale: -2, progress: 5, reputation: 3 } },
      { label: "拒绝，独立发表", desc: "+3 morale, -2 reputation", fx: { morale: 3, reputation: -2 } },
    ],
  },
  {
    id: "data-leak", kicker: "Integrity", title: "数据清洗发现问题",
    copy: "有一批数据的标注明显不对，但已经用它训练了两周了。",
    choices: [
      { label: "全部重来", desc: "-8 progress, -6 compute, +10 evidence, -10 risk", fx: { progress: -8, compute: -6, evidence: 10, risk: -10 } },
      { label: "只修问题数据", desc: "-3 progress, -3 compute, +4 evidence, -4 risk", fx: { progress: -3, compute: -3, evidence: 4, risk: -4 } },
      { label: "在 limitation 里提一嘴", desc: "+4 risk, +2 evidence", fx: { risk: 4, evidence: 2 } },
    ],
  },
  {
    id: "conference-invite", kicker: "Visibility", title: "会议邀请",
    copy: "你被邀请做一个 spotlight talk。但项目还没做完。",
    choices: [
      { label: "接受邀请", desc: "+6 reputation, +5 risk (项目还没做完就上台)", fx: { reputation: 6, risk: 5 } },
      { label: "要求改成 poster", desc: "+2 reputation, +1 risk", fx: { reputation: 2, risk: 1 } },
      { label: "婉拒", desc: "+3 morale, -1 reputation", fx: { morale: 3, reputation: -1 } },
    ],
  },
  {
    id: "student-poach", kicker: "Competition", title: "对手组在挖你的人",
    copy: "你最能干的学生收到了隔壁组的邀请，待遇翻倍。",
    choices: [
      { label: "加钱留人", desc: "-6 cash, 保住学生", fx: { cash: -6 } },
      { label: "画饼留人", desc: "-3 morale, 60%概率留住", fx: { morale: -3, _poachRoll: true } },
      { label: "随他去吧", desc: "失去一个学生", fx: { _loseStudent: true } },
    ],
  },
  {
    id: "media-cycle", kicker: "Press", title: "媒体找你做采访",
    copy: "一个科技媒体想报道你的工作。这是曝光机会，也是提前暴露半成品的风险。",
    choices: [
      { label: "接受采访", desc: "+5 reputation, +4 risk", fx: { reputation: 5, risk: 4 } },
      { label: "让 PR 部门处理", desc: "+2 reputation, +1 risk, -2 tokens", fx: { reputation: 2, risk: 1, tokens: -2 } },
      { label: "拒绝", desc: "-1 reputation, -2 risk", fx: { reputation: -1, risk: -2 } },
    ],
  },
  {
    id: "token-price-hike", kicker: "Market", title: "API 涨价了",
    copy: "你常用的模型 API 宣布下月起价格上调 40%。你的 token 库存突然变得很珍贵。",
    choices: [
      { label: "趁涨价前囤货", desc: "-10 cash, +18 tokens", fx: { cash: -10, tokens: 18 } },
      { label: "切换到便宜模型", desc: "AI 牌效果本局降低 20%", fx: { _weakenAI: true } },
      { label: "减少 AI 使用", desc: "+3 morale, +2 evidence (手动做)", fx: { morale: 3, evidence: 2 } },
    ],
  },
];

/* ─── Boss Events (week 5, 10, 16) ─── */
const BOSS_EVENTS = {
  5: {
    kicker: "Boss Week", title: "系里中期 Review",
    copy: "院长要看你到底在做什么。不是看你多忙，是看你手里有没有真东西。",
    threshold: { progress: 30, evidence: 25 },
    reward: { cash: 8, reputation: 4, morale: 10 },
    penalty: { reputation: -4, morale: -8, risk: 10 },
  },
  10: {
    kicker: "Boss Week", title: "经费中期检查",
    copy: "基金委来检查进展了。你需要证明钱没白花。",
    threshold: { progress: 55, evidence: 45 },
    reward: { cash: 15, compute: 8, reputation: 5 },
    penalty: { cash: -10, reputation: -5, morale: -10 },
  },
  16: {
    kicker: "Final Boss", title: "聘期材料送审",
    copy: "你的全部工作被摊在桌子上，由完全不了解你的人来评价。",
    threshold: { progress: 80, evidence: 65 },
    reward: { _tenure: true },
    penalty: { _noTenure: true },
  },
};

const REWARD_POOL = ["redTeam", "topPostdoc", "openSourceHit", "grantJackpot", "aiBreakthrough", "aiRebuttal", "vacation"];

/* ─── Student trouble events (popup) ─── */
const STUDENT_TROUBLE_EVENTS = [
  {
    title: "学生把超算额度烧空了",
    desc: "TA 开了 16 张卡做 grid search，参数空间是 10 的 8 次方。",
    choices: [
      { label: "扣 TA 的额度", effect: { compute: -8 }, text: "Compute -8" },
      { label: "算了下次注意", effect: { compute: -4, morale: -2 }, text: "Compute -4, Morale -2" },
    ],
  },
  {
    title: "学生用 tokens 做了个人项目",
    desc: "你发现组里的 API 账单暴增。原来 TA 拿你的 key 跑自己的 side project。",
    choices: [
      { label: "严厉警告", effect: { tokens: -10, morale: -5 }, text: "Tokens -10, Morale -5" },
      { label: "让 TA 写个报告", effect: { tokens: -6, morale: -2 }, text: "Tokens -6, Morale -2" },
    ],
  },
  {
    title: "学生提交了编造的实验结果",
    desc: "数据完美到不真实。你仔细一看，三组 'baseline' 的数字一模一样。",
    choices: [
      { label: "全部推翻重做", effect: { progress: -8, evidence: -5, risk: -10 }, text: "Progress -8, Evidence -5, Risk -10" },
      { label: "只修改最明显的部分", effect: { progress: -3, risk: 5 }, text: "Progress -3, Risk +5" },
    ],
  },
  {
    title: "学生把 GPU 忘关了一个周末",
    desc: "周一早上你收到告警邮件，48 小时的 GPU 时间被空转消耗了。",
    choices: [
      { label: "吸取教训加自动关机", effect: { compute: -6, tokens: -2 }, text: "Compute -6, Tokens -2" },
      { label: "申请额外额度", effect: { compute: -3, cash: -3 }, text: "Compute -3, Cash -3" },
    ],
  },
  {
    title: "学生拿 API 聊天",
    desc: "你查看 token 使用日志，发现有人拿实验室的 API key 和 AI 聊了三天感情问题。",
    choices: [
      { label: "换掉 API key", effect: { tokens: -8 }, text: "Tokens -8" },
      { label: "group chat 里阴阳怪气提醒", effect: { tokens: -5, morale: -4 }, text: "Tokens -5, Morale -4" },
    ],
  },
  {
    title: "学生不经审核投了稿",
    desc: "你在邮箱里看到一封 'submission confirmation'——来自你完全不知道的一篇投稿。",
    choices: [
      { label: "紧急撤稿", effect: { reputation: -3, morale: -5 }, text: "Rep -3, Morale -5" },
      { label: "赶紧修改让它合格", effect: { tokens: -8, morale: -3, risk: 6 }, text: "Tokens -8, Morale -3, Risk +6" },
    ],
  },
  {
    title: "学生引用了不存在的文献",
    desc: "Review 来了。审稿人说 Reference [17] 查不到。你也查不到。因为它是 AI 编的。",
    choices: [
      { label: "彻底核查所有引用", effect: { tokens: -4, evidence: 3, risk: -5 }, text: "Tokens -4, Evidence +3, Risk -5" },
      { label: "只删掉这一条", effect: { risk: 3 }, text: "Risk +3" },
    ],
  },
];

/* ═══════════ STATE ═══════════ */
let state = null;
let meta = loadMeta();
let toastTimer = null;

/* ═══════════ DOM REFS ═══════════ */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

const dom = {
  startScreen: $("#start-screen"),
  doctrineGrid: $("#doctrine-grid"),
  btnContinue: $("#btn-continue"),
  btnWipe: $("#btn-wipe"),
  metaLine: $("#meta-line"),
  draftScreen: $("#draft-screen"),
  draftKicker: $("#draft-kicker"),
  draftTitle: $("#draft-title"),
  draftDesc: $("#draft-desc"),
  draftGrid: $("#draft-grid"),
  btnSkipDraft: $("#btn-skip-draft"),
  studentEventScreen: $("#student-event-screen"),
  studentEventTitle: $("#student-event-title"),
  studentEventDesc: $("#student-event-desc"),
  studentEventChoices: $("#student-event-choices"),
  endScreen: $("#end-screen"),
  endTitle: $("#end-title"),
  endCopy: $("#end-copy"),
  endStats: $("#end-stats"),
  endRivalSummary: $("#end-rival-summary"),
  btnRestart: $("#btn-restart"),
  btnCopySummary: $("#btn-copy-summary"),
  hud: $("#game-hud"),
  hudWeek: $("#hud-week"),
  hudResources: $("#hud-resources"),
  hudActions: $("#hud-actions"),
  hudDoctrine: $("#hud-doctrine"),
  gameMain: $("#game-main"),
  rivalsList: $("#rivals-list"),
  eventCard: $("#event-card"),
  eventKicker: $("#event-kicker"),
  eventWeekBadge: $("#event-week-badge"),
  eventTitle: $("#event-title"),
  eventCopy: $("#event-copy"),
  eventChoices: $("#event-choices"),
  playedGrid: $("#played-grid"),
  playedCount: $("#played-count"),
  btnResolve: $("#btn-resolve"),
  btnUndo: $("#btn-undo"),
  projectTitle: $("#project-title"),
  projectField: $("#project-field"),
  progressVal: $("#progress-val"),
  progressFill: $("#progress-fill"),
  evidenceVal: $("#evidence-val"),
  evidenceFill: $("#evidence-fill"),
  studentMood: $("#student-mood"),
  studentsList: $("#students-list"),
  deckCounts: $("#deck-counts"),
  logList: $("#log-list"),
  handBar: $("#hand-bar"),
  handFan: $("#hand-fan"),
  popupLayer: $("#popup-layer"),
  shakeWrapper: $("#shake-wrapper"),
  toast: $("#toast"),
};

/* ═══════════ BOOTSTRAP ═══════════ */
bootstrap();

function bootstrap() {
  renderDoctrines();
  renderMeta();

  dom.btnContinue.addEventListener("click", continueSave);
  dom.btnWipe.addEventListener("click", wipeSave);
  dom.btnResolve.addEventListener("click", resolveWeek);
  dom.btnUndo.addEventListener("click", undoLastCard);
  dom.btnRestart.addEventListener("click", restartGame);
  dom.btnCopySummary.addEventListener("click", copySummary);
  dom.btnSkipDraft.addEventListener("click", skipDraft);
}

/* ═══════════ START / INIT ═══════════ */
function renderDoctrines() {
  dom.doctrineGrid.innerHTML = "";
  for (const d of DOCTRINES) {
    const el = document.createElement("div");
    el.className = "doctrine-card";
    el.innerHTML = `
      <div class="doctrine-engine">${d.engine}</div>
      <div class="doctrine-name">${d.name}</div>
      <div class="doctrine-copy">${d.copy}</div>
      <div class="doctrine-passive">${d.passiveName}: ${d.passiveCopy}</div>
      <div class="doctrine-stats">
        ${Object.entries(d.start).map(([k,v]) => `<span class="doctrine-stat">${k} ${v}</span>`).join("")}
      </div>
    `;
    el.addEventListener("click", () => startRun(d.id));
    dom.doctrineGrid.appendChild(el);
  }
}

function renderMeta() {
  if (meta.runsPlayed > 0) {
    dom.metaLine.textContent = `历史: ${meta.runsPlayed} 局 | 最高分 ${meta.bestScore} | 最佳结局: ${meta.bestTitle || "无"}`;
  }
  const save = loadSave();
  if (save) {
    dom.btnContinue.style.display = "";
    dom.btnWipe.style.display = "";
  }
}

function startRun(doctrineId) {
  const d = DOCTRINES.find(x => x.id === doctrineId);
  const project = sample([
    { title: "极端天气归因分析", field: "Climate Science" },
    { title: "单细胞图谱跨组织对比", field: "Biology" },
    { title: "小模型科研代理", field: "AI Research" },
    { title: "晚清报刊语料漂移", field: "Digital Humanities" },
    { title: "新型催化剂筛选", field: "Materials Science" },
    { title: "社交媒体极化传播", field: "Social Science" },
  ]);

  const students = d.students.map(type => createStudent(type));

  state = {
    week: 1,
    totalWeeks: TOTAL_WEEKS,
    actionsPerWeek: ACTIONS_PER_WEEK,
    actionsLeft: ACTIONS_PER_WEEK,
    doctrineId: d.id,
    // Resources
    cash: d.start.cash,
    tokens: d.start.tokens,
    compute: d.start.compute,
    morale: d.start.morale,
    reputation: d.start.reputation,
    risk: d.start.risk,
    // Project
    project: {
      title: project.title,
      field: project.field,
      progress: d.project.progress,
      evidence: d.project.evidence,
    },
    // Deck
    drawPile: shuffle([...BASE_DECK, ...d.extraCards]),
    discardPile: [],
    hand: [],
    played: [],
    rewardCards: [],
    // Students
    students: students,
    studentBoostNextWeek: false,
    aiWeakened: false,
    fullAI: d.id === "ai-maximalist",
    // Rivals
    rivals: RIVALS.map(r => ({
      id: r.id, name: r.name, avatar: r.avatar, color: r.color,
      style: r.style,
      progress: rand(5, 12), evidence: rand(5, 10),
      lastAction: "",
    })),
    // Event
    currentEvent: null,
    eventResolved: false,
    pendingStudentEvent: null,
    pendingDraft: null,
    // Log
    log: [],
    ended: false,
    ending: null,
    summaryText: "",
  };

  dom.startScreen.classList.add("hidden");
  showGame();
  drawHand();
  generateWeeklyEvent();
  renderAll();
  addLog("开始了新的 run: " + d.name + " · " + project.title);
  saveState();
}

function createStudent(type) {
  const t = STUDENT_TEMPLATES[type];
  return {
    type,
    name: sample(t.names),
    trait: t.trait,
    traitDesc: t.traitDesc,
    icon: t.icon,
    weeklyOutput: { ...t.weeklyOutput },
    weeklyCost: { ...t.weeklyCost },
    troubleChance: t.troubleChance,
    troubleEvents: [...t.troubleEvents],
    fired: false,
    boosted: false,
  };
}

/* ═══════════ GAME FLOW ═══════════ */
function showGame() {
  dom.hud.classList.remove("hidden");
  dom.gameMain.classList.remove("hidden");
  dom.handBar.classList.remove("hidden");
}

function hideGame() {
  dom.hud.classList.add("hidden");
  dom.gameMain.classList.add("hidden");
  dom.handBar.classList.add("hidden");
}

function drawHand() {
  if (state.drawPile.length < HAND_SIZE) {
    state.drawPile = shuffle([...state.drawPile, ...state.discardPile]);
    state.discardPile = [];
  }
  state.hand = state.drawPile.splice(0, HAND_SIZE);
  state.played = [];
  state.actionsLeft = ACTIONS_PER_WEEK;
  state.eventResolved = false;
}

function generateWeeklyEvent() {
  const boss = BOSS_EVENTS[state.week];
  if (boss) {
    state.currentEvent = {
      ...boss,
      boss: true,
      choices: null,
    };
  } else {
    // Pick a random event not recently used
    state.currentEvent = deepCopy(sample(EVENTS));
  }
}

function playCard(cardId) {
  if (!state || state.ended || state.actionsLeft <= 0) return;
  if (state.pendingStudentEvent || state.pendingDraft) return;

  const card = CARDS[cardId];
  if (!card) return;

  // Check affordability
  const realCost = getEffectiveCost(card);
  for (const [key, val] of Object.entries(realCost)) {
    if (key.startsWith("_")) continue;
    if (key === "reputation") continue; // reputation cost is applied as effect
    if ((state[key] ?? 0) < val) {
      toast("资源不足！");
      return;
    }
  }

  // Pay cost
  for (const [key, val] of Object.entries(realCost)) {
    if (key.startsWith("_")) continue;
    if (key === "reputation") { state.reputation += val; continue; }
    state[key] -= val;
  }

  // Apply effects
  const realEffect = getEffectiveEffect(card);
  applyEffects(realEffect, cardId);

  // Apply doctrine passive
  applyDoctrinePassive(card);

  // Move card
  const idx = state.hand.indexOf(cardId);
  if (idx !== -1) state.hand.splice(idx, 1);
  state.played.push(cardId);
  state.actionsLeft--;

  addLog(`打出「${card.name}」`);
  normalizeState();
  saveState();
  renderAll();
  checkResolveReady();
}

function getEffectiveCost(card) {
  const cost = { ...card.cost };
  const d = getDoctrine();
  // AI maximalist: AI cards cost less tokens
  if (d.id === "ai-maximalist" && isAICard(card) && cost.tokens) {
    cost.tokens = Math.max(1, cost.tokens - 2);
  }
  return cost;
}

function getEffectiveEffect(card) {
  const effect = { ...card.effect };
  if (state.aiWeakened && isAICard(card)) {
    for (const key of ["progress", "evidence"]) {
      if (effect[key] > 0) effect[key] = Math.ceil(effect[key] * 0.8);
    }
  }
  return effect;
}

function isAICard(card) {
  return card.id.startsWith("ai");
}

function applyEffects(fx, sourceId) {
  for (const [key, val] of Object.entries(fx)) {
    if (key.startsWith("_")) {
      handleSpecialEffect(key, val, sourceId);
      continue;
    }
    if (key === "progress" || key === "evidence") {
      state.project[key] += val;
      spawnPopup(key, val);
    } else {
      state[key] += val;
      spawnPopup(key, val);
    }
  }
}

function handleSpecialEffect(key, val, sourceId) {
  if (key === "_special") {
    if (val === "fireStudent") {
      const active = state.students.filter(s => !s.fired);
      if (active.length > 0) {
        // Fire the worst student (highest trouble chance)
        active.sort((a, b) => b.troubleChance - a.troubleChance);
        active[0].fired = true;
        addLog(`劝退了 ${active[0].name}（${active[0].trait}）`);
        toast(`${active[0].name} 已被劝退`);
      } else {
        toast("没有学生可以劝退");
      }
    } else if (val === "hireStudent") {
      const type = weightedSample(HIRE_POOL_WEIGHTS);
      const s = createStudent(type);
      state.students.push(s);
      addLog(`招了新学生 ${s.name}（${s.trait}）`);
      toast(`新学生: ${s.name} - ${s.trait}`);
    } else if (val === "goFullAI") {
      state.students.forEach(s => s.fired = true);
      state.fullAI = true;
      addLog("解散了所有学生，全面转向 AI 科研");
      toast("全面 AI 模式启动！");
    }
  }
}

function applyDoctrinePassive(card) {
  const d = getDoctrine();
  if (d.id === "method-pi" && card.type === "research" && state.played.filter(c => CARDS[c].type === "research").length === 1) {
    state.project.evidence += 3;
    spawnPopup("evidence", 3);
  }
  if (d.id === "grant-hustler" && card.type === "finance") {
    state.cash += 3;
    spawnPopup("cash", 3);
  }
}

function checkResolveReady() {
  dom.btnResolve.disabled = false; // Can always resolve (even with actions left)
}

function resolveWeek() {
  if (!state || state.ended) return;
  if (state.pendingStudentEvent || state.pendingDraft) return;

  // If event not resolved yet, resolve it
  if (!state.eventResolved && state.currentEvent) {
    // Boss events auto-resolve based on thresholds
    if (state.currentEvent.boss) {
      resolveBossEvent();
      // Boss may trigger tenure ending or draft — stop here either way
      if (state.ended || state.pendingDraft) return;
    }
    // Non-boss events need a choice (handled by choice buttons)
    if (!state.eventResolved && !state.currentEvent.boss) {
      toast("请先处理本周事件！");
      return;
    }
  }

  // Discard remaining hand
  state.discardPile.push(...state.hand, ...state.played);
  state.hand = [];
  state.played = [];

  // Student phase
  processStudents();

  // Rival phase
  processRivals();

  // Weekly upkeep
  applyWeeklyUpkeep();

  // Check student trouble
  const trouble = checkStudentTrouble();
  if (trouble) {
    state.pendingStudentEvent = trouble;
    normalizeState();
    saveState();
    renderAll();
    showStudentEvent(trouble);
    return;
  }

  advanceWeek();
}

function resolveBossEvent() {
  const boss = state.currentEvent;
  const passed = state.project.progress >= boss.threshold.progress &&
                 state.project.evidence >= boss.threshold.evidence;

  if (passed) {
    if (boss.reward._tenure) {
      // Special: tenure ending
      finishRun({
        title: "Tenure Secured 🎓",
        copy: "你不是最轻松的那个人，但你把项目、证据和实验室一起带过了终点。整个学术生涯的压力，浓缩在这 16 周里。你活下来了。",
        key: "tenure",
        scoreBonus: 30,
      });
      return;
    }
    applyEffects(boss.reward);
    addLog(`Boss 周「${boss.title}」通过！`);
    toast("Boss 周通过！");
    // Offer reward card
    state.pendingDraft = buildDraftChoices();
  } else {
    if (boss.penalty._noTenure) {
      finishRun({
        title: "Contract Expired",
        copy: "聘期到了。你留下了一部分工作，也留下了一部分没来得及真正做实的东西。评审材料上的数字不够亮，但你知道自己确实试过了。",
        key: "expired",
        scoreBonus: 0,
      });
      return;
    }
    applyEffects(boss.penalty);
    addLog(`Boss 周「${boss.title}」没过。`);
    toast("Boss 周失败...");
    screenShake();
  }
  state.eventResolved = true;
}

function processStudents() {
  const active = state.students.filter(s => !s.fired);
  for (const s of active) {
    // Pay student costs
    for (const [key, val] of Object.entries(s.weeklyCost)) {
      state[key] -= val;
    }
    // Student output (if not ghosting)
    if (Math.random() > 0.3 || s.type !== "ghost") {
      const boost = s.boosted ? 2 : 1;
      for (const [key, val] of Object.entries(s.weeklyOutput)) {
        if (key === "progress" || key === "evidence") {
          state.project[key] += val * boost;
        } else {
          state[key] += val * boost;
        }
      }
    }
    s.boosted = false;
  }
}

function processRivals() {
  for (const rival of state.rivals) {
    const def = RIVALS.find(r => r.id === rival.id);
    rival.progress += def.weeklyProgress();
    rival.evidence += def.weeklyEvidence();
    rival.lastAction = sample(def.actions);

    // Steal check
    if (Math.random() < def.stealChance) {
      if (def.id === "sprint-lab") {
        state.project.progress -= 3;
        state.risk += 3;
        addLog(`速推组抢发了 preprint，你的进度受损！`);
      } else if (def.id === "money-lab") {
        state.cash -= 5;
        addLog(`资本组挤占了你的基金空间！`);
      } else if (def.id === "solid-lab") {
        state.reputation -= 2;
        addLog(`稳健组发表了高质量论文，审稿人开始拿你比较。`);
      }
      screenShake();
    }
  }
}

function checkStudentTrouble() {
  const active = state.students.filter(s => !s.fired);
  for (const s of active) {
    if (Math.random() < s.troubleChance) {
      // Pick a random trouble event
      return sample(STUDENT_TROUBLE_EVENTS);
    }
  }
  return null;
}

function applyWeeklyUpkeep() {
  state.cash -= 2;
  state.morale -= 2;
  state.compute = Math.max(0, state.compute - 1);
  // Risk naturally creeps up
  state.risk += 1;
  // Student boost resets
  state.studentBoostNextWeek = false;
}

function advanceWeek() {
  normalizeState();

  // Check collapse
  const collapse = getCollapseEnding();
  if (collapse) {
    finishRun(collapse);
    return;
  }

  // Check if pending draft
  if (state.pendingDraft) {
    saveState();
    renderAll();
    showDraftScreen();
    return;
  }

  // Next week
  state.week++;
  if (state.week > TOTAL_WEEKS) {
    finishRun(getFinalEnding());
    return;
  }

  drawHand();
  generateWeeklyEvent();
  saveState();
  renderAll();
}

function undoLastCard() {
  if (!state || state.played.length === 0) return;
  // Simple undo: just restore the card to hand (don't undo effects - too complex)
  const cardId = state.played.pop();
  state.hand.push(cardId);
  state.actionsLeft++;
  toast("撤回了「" + CARDS[cardId].name + "」（效果未还原）");
  saveState();
  renderAll();
}

/* ─── Event Choice ─── */
function makeEventChoice(choiceIdx) {
  if (!state || state.eventResolved) return;
  const event = state.currentEvent;
  if (!event || !event.choices) return;
  const choice = event.choices[choiceIdx];

  // Apply effects
  for (const [key, val] of Object.entries(choice.fx)) {
    if (key === "_rivalBoost") {
      state.rivals.forEach(r => r.progress += val);
    } else if (key === "_studentBoost") {
      state.students.filter(s => !s.fired).forEach(s => s.boosted = true);
    } else if (key === "_grantRoll") {
      if (Math.random() < 0.7) {
        state.cash += 12;
        addLog("基金申请成功！+12 Cash");
        toast("基金中了！+12 Cash");
      } else {
        addLog("基金申请失败。");
        toast("基金没中...");
      }
    } else if (key === "_grantRoll50") {
      if (Math.random() < 0.5) {
        state.cash += 12;
        addLog("AI 写的申请书居然中了！+12 Cash");
        toast("居然中了！+12 Cash");
      } else {
        addLog("AI 写的申请书被看出来了。");
        toast("被看出是 AI 写的...");
      }
    } else if (key === "_poachRoll") {
      if (Math.random() < 0.6) {
        addLog("画饼成功，学生留下了。");
        toast("学生被画饼留住了");
      } else {
        const active = state.students.filter(s => !s.fired);
        if (active.length > 0) {
          const best = active.reduce((a, b) => (a.weeklyOutput.progress > b.weeklyOutput.progress ? a : b));
          best.fired = true;
          addLog(`${best.name} 还是走了。`);
          toast(`${best.name} 跳组了...`);
        }
      }
    } else if (key === "_loseStudent") {
      const active = state.students.filter(s => !s.fired);
      if (active.length > 0) {
        const best = active.reduce((a, b) => (a.weeklyOutput.progress > b.weeklyOutput.progress ? a : b));
        best.fired = true;
        addLog(`${best.name} 被挖走了。`);
      }
    } else if (key === "_weakenAI") {
      state.aiWeakened = true;
      addLog("切换到便宜模型，AI 效果降低 20%。");
    } else if (key === "progress" || key === "evidence") {
      state.project[key] += val;
      spawnPopup(key, val);
    } else {
      state[key] += val;
      spawnPopup(key, val);
    }
  }

  state.eventResolved = true;
  addLog(`事件「${event.title}」: 选择了「${choice.label}」`);
  normalizeState();
  saveState();
  renderAll();
}

/* ─── Student Event Popup ─── */
function showStudentEvent(evt) {
  dom.studentEventScreen.classList.remove("hidden");
  dom.studentEventTitle.textContent = evt.title;
  dom.studentEventDesc.textContent = evt.desc;
  dom.studentEventChoices.innerHTML = "";
  evt.choices.forEach((ch, i) => {
    const btn = document.createElement("button");
    btn.className = "btn-choice";
    btn.innerHTML = `<span class="choice-label">${ch.label}</span><span class="choice-effect">${ch.text}</span>`;
    btn.addEventListener("click", () => resolveStudentEvent(i));
    dom.studentEventChoices.appendChild(btn);
  });
}

function resolveStudentEvent(choiceIdx) {
  const evt = state.pendingStudentEvent;
  const ch = evt.choices[choiceIdx];
  for (const [key, val] of Object.entries(ch.effect)) {
    if (key === "progress" || key === "evidence") {
      state.project[key] += val;
    } else {
      state[key] += val;
    }
    spawnPopup(key, val);
  }
  addLog(`学生事故「${evt.title}」: ${ch.label}`);
  state.pendingStudentEvent = null;
  dom.studentEventScreen.classList.add("hidden");
  screenShake();
  normalizeState();
  advanceWeek();
}

/* ─── Draft Screen ─── */
function buildDraftChoices() {
  const unlocked = new Set(state.rewardCards);
  const remaining = REWARD_POOL.filter(c => !unlocked.has(c));
  const pool = remaining.length >= 3 ? remaining : [...REWARD_POOL];
  return shuffle(pool).slice(0, 3);
}

function showDraftScreen() {
  dom.draftScreen.classList.remove("hidden");
  dom.draftGrid.innerHTML = "";
  for (const cardId of state.pendingDraft) {
    const wrapper = document.createElement("div");
    wrapper.className = "draft-card-wrapper";
    wrapper.innerHTML = renderCardHTML(cardId);
    wrapper.addEventListener("click", () => claimDraft(cardId));
    dom.draftGrid.appendChild(wrapper);
  }
}

function claimDraft(cardId) {
  state.rewardCards.push(cardId);
  state.discardPile.push(cardId);
  addLog(`获得强牌「${CARDS[cardId].name}」`);
  toast(`获得「${CARDS[cardId].name}」！`);
  state.pendingDraft = null;
  dom.draftScreen.classList.add("hidden");
  state.week++;
  if (state.week > TOTAL_WEEKS) {
    finishRun(getFinalEnding());
    return;
  }
  drawHand();
  generateWeeklyEvent();
  saveState();
  renderAll();
}

function skipDraft() {
  state.pendingDraft = null;
  dom.draftScreen.classList.add("hidden");
  addLog("跳过了强牌选择。");
  state.week++;
  if (state.week > TOTAL_WEEKS) {
    finishRun(getFinalEnding());
    return;
  }
  drawHand();
  generateWeeklyEvent();
  saveState();
  renderAll();
}

/* ═══════════ ENDINGS ═══════════ */
function getCollapseEnding() {
  if (state.morale <= 0) return {
    title: "Burnout Cascade 💀",
    copy: "你不是被某一周打倒的，你是被一整套每周都必须继续的节奏磨空的。邮件还在来，deadline 还在走，但你已经没有力气打开电脑了。",
    key: "burnout", scoreBonus: -10,
  };
  if (state.risk >= 100) return {
    title: "Retraction Season 📰",
    copy: "速度做出来了，但可信度没留住。审稿人发现了问题，同行开始复现，媒体开始报道。你的名字出现在了错误的列表上。",
    key: "retraction", scoreBonus: -20,
  };
  if (state.cash <= -15) return {
    title: "Lab Insolvency 💸",
    copy: "你还有想法，但已经没有把想法跑成结果的 runway 了。学生在找下家，GPU 账单在催收。",
    key: "insolvency", scoreBonus: -15,
  };
  return null;
}

function getFinalEnding() {
  const score = calculateScore();
  if (score >= 180) return {
    title: "Field Leader 🏆",
    copy: "你不仅活过了聘期，还成为了这个领域的引领者。对手组开始引用你的工作。",
    key: "leader", scoreBonus: 25,
  };
  if (score >= 120) return {
    title: "Lab Survives ✅",
    copy: "你没有统治这个系统，但你成功活过了它，并留下了一套还能继续转的桌面。",
    key: "survive", scoreBonus: 10,
  };
  if (state.risk >= 60) return {
    title: "Citation Without Trust ⚠️",
    copy: "数字和存在感都还在，但真正让你心安的那部分并没有被建立起来。",
    key: "fragile", scoreBonus: -5,
  };
  return {
    title: "Contract Expired 📋",
    copy: "聘期到了。你留下了一部分工作，也留下了一部分没来得及真正做实的东西。",
    key: "expired", scoreBonus: 0,
  };
}

function calculateScore() {
  return Math.floor(
    state.project.progress * 1.2 +
    state.project.evidence * 1.5 +
    state.reputation * 3 -
    state.risk * 0.8 +
    state.cash * 0.3 +
    state.morale * 0.2
  );
}

function finishRun(ending) {
  state.ended = true;
  state.ending = ending;
  const score = calculateScore() + (ending.scoreBonus || 0);
  state.summaryText = buildSummaryText(ending, score);

  meta.runsPlayed++;
  if (score > meta.bestScore) { meta.bestScore = score; meta.bestTitle = ending.title; }
  saveMeta();
  clearSave();
  renderAll();
  showEndScreen(ending, score);
}

function showEndScreen(ending, score) {
  dom.endScreen.classList.remove("hidden");
  dom.endTitle.textContent = ending.title;
  dom.endCopy.textContent = ending.copy;

  dom.endStats.innerHTML = [
    { label: "Score", value: score },
    { label: "Progress", value: state.project.progress },
    { label: "Evidence", value: state.project.evidence },
    { label: "Risk", value: state.risk },
  ].map(s => `<div class="end-stat-card"><span>${s.label}</span><strong>${s.value}</strong></div>`).join("");

  // Rival comparison
  const allEntries = [
    { name: "你", progress: state.project.progress, evidence: state.project.evidence,
      score: state.project.progress + state.project.evidence },
    ...state.rivals.map(r => ({ name: r.name, progress: r.progress, evidence: r.evidence,
      score: r.progress + r.evidence })),
  ].sort((a, b) => b.score - a.score);

  dom.endRivalSummary.innerHTML = "<h3 class='panel-title' style='margin-top:.5rem'>排名</h3>" +
    allEntries.map((e, i) => `
      <div class="end-rival-row ${e.name === '你' ? 'style="color:var(--accent);font-weight:700"' : ''}">
        <span class="rival-place">#${i + 1}</span>
        <span>${e.name}</span>
        <span style="margin-left:auto;font-family:var(--font)">P:${e.progress} E:${e.evidence}</span>
      </div>
    `).join("");
}

function buildSummaryText(ending, score) {
  return `🔬 vibe科研牌桌 · 战报\n结局: ${ending.title}\n分数: ${score}\n` +
    `项目: ${state.project.title} (${state.project.field})\n` +
    `Progress: ${state.project.progress} | Evidence: ${state.project.evidence} | Risk: ${state.risk}\n` +
    `流派: ${getDoctrine().name}\n周数: ${state.week}/${TOTAL_WEEKS}\n` +
    `学生: ${state.students.filter(s => !s.fired).length} 人在岗\n` +
    `全AI模式: ${state.fullAI ? "是" : "否"}`;
}

/* ═══════════ RENDERING ═══════════ */
function renderAll() {
  if (!state) return;
  renderHUD();
  renderRivals();
  renderEvent();
  renderPlayed();
  renderHand();
  renderProject();
  renderStudents();
  renderDeckInfo();
  renderLog();
}

function renderHUD() {
  dom.hudWeek.textContent = `Week ${state.week} / ${state.totalWeeks}`;
  dom.hudActions.textContent = `Actions: ${state.actionsLeft}/${state.actionsPerWeek}`;
  dom.hudDoctrine.textContent = getDoctrine().name;

  dom.hudResources.innerHTML = "";
  for (const rc of RES_CONFIG) {
    const val = state[rc.key];
    const el = document.createElement("div");
    el.className = "hud-res";
    if (rc.bad(val)) el.classList.add("flash-bad");
    el.innerHTML = `<span class="res-icon">${rc.icon}</span><span class="res-val">${val}</span>`;
    el.title = rc.label;
    dom.hudResources.appendChild(el);
  }
}

function renderRivals() {
  dom.rivalsList.innerHTML = "";
  const myScore = state.project.progress + state.project.evidence;

  for (const rival of state.rivals) {
    const rScore = rival.progress + rival.evidence;
    const ahead = rScore > myScore;
    const el = document.createElement("div");
    el.className = `rival-card ${ahead ? "rival-ahead" : ""}`;
    el.innerHTML = `
      <div class="rival-header">
        <div class="rival-avatar" style="background:${rival.color}22;color:${rival.color}">${rival.avatar}</div>
        <div>
          <div class="rival-name">${rival.name}</div>
          <div class="rival-style">${rival.style}</div>
        </div>
      </div>
      <div class="rival-track">
        <div class="rival-track-label"><span>Progress</span><span>${rival.progress}</span></div>
        <div class="rival-bar"><div class="rival-bar-fill" style="width:${Math.min(100, rival.progress)}%;background:${rival.color}"></div></div>
      </div>
      <div class="rival-track">
        <div class="rival-track-label"><span>Evidence</span><span>${rival.evidence}</span></div>
        <div class="rival-bar"><div class="rival-bar-fill" style="width:${Math.min(100, rival.evidence)}%;background:${rival.color}55"></div></div>
      </div>
      <div class="rival-action">${rival.lastAction || "还在筹备中..."}</div>
    `;
    dom.rivalsList.appendChild(el);
  }
}

function renderEvent() {
  const evt = state.currentEvent;
  if (!evt) return;

  dom.eventKicker.textContent = evt.kicker;
  dom.eventWeekBadge.textContent = `Week ${state.week}`;
  dom.eventTitle.textContent = evt.title;
  dom.eventCopy.textContent = evt.copy;

  dom.eventChoices.innerHTML = "";

  if (evt.boss) {
    // Show threshold
    const pOk = state.project.progress >= evt.threshold.progress;
    const eOk = state.project.evidence >= evt.threshold.evidence;
    dom.eventChoices.innerHTML = `
      <div style="font-size:.85rem;color:var(--text-dim)">
        需要: Progress ≥ ${evt.threshold.progress} ${pOk ? "✅" : "❌"} |
        Evidence ≥ ${evt.threshold.evidence} ${eOk ? "✅" : "❌"}
      </div>
      <div style="font-size:.8rem;margin-top:.4rem;color:${pOk && eOk ? "var(--green)" : "var(--red)"}">
        ${pOk && eOk ? "达标！结算时自动通过。" : "未达标。结算时将受到惩罚。"}
      </div>
    `;
  } else if (!state.eventResolved && evt.choices) {
    for (let i = 0; i < evt.choices.length; i++) {
      const ch = evt.choices[i];
      const btn = document.createElement("button");
      btn.className = "btn-choice";
      btn.innerHTML = `<span class="choice-label">${ch.label}</span><span class="choice-effect">${ch.desc}</span>`;
      btn.addEventListener("click", () => makeEventChoice(i));
      dom.eventChoices.appendChild(btn);
    }
  } else if (state.eventResolved) {
    dom.eventChoices.innerHTML = `<div style="font-size:.85rem;color:var(--green)">已处理 ✓</div>`;
  }
}

function renderPlayed() {
  dom.playedCount.textContent = `${state.played.length}/${state.actionsPerWeek}`;
  dom.playedGrid.innerHTML = "";

  for (const cardId of state.played) {
    const card = CARDS[cardId];
    const el = document.createElement("div");
    el.className = "played-mini";
    const effs = Object.entries(card.effect)
      .filter(([k]) => !k.startsWith("_"))
      .slice(0, 3)
      .map(([k, v]) => `${v > 0 ? "+" : ""}${v} ${shortLabel(k)}`)
      .join(", ");
    el.innerHTML = `<div class="pm-name">${card.name}</div><div class="pm-effects">${effs}</div>`;
    dom.playedGrid.appendChild(el);
  }

  // Empty slots
  for (let i = state.played.length; i < state.actionsPerWeek; i++) {
    const el = document.createElement("div");
    el.className = "played-slot";
    el.textContent = `第 ${i + 1} 张`;
    dom.playedGrid.appendChild(el);
  }
}

function renderHand() {
  dom.handFan.innerHTML = "";
  const n = state.hand.length;
  const spread = Math.min(12, 60 / n);
  const startAngle = -(n - 1) * spread / 2;

  for (let i = 0; i < n; i++) {
    const cardId = state.hand[i];
    const card = CARDS[cardId];
    const angle = startAngle + i * spread;
    const yOffset = Math.abs(angle) * 0.4;

    const el = document.createElement("div");
    el.className = "game-card";
    el.setAttribute("data-type", card.type);
    el.style.transform = `rotate(${angle}deg) translateY(${yOffset}px)`;
    el.style.zIndex = i + 1;

    const realCost = getEffectiveCost(card);
    const canAfford = Object.entries(realCost).every(([k, v]) => {
      if (k.startsWith("_") || k === "reputation") return true;
      return (state[k] ?? 0) >= v;
    });
    const disabled = state.actionsLeft <= 0 || !canAfford || state.ended ||
                     state.pendingStudentEvent || state.pendingDraft;

    if (disabled) el.classList.add("disabled-card");

    el.innerHTML = renderCardInner(cardId);
    if (!disabled) {
      el.addEventListener("click", () => playCard(cardId));
    }
    dom.handFan.appendChild(el);
  }
}

function renderCardHTML(cardId) {
  const card = CARDS[cardId];
  return `<div class="game-card" data-type="${card.type}" style="margin:0 auto">${renderCardInner(cardId)}</div>`;
}

function renderCardInner(cardId) {
  const card = CARDS[cardId];
  const realCost = getEffectiveCost(card);
  const costs = Object.entries(realCost)
    .filter(([k]) => !k.startsWith("_"))
    .map(([k, v]) => `<span class="card-pill cost">${k === "reputation" ? "" : "-"}${v} ${shortLabel(k)}</span>`)
    .join("");
  const effects = Object.entries(card.effect)
    .filter(([k]) => !k.startsWith("_"))
    .slice(0, 4)
    .map(([k, v]) => `<span class="card-pill effect">${v > 0 ? "+" : ""}${v} ${shortLabel(k)}</span>`)
    .join("");

  return `
    <div class="card-type-badge">${card.type}</div>
    <div class="card-name">${card.name}</div>
    <div class="card-copy">${card.copy}</div>
    <div class="card-costs">${costs}</div>
    <div class="card-effects">${effects}</div>
  `;
}

function renderProject() {
  dom.projectTitle.textContent = state.project.title;
  dom.projectField.textContent = state.project.field;
  dom.progressVal.textContent = state.project.progress;
  dom.progressFill.style.width = `${Math.min(100, state.project.progress)}%`;
  dom.evidenceVal.textContent = state.project.evidence;
  dom.evidenceFill.style.width = `${Math.min(100, state.project.evidence)}%`;
}

function renderStudents() {
  const active = state.students.filter(s => !s.fired);
  dom.studentMood.textContent = active.length === 0
    ? (state.fullAI ? "🤖 全 AI 模式" : "无学生")
    : `${active.length} 人在岗`;

  dom.studentsList.innerHTML = "";

  if (state.fullAI && active.length === 0) {
    const el = document.createElement("div");
    el.className = "student-chip";
    el.innerHTML = `
      <span class="student-icon">🤖</span>
      <div class="student-info">
        <div class="student-name-line"><span class="student-sname">AI 全栈模式</span></div>
        <div class="student-trait">不坑机时，只坑 tokens。</div>
      </div>
    `;
    dom.studentsList.appendChild(el);
    return;
  }

  for (const s of active) {
    const trouble = s.troubleChance >= 0.3;
    const el = document.createElement("div");
    el.className = `student-chip ${trouble ? "trouble" : ""}`;
    const costStr = Object.entries(s.weeklyCost).map(([k,v]) => `-${v}${shortLabel(k)}`).join(" ");
    const outStr = Object.entries(s.weeklyOutput).filter(([,v]) => v !== 0).map(([k,v]) => `${v > 0 ? "+" : ""}${v}${shortLabel(k)}`).join(" ");
    el.innerHTML = `
      <span class="student-icon">${s.icon}</span>
      <div class="student-info">
        <div class="student-name-line">
          <span class="student-sname">${s.name}</span>
          <span class="student-output">${outStr}</span>
        </div>
        <div class="student-trait">${s.trait}: ${s.traitDesc}</div>
        <div style="font-size:.65rem;color:var(--text-muted)">每周消耗: ${costStr}</div>
      </div>
    `;
    dom.studentsList.appendChild(el);
  }
}

function renderDeckInfo() {
  dom.deckCounts.innerHTML = [
    { label: "Draw", value: state.drawPile.length },
    { label: "Discard", value: state.discardPile.length },
    { label: "Hand", value: state.hand.length },
    { label: "Rewards", value: state.rewardCards.length },
  ].map(d => `<span class="deck-pill">${d.label}:<strong>${d.value}</strong></span>`).join("");
}

function renderLog() {
  dom.logList.innerHTML = "";
  const recent = state.log.slice(-8).reverse();
  for (const item of recent) {
    const el = document.createElement("div");
    el.className = "log-item";
    el.innerHTML = `<span class="log-week">W${item.week}</span><span class="log-text">${item.text}</span>`;
    dom.logList.appendChild(el);
  }
}

/* ═══════════ JUICE ═══════════ */
function spawnPopup(key, val) {
  if (val === 0) return;
  const label = shortLabel(key);
  const sign = val > 0 ? "+" : "";
  const cls = (key === "risk" ? (val > 0 ? "bad" : "good") : (val > 0 ? "good" : "bad"));

  const el = document.createElement("div");
  el.className = `number-popup ${cls}`;
  el.textContent = `${sign}${val} ${label}`;

  // Random position near center
  const cx = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
  const cy = window.innerHeight / 2 + (Math.random() - 0.5) * 100;
  el.style.left = `${cx}px`;
  el.style.top = `${cy}px`;

  dom.popupLayer.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

function screenShake() {
  dom.shakeWrapper.classList.add("shaking");
  setTimeout(() => dom.shakeWrapper.classList.remove("shaking"), 300);
}

function toast(msg) {
  dom.toast.textContent = msg;
  dom.toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => dom.toast.classList.add("hidden"), 2200);
}

/* ═══════════ UTILITIES ═══════════ */
function shortLabel(key) {
  return { cash: "💰", tokens: "🎟️", compute: "⚡", morale: "❤️",
    reputation: "⭐", risk: "⚠️", progress: "📈", evidence: "🔬" }[key] || key;
}

function getDoctrine() {
  return DOCTRINES.find(d => d.id === state.doctrineId);
}

function normalizeState() {
  state.cash = clamp(state.cash, -20, 99);
  state.tokens = clamp(state.tokens, 0, 99);
  state.compute = clamp(state.compute, 0, 50);
  state.morale = clamp(state.morale, 0, 100);
  state.reputation = clamp(state.reputation, 0, 60);
  state.risk = clamp(state.risk, 0, 100);
  state.project.progress = clamp(state.project.progress, 0, 100);
  state.project.evidence = clamp(state.project.evidence, 0, 100);
}

function addLog(text) {
  state.log.push({ week: state.week, text });
}

function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function sample(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function deepCopy(v) { return JSON.parse(JSON.stringify(v)); }

function weightedSample(items) {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item.type;
  }
  return items[items.length - 1].type;
}

/* ═══════════ PERSISTENCE ═══════════ */
function saveState() {
  if (state && !state.ended) localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}
function loadSave() {
  try { const r = localStorage.getItem(SAVE_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
function clearSave() { localStorage.removeItem(SAVE_KEY); }
function loadMeta() {
  try {
    const r = localStorage.getItem(META_KEY);
    return r ? JSON.parse(r) : { runsPlayed: 0, bestScore: 0, bestTitle: "" };
  } catch { return { runsPlayed: 0, bestScore: 0, bestTitle: "" }; }
}
function saveMeta() { localStorage.setItem(META_KEY, JSON.stringify(meta)); }

function continueSave() {
  const save = loadSave();
  if (!save) return;
  state = save;
  dom.startScreen.classList.add("hidden");
  showGame();
  renderAll();
}

function wipeSave() {
  clearSave();
  dom.btnContinue.style.display = "none";
  dom.btnWipe.style.display = "none";
  toast("存档已清除");
}

function restartGame() {
  state = null;
  dom.endScreen.classList.add("hidden");
  hideGame();
  dom.startScreen.classList.remove("hidden");
  renderMeta();
}

async function copySummary() {
  if (!state?.summaryText) return;
  try {
    await navigator.clipboard.writeText(state.summaryText);
    toast("战报已复制！");
  } catch {
    toast("复制失败");
  }
}
