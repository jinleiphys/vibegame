const TOTAL_MONTHS = 36;
const START_FUNDS = 58;
const MAX_AP = 3;
const PAPER_GOAL = 3;

const MAP_ASSETS = {
  campus: "assets/map-campus-v2.png",
  conferenceMap: "assets/map-conference.png",
  journalMap: "assets/map-journal.png",
  fundingMap: "assets/map-funding.png",
  frontierMap: "assets/map-frontier.png",
};
const SPRITES = {
  hero: "assets/professor-sprite.png",
  linche: "assets/npc-linche.png",
  zhou: "assets/npc-zhou.png",
  rival: "assets/npc-rival.png",
  editor: "assets/npc-editor.png",
  reviewer: "assets/npc-reviewer.png",
  grantPanel: "assets/npc-grant-panel.png",
  bug: "assets/enemy-bug.png",
  hype: "assets/enemy-hype.png",
  theory: "assets/enemy-theory.png",
};
const MAP_ART = MAP_ASSETS.campus;
const art = {
  office: MAP_ART,
  library: MAP_ART,
  compute: MAP_ART,
  student: MAP_ART,
  conference: MAP_ART,
  journal: MAP_ART,
  funding: MAP_ART,
  frontier: MAP_ART,
  cafe: MAP_ART,
  data: MAP_ART,
};

const campusNodes = {
  office: {
    name: "办公室",
    icon: "⌂",
    x: 50,
    y: 24,
    color: "#213b60",
    art: art.office,
    desc: "安排项目、写论文和处理邮件。",
    actions: ["roadmap", "writePaper", "writeGrant", "triageMail"],
  },
  student: {
    name: "学生工位",
    icon: "研",
    x: 64,
    y: 58,
    color: "#2f8f6b",
    art: art.student,
    desc: "指导林澈，降低压力，提升训练。",
    actions: ["mentor", "protectStudentTime", "qualPrep", "assignBenchmark", "restTeam"],
  },
  library: {
    name: "图书馆",
    icon: "文",
    x: 18,
    y: 25,
    color: "#7256a4",
    art: art.library,
    desc: "读文献、补历史脉络、发现真正的问题。",
    actions: ["readLiterature", "mapControversy", "oldPaperTrail"],
  },
  compute: {
    name: "计算中心",
    icon: "算",
    x: 68,
    y: 24,
    color: "#2f7dbe",
    art: art.compute,
    desc: "跑 benchmark、修旧代码、做数值 sanity check。",
    actions: ["runBenchmark", "reproduceBaseline", "debugMethod", "openCode"],
  },
  data: {
    name: "数据港口",
    icon: "数",
    x: 88,
    y: 25,
    color: "#b56b2f",
    art: art.data,
    desc: "获取数据、清洗样本，换来证据和合作债务。",
    actions: ["acquireData", "negotiateDataUse", "cleanData"],
  },
  conference: {
    name: "国际会议",
    icon: "会",
    x: 10,
    y: 77,
    color: "#b84d4d",
    art: art.conference,
    desc: "报告、茶歇、观察竞争对手和寻找合作者。",
    actions: ["enterConference", "giveTalk", "defendPoster", "network", "scoutRival"],
  },
  journal: {
    name: "期刊社",
    icon: "刊",
    x: 34,
    y: 77,
    color: "#33495f",
    art: art.journal,
    desc: "投稿、返修、rebuttal 和处理审稿意见。",
    actions: ["enterJournal", "submitPaper", "rewriteAbstract", "rebuttal", "internalAudit"],
  },
  funding: {
    name: "基金委",
    icon: "金",
    x: 48,
    y: 80,
    color: "#c28a26",
    art: art.funding,
    desc: "听指南、写本子、答辩和补经费。",
    actions: ["enterFunding", "grantBriefing", "budgetDrill", "submitGrant"],
  },
  frontier: {
    name: "研究前沿",
    icon: "前",
    x: 86,
    y: 76,
    color: "#2f7dbe",
    art: art.frontier,
    desc: "争夺热点、复现荒地、基准高地和理论古城。",
    actions: ["enterFrontier", "exploreHotspot", "replicationSprint", "buildBenchmark", "theoryPush"],
  },
  cafe: {
    name: "咖啡厅",
    icon: "谈",
    x: 21,
    y: 51,
    color: "#7d5f35",
    art: art.cafe,
    desc: "非正式交流、修复士气、谈合作边界。",
    actions: ["coffeeTalk", "protectStudentTime", "collaborationDeal"],
  },
};

const MAPS = {
  campus: {
    name: "东海大学·中心广场",
    image: MAP_ASSETS.campus,
    position: "center",
    size: "cover",
    filter: "none",
    nodes: campusNodes,
    spawn: { x: 50, y: 48 },
  },
  conferenceMap: {
    name: "国际会议·分会场",
    image: MAP_ASSETS.conferenceMap,
    position: "center",
    size: "cover",
    filter: "saturate(1.03) contrast(1.02)",
    spawn: { x: 50, y: 78 },
    nodes: {
      stage: { name: "主报告厅", icon: "会", x: 25, y: 27, color: "#b84d4d", art: MAP_ASSETS.conferenceMap, desc: "面对全场同行回答尖锐问题。", actions: ["giveTalk"] },
      poster: { name: "海报区", icon: "报", x: 51, y: 28, color: "#2f8f6b", art: MAP_ASSETS.conferenceMap, desc: "学生、合作者和竞争组都在这里游荡。", actions: ["defendPoster", "network", "scoutRival"] },
      lounge: { name: "茶歇区", icon: "谈", x: 80, y: 28, color: "#7d5f35", art: MAP_ASSETS.conferenceMap, desc: "真正的合作经常从咖啡和闲聊开始。", actions: ["network", "collaborationDeal"] },
      registry: { name: "注册大厅", icon: "章", x: 50, y: 62, color: "#2f7dbe", art: MAP_ASSETS.conferenceMap, desc: "会议日程、会场路线和碰面机会都在这里汇合。", actions: ["scoutRival"] },
      exit: { name: "返回校园", icon: "↩", x: 50, y: 86, color: "#213b60", art: MAP_ASSETS.conferenceMap, desc: "回到东海大学中心广场。", actions: ["returnCampus"] },
    },
  },
  journalMap: {
    name: "期刊社·审稿走廊",
    image: MAP_ASSETS.journalMap,
    position: "center",
    size: "cover",
    filter: "saturate(0.98) contrast(1.04)",
    spawn: { x: 50, y: 80 },
    nodes: {
      archive: { name: "复现档案室", icon: "档", x: 20, y: 36, color: "#2f8f6b", art: MAP_ASSETS.journalMap, desc: "补齐原始记录、代码和 benchmark。", actions: ["internalAudit"] },
      editorDesk: { name: "编辑办公室", icon: "编", x: 48, y: 25, color: "#33495f", art: MAP_ASSETS.journalMap, desc: "编辑只关心论文是否达到期刊标准。", actions: ["submitPaper", "rebuttal"] },
      reviewerRoom: { name: "审稿密室", icon: "R2", x: 87, y: 25, color: "#b84d4d", art: MAP_ASSETS.journalMap, desc: "每一句 reviewer comment 都会变成可战斗的对象。", actions: ["rebuttal", "internalAudit"] },
      copyDesk: { name: "校样长桌", icon: "校", x: 67, y: 77, color: "#7256a4", art: MAP_ASSETS.journalMap, desc: "把结果写得更清楚，而不是更夸张。", actions: ["rewriteAbstract", "writePaper"] },
      exit: { name: "返回校园", icon: "↩", x: 50, y: 86, color: "#213b60", art: MAP_ASSETS.journalMap, desc: "回到东海大学中心广场。", actions: ["returnCampus"] },
    },
  },
  fundingMap: {
    name: "基金委·答辩大厅",
    image: MAP_ASSETS.fundingMap,
    position: "center",
    size: "cover",
    filter: "saturate(0.98) brightness(1.01)",
    spawn: { x: 50, y: 78 },
    nodes: {
      briefing: { name: "指南大厅", icon: "指", x: 27, y: 28, color: "#c28a26", art: MAP_ASSETS.fundingMap, desc: "今年指南真正想支持什么？", actions: ["grantBriefing"] },
      panel: { name: "答辩室", icon: "辩", x: 78, y: 28, color: "#b84d4d", art: MAP_ASSETS.fundingMap, desc: "把愿望讲成可执行项目。", actions: ["submitGrant"] },
      service: { name: "材料柜台", icon: "材", x: 25, y: 68, color: "#2f7dbe", art: MAP_ASSETS.fundingMap, desc: "预算、队伍、预研基础都要经得起追问。", actions: ["budgetDrill", "writeGrant"] },
      exit: { name: "返回校园", icon: "↩", x: 50, y: 86, color: "#213b60", art: MAP_ASSETS.fundingMap, desc: "回到东海大学中心广场。", actions: ["returnCampus"] },
    },
  },
  frontierMap: {
    name: "研究前沿·争议峡谷",
    image: MAP_ASSETS.frontierMap,
    position: "center",
    size: "cover",
    filter: "saturate(1.04) contrast(1.03)",
    spawn: { x: 49, y: 82 },
    nodes: {
      hotspot: { name: "热点矿区", icon: "热", x: 18, y: 24, color: "#b84d4d", art: MAP_ASSETS.frontierMap, desc: "这里能快速出成果，也最容易泡沫化。", actions: ["exploreHotspot"] },
      benchmarkPeak: { name: "基准高地", icon: "基", x: 50, y: 23, color: "#2f7dbe", art: MAP_ASSETS.frontierMap, desc: "定义 benchmark，影响后来者路线。", actions: ["buildBenchmark"] },
      theoryGate: { name: "理论古城", icon: "理", x: 82, y: 28, color: "#7256a4", art: MAP_ASSETS.frontierMap, desc: "推进核心理论，但不会自己变成图表。", actions: ["theoryPush"] },
      reproduceSwamp: { name: "复现沼泽", icon: "复", x: 22, y: 70, color: "#2f8f6b", art: MAP_ASSETS.frontierMap, desc: "每一步都要留下别人能走的脚印。", actions: ["replicationSprint", "internalAudit", "runBenchmark"] },
      debugCave: { name: "Debug 晶洞", icon: "算", x: 78, y: 73, color: "#33495f", art: MAP_ASSETS.frontierMap, desc: "旧代码、通道顺序和单位制会在这里显形。", actions: ["debugMethod", "openCode"] },
      exit: { name: "返回校园", icon: "↩", x: 49, y: 88, color: "#213b60", art: MAP_ASSETS.frontierMap, desc: "回到东海大学中心广场。", actions: ["returnCampus"] },
    },
  },
};

let nodes = campusNodes;

const NPCS = {
  campus: [
    { id: "linche", name: "林澈", icon: "林", x: 65, y: 65, color: "#2f8f6b", sprite: SPRITES.linche, battle: "studentCrisis" },
    { id: "zhou", name: "周教授", icon: "周", x: 50, y: 36, color: "#7256a4", sprite: SPRITES.zhou, battle: "groupMeeting" },
    { id: "adminLiu", name: "刘老师", icon: "行", x: 36, y: 64, color: "#2f7dbe", sprite: SPRITES.grantPanel, battle: "adminDeadline" },
    { id: "dataCurator", name: "数据管理员", icon: "数", x: 88, y: 36, color: "#b56b2f", sprite: SPRITES.editor, battle: "dataCurator" },
  ],
  conferenceMap: [
    { id: "rival", name: "顾明", icon: "竞", x: 56, y: 35, color: "#b84d4d", sprite: SPRITES.rival, battle: "rivalTalk" },
    { id: "chair", name: "分会主席", icon: "会", x: 25, y: 35, color: "#2f7dbe", sprite: SPRITES.grantPanel, battle: "conferenceQA" },
    { id: "maria", name: "Maria", icon: "合", x: 80, y: 42, color: "#2f8f6b", sprite: SPRITES.editor, battle: "collabBoundary" },
  ],
  journalMap: [
    { id: "editor", name: "编辑 Elena", icon: "编", x: 48, y: 33, color: "#33495f", sprite: SPRITES.editor, battle: "editorScreen" },
    { id: "reviewer2", name: "Reviewer 2", icon: "R2", x: 87, y: 35, color: "#b84d4d", sprite: SPRITES.reviewer, battle: "reviewer2" },
    { id: "copyeditor", name: "校稿编辑", icon: "校", x: 67, y: 70, color: "#7256a4", sprite: SPRITES.editor, battle: "copyeditMaze" },
  ],
  fundingMap: [
    { id: "grantPanel", name: "基金评审", icon: "审", x: 78, y: 36, color: "#c28a26", sprite: SPRITES.grantPanel, battle: "grantDefense" },
    { id: "financeOfficer", name: "财务老师", icon: "财", x: 25, y: 74, color: "#2f7dbe", sprite: SPRITES.grantPanel, battle: "budgetCut" },
  ],
  frontierMap: [
    { id: "hype", name: "热点泡沫", icon: "热", x: 18, y: 34, color: "#c28a26", sprite: SPRITES.hype, monster: true, battle: "hypeMonster" },
    { id: "paradigm", name: "旧范式守门人", icon: "旧", x: 50, y: 35, color: "#7256a4", sprite: SPRITES.zhou, monster: true, battle: "paradigmGate" },
    { id: "theory", name: "理论难关", icon: "理", x: 82, y: 38, color: "#7256a4", sprite: SPRITES.theory, monster: true, battle: "theoryGate" },
    { id: "replicator", name: "复现者", icon: "复", x: 22, y: 79, color: "#2f8f6b", sprite: SPRITES.reviewer, monster: true, battle: "replicationDemand" },
    { id: "bug", name: "旧代码黑箱", icon: "BUG", x: 78, y: 82, color: "#b84d4d", sprite: SPRITES.bug, monster: true, battle: "bugMonster" },
  ],
};

const BATTLES = {
  groupMeeting: { title: "组会质询战", enemy: "周教授", face: "周", sprite: SPRITES.zhou, hp: 100, reward: { trust: 8, method: 8, credibility: 3 }, intro: "周教授推了推眼镜：这个想法有意思，但现在还不是论文，是一个愿望。" },
  studentCrisis: { title: "学生低谷战", enemy: "林澈的焦虑", face: "压", sprite: SPRITES.linche, hp: 90, reward: { stress: -18, training: 10, trustStudent: 8 }, intro: "林澈说：老师，我不知道是我不行，还是这个题目本来就不行。" },
  adminDeadline: { title: "行政 Deadline 战", enemy: "刘老师的材料清单", face: "行", sprite: SPRITES.grantPanel, hp: 95, reward: { grantWriting: 8, morale: 4, risk: -1 }, intro: "刘老师把表格推过来：缺签字、缺预算说明、还缺一份伦理承诺。" },
  dataCurator: { title: "数据授权战", enemy: "数据管理员", face: "数", sprite: SPRITES.editor, hp: 105, reward: { evidence: 10, trust: 8, credibility: 3, collabDebt: -1 }, intro: "数据管理员说：可以给你，但你必须说明每一个样本怎么进入统计。" },
  conferenceQA: { title: "会议 Q&A 战", enemy: "尖锐提问", face: "?", sprite: SPRITES.grantPanel, hp: 105, reward: { reputation: 6, field: 6, writing: 5 }, intro: "报告刚结束，台下举起三只手。第一句就是：你的 uncertainty 是不是太乐观了？" },
  rivalTalk: { title: "抢发对峙战", enemy: "顾明的新锐组", face: "竞", sprite: SPRITES.rival, hp: 115, reward: { field: 8, reputation: 4, scooped: -1 }, intro: "顾明笑着说：我们也在做这个方向，可能下周就挂 arXiv。" },
  collabBoundary: { title: "合作边界战", enemy: "Maria 的合作提案", face: "合", sprite: SPRITES.editor, hp: 100, reward: { field: 7, credibility: 4, opportunity: 1, collabDebt: -1 }, intro: "Maria 说：我们可以共用数据，但作者顺序和代码归档必须今天讲清楚。" },
  editorScreen: { title: "编辑初筛战", enemy: "编辑 Elena", face: "编", sprite: SPRITES.editor, hp: 100, reward: { writing: 8, reputation: 2 }, intro: "编辑 Elena：你的故事有潜力，但我需要知道它为什么适合这本期刊。" },
  reviewer2: { title: "Reviewer 2 战", enemy: "Reviewer 2", face: "R2", sprite: SPRITES.reviewer, hp: 130, reward: { trust: 12, evidence: 8, credibility: 6 }, intro: "Reviewer 2 写道：convergence pattern is not convincing. 你深吸一口气。" },
  copyeditMaze: { title: "校样迷宫战", enemy: "句子里的夸张词", face: "校", sprite: SPRITES.editor, hp: 95, reward: { writing: 12, trust: 5, risk: -1 }, intro: "校稿编辑圈出一页红线：这里每一个 strongest、first、complete 都要付出证据。" },
  grantDefense: { title: "基金答辩战", enemy: "基金评审组", face: "审", sprite: SPRITES.grantPanel, hp: 125, reward: { grantFit: 14, grantWriting: 12, funds: 12 }, intro: "评审问：你这不是把三篇论文拼成一个项目吗？" },
  budgetCut: { title: "预算压缩战", enemy: "财务老师的红笔", face: "财", sprite: SPRITES.grantPanel, hp: 105, reward: { grantFit: 8, grantPrelim: 8, funds: 8 }, intro: "财务老师说：这个设备费讲不清楚，答辩时第一个被问。" },
  bugMonster: { title: "Debug 战", enemy: "旧代码黑箱", face: "BUG", sprite: SPRITES.bug, hp: 120, reward: { method: 14, trust: 6, risk: -1 }, intro: "旧代码黑箱从 log 文件里站了起来：channel ordering？你猜。" },
  hypeMonster: { title: "热点泡沫战", enemy: "热点泡沫", face: "热", sprite: SPRITES.hype, hp: 110, reward: { field: 10, credibility: 4, risk: -1 }, intro: "热点泡沫不断膨胀：快发！快讲大故事！别管复现！" },
  replicationDemand: { title: "外组复现战", enemy: "复现者的 issue", face: "复", sprite: SPRITES.reviewer, hp: 125, reward: { trust: 10, credibility: 8, field: 8 }, intro: "外组学生贴出 issue：你的脚本跑不出图 3。你必须把隐藏假设全部摊开。" },
  paradigmGate: { title: "旧范式守门战", enemy: "旧范式守门人", face: "旧", sprite: SPRITES.zhou, hp: 145, reward: { question: 14, method: 12, field: 10 }, intro: "守门人说：这条路二十年前就有人失败过。除非你能说清楚哪里不同。" },
  theoryGate: { title: "理论难关战", enemy: "理论难关", face: "理", sprite: SPRITES.theory, hp: 135, reward: { question: 10, method: 16, field: 8 }, intro: "理论难关挡在路口：没有边界条件，任何漂亮公式都是幻觉。" },
};

const PORTAL_ACTIONS = {
  conference: "enterConference",
  journal: "enterJournal",
  funding: "enterFunding",
  frontier: "enterFrontier",
  exit: "returnCampus",
};

const STORY_STAGES = [
  { title: "第一章：空办公室", desc: "把一个愿望拆成可检查的问题。", condition: () => true },
  { title: "第二章：第一条可信证据", desc: "结果开始经受住 benchmark。", scene: "firstSignal", condition: s => s.paper.evidence >= 45 && s.paper.trust >= 50 },
  { title: "第三章：公开审视", desc: "同行、竞争组和合作者都开始看见你。", scene: "publicScrutiny", condition: s => s.field >= 35 || s.reputation >= 35 },
  { title: "第四章：Reviewer 2 之门", desc: "论文必须扛过最难的外部质疑。", scene: "reviewerGate", condition: s => s.paper.status === "major" || s.papers >= 1 },
  { title: "第五章：共同体路线", desc: "从发论文转向建立标准和训练新人。", scene: "communityRoute", condition: s => s.papers >= 2 && s.field >= 55 && s.credibility >= 60 },
  { title: "终章：学派雏形", desc: "让别人能复现、延续和反驳你。", scene: "finalNight", condition: s => s.papers >= PAPER_GOAL },
];

const QUESTS = [
  {
    id: "firstEvidence",
    title: "主线：第一条可信证据",
    giver: "周教授",
    desc: "把证据推进到 45，并把可信推进到 55。",
    progress: s => `证据 ${s.paper.evidence}/45 · 可信 ${s.paper.trust}/55`,
    condition: s => s.paper.evidence >= 45 && s.paper.trust >= 55,
    rewardText: "信誉 +5，领域 +3",
    reward: s => {
      s.credibility += 5;
      s.field += 3;
    },
  },
  {
    id: "stabilizeLab",
    title: "支线：稳住林澈",
    giver: "林澈",
    desc: "把学生压力降到 45 以下，并让信任达到 65。",
    progress: s => `压力 ${s.student.stress}/45 · 信任 ${s.student.trust}/65`,
    condition: s => s.student.stress <= 45 && s.student.trust >= 65,
    rewardText: "士气 +7，声望 +2",
    reward: s => {
      s.morale += 7;
      s.reputation += 2;
    },
  },
  {
    id: "fundingThread",
    title: "支线：基金路线成形",
    giver: "刘老师",
    desc: "基金契合 65、写作 55、预研 35。",
    progress: s => `契合 ${s.grant.fit}/65 · 写作 ${s.grant.writing}/55 · 预研 ${s.grant.prelim}/35`,
    condition: s => s.grant.fit >= 65 && s.grant.writing >= 55 && s.grant.prelim >= 35,
    rewardText: "经费 +8，声望 +2",
    reward: s => {
      s.funds += 8;
      s.reputation += 2;
    },
  },
  {
    id: "rivalShield",
    minStage: 2,
    title: "支线：抢发防线",
    giver: "顾明",
    desc: "在抢先风险清零时，把问题和领域影响做起来。",
    progress: s => `抢先风险 ${s.scooped}/0 · 问题 ${s.paper.question}/55 · 领域 ${s.field}/35`,
    condition: s => s.scooped === 0 && s.paper.question >= 55 && s.field >= 35,
    rewardText: "写作 +6，声望 +3",
    reward: s => {
      addPaper({ writing: 6 });
      s.reputation += 3;
    },
  },
  {
    id: "reviewerShield",
    minStage: 3,
    title: "支线：复现护盾",
    giver: "Reviewer 2",
    desc: "风险清零，信誉 65，论文可信 65。",
    progress: s => `风险 ${s.risk}/0 · 信誉 ${s.credibility}/65 · 可信 ${s.paper.trust}/65`,
    condition: s => s.risk === 0 && s.credibility >= 65 && s.paper.trust >= 65,
    rewardText: "可信 +8，领域 +3",
    reward: s => {
      addPaper({ trust: 8 });
      s.field += 3;
    },
  },
  {
    id: "collabContract",
    minStage: 2,
    title: "支线：合作契约",
    giver: "Maria",
    desc: "清掉合作债，积累 2 个机会，并把领域影响推到 40。",
    progress: s => `合作债 ${s.collabDebt}/0 · 机会 ${s.opportunity}/2 · 领域 ${s.field}/40`,
    condition: s => s.collabDebt === 0 && s.opportunity >= 2 && s.field >= 40,
    rewardText: "信誉 +5，经费 +5",
    reward: s => {
      s.credibility += 5;
      s.funds += 5;
    },
  },
  {
    id: "firstPaper",
    minStage: 1,
    title: "主线：通过 Reviewer 2",
    giver: "编辑 Elena",
    desc: "发表第一篇论文，让外部质疑变成路线资产。",
    progress: s => `论文 ${s.papers}/1`,
    condition: s => s.papers >= 1,
    rewardText: "领域 +6，士气 +4",
    reward: s => {
      s.field += 6;
      s.morale += 4;
    },
  },
  {
    id: "benchmarkStandard",
    minStage: 4,
    title: "主线：基准高地",
    giver: "复现者",
    desc: "把领域影响推到 65，并把信誉推到 70。",
    progress: s => `领域 ${s.field}/65 · 信誉 ${s.credibility}/70`,
    condition: s => s.field >= 65 && s.credibility >= 70,
    rewardText: "预研 +10，声望 +5",
    reward: s => {
      s.grant.prelim += 10;
      s.reputation += 5;
    },
  },
  {
    id: "communityEndgame",
    minStage: 4,
    title: "终局：共同体雏形",
    giver: "学术共同体",
    desc: "发表 3 篇论文，信誉达到 70，学生压力低于 80。",
    progress: s => `论文 ${s.papers}/3 · 信誉 ${s.credibility}/70 · 压力 ${s.student.stress}/80`,
    condition: s => s.papers >= 3 && s.credibility >= 70 && s.student.stress < 80,
    rewardText: "声望 +10，士气 +10",
    reward: s => {
      s.reputation += 10;
      s.morale += 10;
    },
  },
];

const STORY_SCENES = {
  opening: {
    eyebrow: "主线剧情",
    title: "第一幕：空办公室",
    lines: [
      ["旁白", "东海大学给了你一间办公室、一个还没完全入门的博士生，以及三年时间。走廊尽头的公告栏写着：青年 PI 中期考核，论文、基金、学生培养、学术影响，缺一不可。"],
      ["周教授", "你可以追热点，也可以慢慢做基准。但三年后，委员会不会听理想，只看你能不能把一个方向立住。"],
      ["林澈", "老师，如果第一个结果就是错的呢？"],
      ["Prof. Lin", "那就先证明它错在哪里。我们不急着讲大故事，先找到别人也能检查的证据。"],
    ],
    choices: [
      { label: "先稳证据链", log: "剧情选择：你决定先守住复现和可信度。", effect: () => addPaper({ trust: 3 }) },
      { label: "先抢方向热度", log: "剧情选择：你决定先把方向推到台前，但风险也随之上升。", effect: s => { s.reputation += 2; s.risk += 1; } },
    ],
  },
  firstSignal: {
    eyebrow: "章节推进",
    title: "第二幕：图 3 对上了",
    lines: [
      ["林澈", "老师，deuteron、triton 和 He4 的基准终于在同一套 convention 下对上了。"],
      ["Prof. Lin", "很好。现在它不只是一个数值结果，而是一条别人可以复走的路。"],
      ["周教授", "别急着写成突破。先想清楚：你们到底解决了领域里的哪个误解？"],
    ],
    choices: [
      { label: "公开检查脚本", log: "剧情选择：你优先公开检查脚本。", effect: s => { spendFunds(2); s.credibility += 3; s.field += 2; } },
      { label: "先收束成论文", log: "剧情选择：你先把结果压成一篇清楚的论文。", effect: s => { addPaper({ writing: 5 }); s.risk += 1; } },
    ],
  },
  publicScrutiny: {
    eyebrow: "章节推进",
    title: "第三幕：海报前的沉默",
    lines: [
      ["旁白", "会议海报前突然安静下来。顾明站在左边，Maria 站在右边。一个代表竞争，一个代表合作。"],
      ["顾明", "我们也在做这个方向。如果你们不尽快发，解释权会先被别人拿走。"],
      ["Maria", "我可以共享数据，但我要知道你们怎么处理作者顺序、代码归档和后续解释权。"],
      ["Prof. Lin", "真正的路线不是一个人冲出来的，但边界不清的合作会在最后一刻反噬。"],
    ],
    choices: [
      { label: "先谈清合作边界", log: "剧情选择：你把合作协议写清楚。", effect: s => { s.collabDebt = Math.max(0, s.collabDebt - 1); s.opportunity += 1; s.credibility += 2; } },
      { label: "先抢预印本窗口", log: "剧情选择：你抢先把路线推上台面。", effect: s => { s.reputation += 5; s.scooped += 1; s.risk += 1; } },
    ],
  },
  reviewerGate: {
    eyebrow: "章节推进",
    title: "第四幕：Reviewer 2 的长信",
    lines: [
      ["编辑 Elena", "Reviewer 2 不讨厌你的工作。他只是看见了你最不想面对的薄弱处。"],
      ["Reviewer 2", "The convergence pattern is not convincing. The benchmark protocol must be reproducible."],
      ["林澈", "老师，我们是补完整复现，还是先把 rebuttal 写得更强？"],
      ["Prof. Lin", "审稿不是敌人。真正的敌人是我们自己也没检查清楚的地方。"],
    ],
    choices: [
      { label: "补完整复现", log: "剧情选择：你们回到复现档案室补全记录。", effect: s => { spendFunds(3); addPaper({ evidence: 4, trust: 6 }); s.credibility += 3; } },
      { label: "强势 rebuttal", log: "剧情选择：你先用叙述压住审稿意见。", effect: s => { addPaper({ writing: 7 }); s.reputation += 2; s.risk += 1; } },
    ],
  },
  communityRoute: {
    eyebrow: "章节推进",
    title: "第五幕：别人的工具",
    lines: [
      ["复现者", "我不是来引用你的。我是来跑你的脚本，看我的学生能不能照着做出同一张图。"],
      ["林澈", "以前我以为论文接收就是结束。现在好像才刚开始。"],
      ["Prof. Lin", "如果别人能复现、质疑、改进它，这才是路线。否则只是我们自己的成果。"],
    ],
    choices: [
      { label: "把 benchmark 做成标准", log: "剧情选择：你把 benchmark 整理成领域标准。", effect: s => { spendFunds(3); s.field += 6; s.credibility += 4; } },
      { label: "集中冲第三篇论文", log: "剧情选择：你压缩时间冲第三篇论文。", effect: s => { addPaper({ writing: 6 }); s.student.stress += 4; } },
    ],
  },
  finalNight: {
    eyebrow: "终章剧情",
    title: "答辩前夜",
    lines: [
      ["旁白", "三年最后一个夜晚，办公室灯还亮着。墙上不是论文列表，而是一张被划了又改的路线图。"],
      ["林澈", "老师，最开始我只想把程序跑通。现在我能看出一个结果是不是物理，还是旧代码的幻觉。"],
      ["Prof. Lin", "那就够了。明天他们会问论文、基金和影响，但我们真正要交出去的是一条别人能继续走的路。"],
    ],
    choices: [
      { label: "整理共同体路线", log: "剧情选择：你把最后答辩压成共同体路线。", effect: s => { s.morale += 5; s.credibility += 2; } },
    ],
  },
  conferenceFirst: {
    eyebrow: "地图剧情",
    title: "第一次进入国际会议",
    lines: [
      ["旁白", "会场灯光很亮，但真正的压力来自茶歇区。每一张名片后面都是潜在合作、竞争和误读。"],
      ["顾明", "Prof. Lin，听说你们也在做那个 benchmark。我们可能很快会有结果。"],
      ["Prof. Lin", "那就看谁能把边界讲清楚。"],
    ],
    choices: [{ label: "进入会场", log: "会议地图剧情已开启。", effect: s => { s.field += 1; } }],
  },
  journalFirst: {
    eyebrow: "地图剧情",
    title: "第一次进入期刊社",
    lines: [
      ["旁白", "审稿走廊比想象中安静。每一扇门后面都不是敌人，而是一种标准。"],
      ["编辑 Elena", "我不需要你告诉我这个工作很重要。我要看到为什么它可信、清楚、适合被发表。"],
    ],
    choices: [{ label: "进入审稿走廊", log: "期刊社剧情已开启。", effect: s => { addPaper({ writing: 1 }); } }],
  },
  fundingFirst: {
    eyebrow: "地图剧情",
    title: "第一次进入基金委",
    lines: [
      ["旁白", "答辩大厅里没有人反对理想，但每个人都在问同一个问题：这笔钱会换来什么可验证的进展？"],
      ["基金评审", "你不是来描述兴趣的。你是来承诺一条能执行的路线。"],
    ],
    choices: [{ label: "进入答辩大厅", log: "基金委剧情已开启。", effect: s => { s.grant.fit += 2; } }],
  },
  frontierFirst: {
    eyebrow: "地图剧情",
    title: "第一次进入研究前沿",
    lines: [
      ["旁白", "争议峡谷里没有路标。热点泡沫、旧代码黑箱、理论难关和旧范式守门人都在等你。"],
      ["理论难关", "如果你的边界条件站不住，你的图再漂亮也只是烟火。"],
    ],
    choices: [{ label: "进入争议峡谷", log: "研究前沿剧情已开启。", effect: s => { addPaper({ question: 1, method: 1 }); } }],
  },
  groupMeetingAfter: {
    eyebrow: "战斗后剧情",
    title: "组会之后",
    lines: [
      ["周教授", "你刚才赢的不是我，是那个想把愿望伪装成结果的冲动。"],
      ["Prof. Lin", "我会把问题写窄，把证据做厚。"],
    ],
    choices: [{ label: "回到路线图", log: "周教授把你拉回可验证问题。", effect: s => { addPaper({ question: 2 }); } }],
  },
  studentCrisisAfter: {
    eyebrow: "战斗后剧情",
    title: "林澈的夜晚",
    lines: [
      ["林澈", "我以为我只是太慢。现在我知道，是任务没有被拆到我能判断对错的程度。"],
      ["Prof. Lin", "以后每个任务都要有一个能失败得明白的检查点。"],
    ],
    choices: [{ label: "写下检查点", log: "林澈重新找回节奏。", effect: s => { s.student.trust += 3; s.morale += 2; } }],
  },
  rivalTalkAfter: {
    eyebrow: "战斗后剧情",
    title: "顾明的预印本",
    lines: [
      ["顾明", "我们会抢速度。你们如果要守可信，就要接受慢一点。"],
      ["Prof. Lin", "速度会决定谁先被看见，可信会决定谁留下来。"],
    ],
    choices: [{ label: "收紧 claim", log: "你决定不和竞争组比谁更夸张。", effect: s => { s.risk = Math.max(0, s.risk - 1); addPaper({ trust: 2 }); } }],
  },
  reviewer2After: {
    eyebrow: "战斗后剧情",
    title: "Reviewer 2 没有消失",
    lines: [
      ["Reviewer 2", "现在我相信你做了检查。但下一篇论文，我会问更难的问题。"],
      ["林澈", "这听起来不像胜利。"],
      ["Prof. Lin", "这就是胜利。标准被提高了，我们也被迫变强了。"],
    ],
    choices: [{ label: "接受更高标准", log: "Reviewer 2 变成了路线的一部分。", effect: s => { s.credibility += 3; } }],
  },
  grantDefenseAfter: {
    eyebrow: "战斗后剧情",
    title: "答辩室外",
    lines: [
      ["基金评审", "如果这笔钱给你，不是奖励过去，而是要求你把路线真正做出来。"],
      ["Prof. Lin", "我明白。基金不是安全感，是责任。"],
    ],
    choices: [{ label: "接下责任", log: "基金答辩后，团队路线更稳定。", effect: s => { s.morale += 3; } }],
  },
  paradigmGateAfter: {
    eyebrow: "战斗后剧情",
    title: "旧范式的裂缝",
    lines: [
      ["旧范式守门人", "你们不是第一个挑战这条路的人。"],
      ["Prof. Lin", "也不会是最后一个。区别是，这一次我们把失败路径也写出来。"],
    ],
    choices: [{ label: "公开失败路径", log: "旧范式第一次让出一点空间。", effect: s => { s.field += 4; s.credibility += 2; } }],
  },
};

const MAP_STORY_SCENES = {
  conferenceMap: "conferenceFirst",
  journalMap: "journalFirst",
  fundingMap: "fundingFirst",
  frontierMap: "frontierFirst",
};

const BATTLE_STORY_SCENES = {
  groupMeeting: "groupMeetingAfter",
  studentCrisis: "studentCrisisAfter",
  rivalTalk: "rivalTalkAfter",
  reviewer2: "reviewer2After",
  grantDefense: "grantDefenseAfter",
  paradigmGate: "paradigmGateAfter",
};

const actionDefs = {
  enterConference: {
    label: "进入会议地图",
    cost: 0,
    summary: "切换到国际会议分会场，有报告战和竞争组遭遇。",
    run: () => switchMap("conferenceMap"),
  },
  enterJournal: {
    label: "进入期刊社地图",
    cost: 0,
    summary: "切换到审稿走廊，和编辑、Reviewer 2 交锋。",
    run: () => switchMap("journalMap"),
  },
  enterFunding: {
    label: "进入基金委地图",
    cost: 0,
    summary: "切换到基金答辩大厅，准备项目答辩。",
    run: () => switchMap("fundingMap"),
  },
  enterFrontier: {
    label: "进入研究前沿地图",
    cost: 0,
    summary: "切换到争议峡谷，挑战热点、bug 和理论难关。",
    run: () => switchMap("frontierMap"),
  },
  returnCampus: {
    label: "返回校园主地图",
    cost: 0,
    summary: "回到东海大学中心广场。",
    run: () => switchMap("campus"),
  },
  roadmap: {
    label: "制定三年路线图",
    cost: 1,
    summary: "问题 +5，基金契合 +6，士气 -2。",
    run: () => {
      addPaper({ question: 5, writing: 2 });
      state.grant.fit += 6;
      state.morale -= 2;
      log("你把三年拆成论文、基金、学生训练和复现四条线。路线更清楚，压力也更真实。");
    },
  },
  readLiterature: {
    label: "读关键文献",
    cost: 1,
    summary: "问题 +12，可信 +4，学生压力 +2。",
    run: () => {
      addPaper({ question: 12, trust: 4 });
      state.student.stress += 2;
      state.grant.fit += 4;
      log("你在图书馆补上了一条被忽视的文献线，问题变清楚了。", "good");
    },
  },
  oldPaperTrail: {
    label: "追旧论文脚注",
    cost: 1,
    summary: "问题 +8，方法 +4，发现历史坑。",
    run: () => {
      addPaper({ question: 8, method: 4, trust: 3 });
      state.risk = Math.max(0, state.risk - 1);
      log("一篇 2007 年的旧文献解释了你们之前的符号混乱。", "good");
    },
  },
  mapControversy: {
    label: "画争议谱系",
    cost: 1,
    summary: "问题 +9，领域 +4，风险 -1。",
    run: () => {
      addPaper({ question: 9, trust: 2 });
      state.field += 4;
      state.risk = Math.max(0, state.risk - 1);
      log("你把二十年的争议画成一张谱系图，终于知道哪些坑是历史问题。", "good");
    },
  },
  runBenchmark: {
    label: "跑 deuteron/triton/He4 benchmark",
    cost: 1,
    summary: "证据 +12，可信 +8，花费 3 经费。",
    run: () => {
      spendFunds(3);
      addPaper({ evidence: 12, trust: 8, method: 3 });
      state.grant.prelim += 6;
      state.student.training += 4;
      log("基础 benchmark 对上了。旧代码从黑箱变成了可检查工具。", "good");
    },
  },
  reproduceBaseline: {
    label: "复现外组 baseline",
    cost: 1,
    summary: "证据 +8，可信 +8，花费 4，经常增加压力。",
    run: () => {
      spendFunds(4);
      addPaper({ evidence: 8, trust: 8, method: 3 });
      state.student.stress += 4;
      state.credibility += 2;
      log("你没有急着创新，而是先把外组 baseline 跑通。这个选择很慢，但很硬。", "good");
    },
  },
  debugMethod: {
    label: "修方法和旧代码",
    cost: 1,
    summary: "方法 +13，可信 +3，可能暴露风险。",
    run: () => {
      addPaper({ method: 13, trust: 3 });
      if (Math.random() < 0.26) {
        state.risk += 1;
        log("你发现旧代码里一个 channel ordering 疑点。风险 +1。", "warn");
      } else {
        log("方法链条清理了一遍，下一次审稿阻力会小一些。", "good");
      }
    },
  },
  openCode: {
    label: "整理开源仓库",
    cost: 1,
    summary: "领域 +8，信誉 +4，写作 +3。",
    run: () => {
      state.field += 8;
      state.credibility += 4;
      addPaper({ writing: 3, trust: 3 });
      log("你把 benchmark 仓库开源，社区开始复用你的检查表。", "good");
    },
  },
  writePaper: {
    label: "写论文主线",
    cost: 1,
    summary: "写作 +14，可信 -1，学生压力 +3。",
    run: () => {
      addPaper({ writing: 14, trust: -1 });
      state.student.stress += 3;
      log("你把散乱结果写成一个清晰故事，但 claim 需要控制。");
    },
  },
  writeGrant: {
    label: "写基金本子",
    cost: 1,
    summary: "基金写作 +16，声望 +1。",
    run: () => {
      state.grant.writing += 16;
      state.reputation += 1;
      log("基金本子的研究目标更像一个项目，而不是几篇论文的拼盘。", "good");
    },
  },
  triageMail: {
    label: "处理邮件和行政",
    cost: 1,
    summary: "士气 +4，压力 -4，可能发现机会。",
    run: () => {
      state.morale += 4;
      state.student.stress -= 4;
      if (Math.random() < 0.35) {
        state.opportunity += 1;
        log("你从邮件里发现一个 workshop 邀请。机会 +1。", "good");
      } else {
        log("你把一堆小事清掉了，团队终于知道下周该做什么。");
      }
    },
  },
  mentor: {
    label: "一对一指导林澈",
    cost: 1,
    summary: "训练 +8，压力 -10，可信 +4。",
    run: () => {
      state.student.training += 8;
      state.student.stress -= 10;
      state.student.trust += 8;
      addPaper({ trust: 4, method: 3 });
      log("你把问题拆成 benchmark、convention、observable 三块，林澈终于不再盲跑。", "good");
    },
  },
  assignBenchmark: {
    label: "给学生布置可验证任务",
    cost: 1,
    summary: "证据 +7，训练 +6，压力 +8。",
    run: () => {
      addPaper({ evidence: 7, trust: 3 });
      state.student.training += 6;
      state.student.stress += 8;
      log("林澈接下一个清楚的小任务：先让 deuteron 对上，再谈 He4。");
    },
  },
  protectStudentTime: {
    label: "保护学生整块时间",
    cost: 1,
    summary: "压力 -12，信任 +6，士气 +3。",
    run: () => {
      state.student.stress -= 12;
      state.student.trust += 6;
      state.morale += 3;
      state.grant.writing = Math.max(0, state.grant.writing - 2);
      log("你替林澈挡掉几个碎任务。他终于有一整天能只想一个问题。", "good");
    },
  },
  qualPrep: {
    label: "准备资格考试",
    cost: 1,
    summary: "训练 +10，信任 +4，压力 +5。",
    run: () => {
      state.student.training += 10;
      state.student.trust += 4;
      state.student.stress += 5;
      addPaper({ method: 2 });
      log("资格考试复习把基础概念补起来了，但短期压力明显上升。");
    },
  },
  restTeam: {
    label: "暂停一周修整",
    cost: 1,
    summary: "压力 -16，士气 +8，经费 -1。",
    run: () => {
      spendFunds(1);
      state.student.stress -= 16;
      state.morale += 8;
      state.student.trust += 3;
      log("你让团队停一下。进度慢了，但人还在。", "good");
    },
  },
  giveTalk: {
    label: "做分会报告",
    cost: 1,
    summary: "声望 +7，领域 +6，若证据弱会降信誉。",
    run: () => {
      const solid = state.paper.evidence + state.paper.trust > 95;
      state.reputation += solid ? 7 : 4;
      state.field += solid ? 6 : 3;
      if (!solid) {
        state.credibility -= 4;
        state.risk += 1;
        log("报告引来关注，但证据还不够硬。过度传播风险 +1。", "warn");
      } else {
        log("你的报告把 benchmark 和 claim 边界讲清楚了，同行愿意跟进。", "good");
      }
    },
  },
  defendPoster: {
    label: "站海报防守",
    cost: 1,
    summary: "写作 +6，领域 +6；证据弱会增加风险。",
    run: () => {
      const ready = state.paper.evidence + state.paper.trust > 95;
      addPaper({ writing: 6, trust: ready ? 3 : 0 });
      state.field += 6;
      if (!ready) {
        state.risk += 1;
        log("海报区人很多，但你的误差条还没撑住所有追问。风险 +1。", "warn");
      } else {
        log("海报区的追问帮你找到更好的叙述顺序。", "good");
      }
    },
  },
  network: {
    label: "茶歇找合作者",
    cost: 1,
    summary: "机会 +1，领域 +4，士气 +2。",
    run: () => {
      state.opportunity += 1;
      state.field += 4;
      state.morale += 2;
      log("一次茶歇换来一个真实合作者，而不是客套名片。", "good");
    },
  },
  scoutRival: {
    label: "观察竞争组进度",
    cost: 1,
    summary: "问题 +4，抢先风险下降。",
    run: () => {
      addPaper({ question: 4, writing: 2 });
      state.scooped = Math.max(0, state.scooped - 1);
      log("你发现竞争组还卡在数据外推，路线暂时安全。");
    },
  },
  acquireData: {
    label: "争取稀缺数据",
    cost: 1,
    summary: "证据 +15，花费 5，经常带来合作债务。",
    run: () => {
      spendFunds(5);
      addPaper({ evidence: 15 });
      state.field += 3;
      if (Math.random() < 0.45) {
        state.collabDebt += 1;
        log("数据拿到了，但合作者要求后续共享解释权。合作债 +1。", "warn");
      } else {
        log("数据港口给了你一批干净样本，证据链变硬了。", "good");
      }
    },
  },
  negotiateDataUse: {
    label: "谈数据使用协议",
    cost: 1,
    summary: "证据 +7，信誉 +3，合作债 -1。",
    run: () => {
      addPaper({ evidence: 7, trust: 3 });
      state.credibility += 3;
      state.collabDebt = Math.max(0, state.collabDebt - 1);
      log("数据使用边界写进协议，后面的争议少了一半。", "good");
    },
  },
  cleanData: {
    label: "清洗数据和误差条",
    cost: 1,
    summary: "证据 +8，可信 +9。",
    run: () => {
      addPaper({ evidence: 8, trust: 9 });
      state.credibility += 2;
      log("误差条不再漂亮得可疑，反而更可信了。", "good");
    },
  },
  submitPaper: {
    label: "投稿",
    cost: 1,
    summary: "根据论文质量触发接收、大修或拒稿。",
    available: () => state.paper.status !== "major" && state.paper.status !== "accepted",
    run: () => submitPaper(),
  },
  rebuttal: {
    label: "写 rebuttal",
    cost: 1,
    summary: "大修后可用，回应审稿人。",
    available: () => state.paper.status === "major",
    run: () => rebuttal(),
  },
  rewriteAbstract: {
    label: "重写摘要和 claim",
    cost: 1,
    summary: "写作 +10，可信 +5，风险 -1。",
    run: () => {
      addPaper({ writing: 10, trust: 5 });
      state.risk = Math.max(0, state.risk - 1);
      state.credibility += 1;
      log("你把最冒进的 claim 收紧，摘要反而更有力量。", "good");
    },
  },
  internalAudit: {
    label: "内部审计和复现记录",
    cost: 1,
    summary: "风险 -1，可信 +8，花费 3。",
    run: () => {
      spendFunds(3);
      state.risk = Math.max(0, state.risk - 1);
      addPaper({ trust: 8 });
      state.credibility += 4;
      log("你补齐原始记录和复现脚本，未来的自己会感谢现在的你。", "good");
    },
  },
  grantBriefing: {
    label: "听基金指南会",
    cost: 1,
    summary: "基金契合 +14，声望 +1。",
    run: () => {
      state.grant.fit += 14;
      state.reputation += 1;
      log("你终于知道今年指南真正想要什么，而不是照旧写老题目。", "good");
    },
  },
  budgetDrill: {
    label: "预算和预研演练",
    cost: 1,
    summary: "基金写作 +8，预研 +8，花费 2。",
    run: () => {
      spendFunds(2);
      state.grant.writing += 8;
      state.grant.prelim += 8;
      state.reputation += 1;
      log("预算表终于能解释每一笔钱为什么服务于核心问题。", "good");
    },
  },
  submitGrant: {
    label: "提交基金申请",
    cost: 1,
    summary: "根据契合、写作、预实验和声望判定。",
    available: () => !state.grant.won && !state.grant.submitted,
    run: () => submitGrant(),
  },
  exploreHotspot: {
    label: "探索热点矿区",
    cost: 1,
    summary: "问题 +6，声望 +4，风险 +1。",
    run: () => {
      addPaper({ question: 6, writing: 4 });
      state.reputation += 4;
      state.risk += 1;
      state.scooped += 1;
      log("热点很热，进度也快，但你已经听见抢发的脚步声。", "warn");
    },
  },
  replicationSprint: {
    label: "复现冲刺",
    cost: 1,
    summary: "风险 -1，证据 +7，可信 +7，花费 4。",
    run: () => {
      spendFunds(4);
      state.risk = Math.max(0, state.risk - 1);
      addPaper({ evidence: 7, trust: 7 });
      state.field += 3;
      log("你把复现步骤写到别人能照着走的程度。速度慢，但路线变稳。", "good");
    },
  },
  buildBenchmark: {
    label: "建设基准高地",
    cost: 1,
    summary: "领域 +12，可信 +8，写作 +4。",
    run: () => {
      state.field += 12;
      state.credibility += 5;
      addPaper({ trust: 8, writing: 4 });
      log("你不是只发一篇论文，而是在给领域铺路。", "good");
    },
  },
  theoryPush: {
    label: "推进理论古城",
    cost: 1,
    summary: "方法 +10，问题 +6，压力 +4。",
    run: () => {
      addPaper({ method: 10, question: 6 });
      state.student.stress += 4;
      state.grant.fit += 4;
      log("理论结构更漂亮了，但它不会自己变成图表。");
    },
  },
  coffeeTalk: {
    label: "咖啡厅非正式讨论",
    cost: 1,
    summary: "士气 +6，机会 +1，压力 -6。",
    run: () => {
      state.morale += 6;
      state.opportunity += 1;
      state.student.stress -= 6;
      log("没有幻灯片的讨论反而说到了关键处。", "good");
    },
  },
  collaborationDeal: {
    label: "谈清合作边界",
    cost: 1,
    summary: "合作债 -1，信誉 +4，领域 +3。",
    run: () => {
      state.collabDebt = Math.max(0, state.collabDebt - 1);
      state.credibility += 4;
      state.field += 3;
      log("你们把一作、数据、代码和后续方向写清楚了。合作少了很多隐患。", "good");
    },
  },
};

const events = [
  {
    month: 3,
    title: "第一封合作邮件",
    body: "海外合作者 Maria 发来邮件：她愿意共享一批数据，但希望你们先承诺复现协议和作者边界。",
    effect: () => {
      if (state.credibility >= 55 || state.opportunity > 0) {
        state.opportunity += 1;
        state.field += 2;
        log("合作邮件变成真实机会。机会 +1，领域 +2。", "good");
      } else {
        state.collabDebt += 1;
        log("你先答应了合作，却还没讲清边界。合作债 +1。", "warn");
      }
    },
  },
  {
    month: 6,
    title: "中期组会",
    body: "系里前辈听完你的报告后说：这个想法不错，但现在还不是论文，是一个愿望。",
    effect: () => {
      if (state.paper.question < 45) {
        state.reputation -= 2;
        log("中期组会暴露出选题还不够清楚。声望 -2。", "warn");
      } else {
        state.reputation += 2;
        state.credibility += 2;
        log("中期组会通过，前辈愿意继续给你看稿。", "good");
      }
    },
  },
  {
    month: 9,
    title: "匿名质疑",
    body: "论坛里有人质疑你的 preliminary result 只是在调参。这个问题不回应，会变成审稿中的硬伤。",
    effect: () => {
      if (state.paper.trust >= 58 && state.risk === 0) {
        state.credibility += 4;
        log("你用复现记录和消融表回应了质疑。信誉 +4。", "good");
      } else {
        state.risk += 1;
        state.credibility -= 4;
        log("匿名质疑击中了薄弱处。风险 +1，信誉 -4。", "warn");
      }
    },
  },
  {
    month: 12,
    title: "竞争组抢发",
    body: "南岭新锐组挂出一篇相似预印本。你必须决定是硬刚还是把 claim 收紧。",
    effect: () => {
      if (state.paper.trust >= 60) {
        state.field += 6;
        log("你的证据链更稳，竞争组反而帮你抬高了方向热度。", "good");
      } else {
        state.scooped += 2;
        state.risk += 1;
        log("竞争组抢发让你的路线变窄。抢先风险 +2，风险 +1。", "warn");
      }
    },
  },
  {
    month: 15,
    title: "数据共享协议",
    body: "数据方要求把后续解释权写进协议。处理不好，合作会在论文快投时爆炸。",
    effect: () => {
      if (state.collabDebt === 0 && state.credibility >= 58) {
        addPaper({ evidence: 8, trust: 4 });
        log("数据共享协议顺利签下，样本和记录一起进库。证据 +8，可信 +4。", "good");
      } else {
        state.collabDebt += 1;
        state.morale -= 4;
        log("合作边界没讲清楚，数据方开始拉扯署名和解释权。合作债 +1，士气 -4。", "warn");
      }
    },
  },
  {
    month: 18,
    title: "学生低谷",
    body: "林澈连续几周没有实质进展。他不是懒，而是不知道失败是不是自己的问题。",
    effect: () => {
      if (state.student.trust >= 65 && state.student.stress < 70) {
        state.student.training += 8;
        log("林澈挺过低谷，开始能独立拆问题。训练 +8。", "good");
      } else {
        state.student.stress += 16;
        state.morale -= 8;
        log("学生低谷扩大成组内气压问题。压力 +16，士气 -8。", "warn");
      }
    },
  },
  {
    month: 21,
    title: "学院年度考核",
    body: "学院开始看你的论文、基金、学生培养和外部影响。单点突破不再够用。",
    effect: () => {
      const balanced = state.paper.trust >= 60 && state.grant.fit >= 55 && state.student.stress < 78;
      if (balanced) {
        state.reputation += 4;
        state.morale += 4;
        log("年度考核认可了你的路线：慢，但可持续。声望 +4，士气 +4。", "good");
      } else {
        state.reputation -= 3;
        state.student.stress += 8;
        log("年度考核暴露出路线偏科。声望 -3，学生压力 +8。", "warn");
      }
    },
  },
  {
    month: 24,
    title: "基金结果",
    body: "基金委发来结果邮件。哪怕没中，评审意见也会改变后续路线。",
    effect: () => {
      if (state.grant.won) {
        state.reputation += 4;
        state.field += 4;
        log("基金已经到账，后续两年路线稳定。", "good");
      } else {
        state.grant.fit += 12;
        state.reputation -= 1;
        log("基金没中，但意见指出了真正的短板。契合 +12，声望 -1。", "warn");
      }
    },
  },
  {
    month: 27,
    title: "资格考试压力",
    body: "林澈要准备资格考试，同时论文还在推进。你要证明培养不是消耗学生。",
    effect: () => {
      if (state.student.training >= 55 && state.student.trust >= 65) {
        state.student.stress = Math.max(0, state.student.stress - 10);
        state.morale += 5;
        log("林澈顺利过关，组里第一次感觉这个方向真的能培养人。压力 -10，士气 +5。", "good");
      } else {
        state.student.stress += 14;
        state.morale -= 6;
        log("资格考试和项目压力叠在一起，林澈明显被透支。压力 +14，士气 -6。", "warn");
      }
    },
  },
  {
    month: 30,
    title: "复现追问",
    body: "外组学生在 GitHub issue 里追问一个 benchmark 细节。这个问题不处理，最终评审会看到。",
    effect: () => {
      if (state.credibility >= 70 && state.risk === 0) {
        state.field += 8;
        state.reputation += 2;
        log("外组复现成功，你的 benchmark 开始成为领域标准。", "good");
      } else {
        state.risk += 1;
        state.credibility -= 5;
        log("复现问题暴露出记录不完整。风险 +1，信誉 -5。", "warn");
      }
    },
  },
  {
    month: 33,
    title: "最后一次领域争议",
    body: "旧范式守门人公开质疑：你们只是把已知结论包装成新 benchmark。最终评审前必须扛住这一下。",
    effect: () => {
      if (state.field >= 65 && state.credibility >= 68) {
        state.reputation += 5;
        addPaper({ writing: 6 });
        log("争议反而让更多同行读懂你的路线。声望 +5，写作 +6。", "good");
      } else {
        state.risk += 1;
        state.reputation -= 4;
        log("守门人的质疑压住了最后冲刺。风险 +1，声望 -4。", "warn");
      }
    },
  },
];

let state;
let autoTimer = null;
let moving = false;
let moveLoopStarted = false;
let lastMoveTs = 0;
const moveKeys = {
  up: false,
  down: false,
  left: false,
  right: false,
};

function initialState() {
  return {
    month: 1,
    ap: MAX_AP,
    apMax: MAX_AP,
    funds: START_FUNDS,
    papers: 0,
    reputation: 14,
    credibility: 48,
    morale: 52,
    field: 5,
    currentMap: "campus",
    location: "office",
    selectedNode: "office",
    playerX: nodes.office.x,
    playerY: nodes.office.y,
    dialogOpen: false,
    menuOpen: false,
    battle: null,
    autoMode: "balanced",
    autoRun: false,
    ended: false,
    risk: 0,
    scooped: 0,
    collabDebt: 0,
    opportunity: 0,
    triggeredEvents: [],
    storyStage: 0,
    completedQuests: [],
    completedBattles: [],
    seenScenes: [],
    pendingScenes: [],
    paperIndex: 1,
    paper: {
      title: "被忽视边界条件下的新方法",
      question: 16,
      method: 10,
      evidence: 6,
      writing: 4,
      trust: 36,
      status: "draft",
      revisions: 0,
    },
    grant: {
      fit: 12,
      writing: 4,
      prelim: 6,
      submitted: false,
      won: false,
    },
    student: {
      training: 10,
      stress: 34,
      trust: 52,
    },
    logs: [],
  };
}

function clampAll() {
  for (const key of ["funds", "reputation", "credibility", "morale", "field"]) {
    state[key] = Math.max(0, Math.min(100, Math.round(state[key])));
  }
  for (const key of ["question", "method", "evidence", "writing", "trust"]) {
    state.paper[key] = Math.max(0, Math.min(100, Math.round(state.paper[key])));
  }
  for (const key of ["fit", "writing", "prelim"]) {
    state.grant[key] = Math.max(0, Math.min(100, Math.round(state.grant[key])));
  }
  for (const key of ["training", "stress", "trust"]) {
    state.student[key] = Math.max(0, Math.min(100, Math.round(state.student[key])));
  }
  state.risk = Math.max(0, Math.round(state.risk));
  state.scooped = Math.max(0, Math.round(state.scooped));
  state.collabDebt = Math.max(0, Math.round(state.collabDebt));
  state.opportunity = Math.max(0, Math.round(state.opportunity));
}

function switchMap(mapId) {
  const map = MAPS[mapId] || MAPS.campus;
  state.currentMap = mapId in MAPS ? mapId : "campus";
  nodes = map.nodes;
  const firstNode = Object.keys(nodes)[0];
  state.location = firstNode;
  state.selectedNode = firstNode;
  state.playerX = map.spawn.x;
  state.playerY = map.spawn.y;
  state.dialogOpen = false;
  state.menuOpen = false;
  resetMoveKeys();
  log(`进入地图：${map.name}`);
  render();
  if (MAP_STORY_SCENES[state.currentMap]) showStoryScene(MAP_STORY_SCENES[state.currentMap]);
}

function currentMapMeta() {
  return MAPS[state?.currentMap] || MAPS.campus;
}

function log(text, tone = "") {
  state.logs.unshift({ month: state.month, text, tone });
  state.logs = state.logs.slice(0, 80);
}

function spendFunds(n) {
  state.funds -= n;
  if (state.funds < 0) {
    state.reputation -= 2;
    state.morale -= 4;
    log("经费透支，行政系统开始发出难听的邮件。", "warn");
  }
}

function addPaper(delta) {
  for (const [key, value] of Object.entries(delta)) {
    state.paper[key] += value;
  }
}

function overlayVisible(id) {
  const el = document.getElementById(id);
  return !!el && !el.classList.contains("hidden");
}

function sceneSeen(id) {
  return (state.seenScenes || []).includes(id);
}

function queueStoryScene(id) {
  if (!state || !id || !STORY_SCENES[id] || sceneSeen(id)) return;
  if (!state.pendingScenes) state.pendingScenes = [];
  if (!state.pendingScenes.includes(id)) state.pendingScenes.push(id);
}

function canShowStoryScene() {
  return !overlayVisible("modal") && !overlayVisible("guideOverlay") && !overlayVisible("battleOverlay");
}

function showStoryScene(id) {
  const scene = STORY_SCENES[id];
  if (!scene || sceneSeen(id)) return false;
  if (!canShowStoryScene()) {
    queueStoryScene(id);
    return false;
  }
  if (!state.seenScenes) state.seenScenes = [];
  state.seenScenes.push(id);
  stopAutoRun();
  resetMoveKeys();
  document.getElementById("modalEyebrow").textContent = scene.eyebrow || "剧情";
  document.getElementById("modalTitle").textContent = scene.title;
  const body = document.getElementById("modalBody");
  body.innerHTML = `
    <div class="storyScene">
      ${scene.lines.map(([speaker, text]) => `
        <div class="storyLineItem">
          <b>${escapeHtml(speaker)}</b>
          <span>${escapeHtml(text)}</span>
        </div>
      `).join("")}
    </div>
  `;
  const box = document.getElementById("modalButtons");
  const choices = scene.choices && scene.choices.length ? scene.choices : [{ label: "继续" }];
  box.innerHTML = "";
  for (const item of choices) {
    const btn = document.createElement("button");
    btn.textContent = item.label;
    btn.addEventListener("click", () => {
      if (item.effect) item.effect(state);
      if (item.log) log(item.log, "good");
      clampAll();
      checkQuestProgress();
      closeModal();
    });
    box.appendChild(btn);
  }
  document.getElementById("modal").classList.remove("hidden");
  return true;
}

function flushStoryScenes() {
  if (!state || !state.pendingScenes || state.pendingScenes.length === 0 || !canShowStoryScene()) return;
  const id = state.pendingScenes.shift();
  showStoryScene(id);
}

function currentStoryStage() {
  return STORY_STAGES[Math.min(state.storyStage || 0, STORY_STAGES.length - 1)];
}

function advanceStoryStage() {
  let nextStage = state.storyStage || 0;
  for (let i = 0; i < STORY_STAGES.length; i += 1) {
    if (STORY_STAGES[i].condition(state)) nextStage = i;
  }
  if (nextStage > (state.storyStage || 0)) {
    state.storyStage = nextStage;
    const stage = currentStoryStage();
    log(`剧情推进：${stage.title}。${stage.desc}`, "good");
    toast(stage.title);
    if (stage.scene) showStoryScene(stage.scene);
  }
}

function questDone(id) {
  return (state.completedQuests || []).includes(id);
}

function battleCleared(id) {
  return (state.completedBattles || []).includes(id);
}

function questUnlocked(quest) {
  return questDone(quest.id) || !quest.minStage || (state.storyStage || 0) >= quest.minStage;
}

function completeQuest(quest) {
  if (questDone(quest.id)) return;
  if (!state.completedQuests) state.completedQuests = [];
  quest.reward(state);
  state.completedQuests.push(quest.id);
  log(`任务完成：${quest.title}。${quest.rewardText}。`, "good");
  toast(`任务完成：${quest.title}`);
}

function checkQuestProgress() {
  advanceStoryStage();
  for (const quest of QUESTS) {
    if (questUnlocked(quest) && !questDone(quest.id) && quest.condition(state)) {
      completeQuest(quest);
    }
  }
}

function paperScore() {
  const p = state.paper;
  return p.question * 0.9 + p.method + p.evidence * 1.2 + p.writing * 0.9 + p.trust * 1.2 + state.credibility * 0.35 + state.reputation * 0.25 - state.risk * 10 - state.scooped * 5;
}

function submitPaper() {
  const score = paperScore();
  if (score >= 365) {
    acceptPaper("接收");
  } else if (score >= 285) {
    state.paper.status = "major";
    state.paper.revisions += 1;
    addPaper({ trust: 5 });
    log("期刊给了大修：创新性够，但要求补 benchmark、收紧 claim。", "warn");
  } else {
    state.reputation = Math.max(0, state.reputation - 2);
    state.paper.writing = Math.max(0, state.paper.writing - 8);
    state.paper.trust += 4;
    log("投稿被拒。坏消息是没发， 好消息是问题被审稿人说清楚了。", "warn");
  }
}

function rebuttal() {
  addPaper({ writing: 10, evidence: 6, trust: 10 });
  state.credibility += 3;
  const score = paperScore() + 30;
  if (score >= 365 || state.paper.revisions >= 2) {
    acceptPaper("返修后接收");
  } else {
    state.paper.revisions += 1;
    log("rebuttal 有效，但 Reviewer 2 还要求一个对照表。", "warn");
  }
}

function acceptPaper(label) {
  state.papers += 1;
  state.reputation += 8;
  state.field += 10 + Math.floor(state.paper.trust / 12);
  state.credibility += Math.floor(state.paper.trust / 20);
  state.funds += 10;
  log(`${label}：第 ${state.papers} 篇论文发表，领域影响力上升。`, "good");
  startNextPaper();
}

function startNextPaper() {
  state.paperIndex += 1;
  const names = [
    "基准高地的复现协议",
    "争议峡谷中的统一解释",
    "面向开放数据的少体 benchmark",
    "理论古城的边界条件",
  ];
  const carry = Math.floor(state.field / 8);
  state.paper = {
    title: names[(state.paperIndex - 2) % names.length],
    question: 14 + carry,
    method: 10 + carry,
    evidence: 6,
    writing: 4,
    trust: 38 + Math.floor(state.credibility / 12),
    status: "draft",
    revisions: 0,
  };
}

function submitGrant() {
  state.grant.submitted = true;
  const score = state.grant.fit + state.grant.writing + state.grant.prelim + state.reputation * 0.8 + state.field * 0.5 + state.credibility * 0.35;
  if (score >= 205) {
    state.grant.won = true;
    state.funds += 38;
    state.reputation += 7;
    state.morale += 6;
    log("青年基金获批。钱不是全部，但它让团队终于能呼吸。", "good");
  } else {
    state.grant.submitted = false;
    state.reputation -= 2;
    state.grant.fit += 10;
    state.grant.writing += 8;
    log("基金没中。评审说目标太散，但意见有用。", "warn");
  }
}

function actionAvailable(id) {
  const def = actionDefs[id];
  if (!def) return false;
  return !def.available || def.available();
}

function runAction(id) {
  if (moving || state.ended) return;
  const def = actionDefs[id];
  if (!def || !actionAvailable(id)) return;
  if (state.ap < def.cost) {
    toast("本月行动点用完了，进入下个月。");
    endMonth();
    return;
  }
  state.ap -= def.cost;
  state.dialogOpen = false;
  def.run();
  afterStateChange();
}

function afterStateChange() {
  clampAll();
  checkTriggeredEvents();
  checkQuestProgress();
  clampAll();
  if (state.funds <= 0) {
    state.morale = Math.max(0, state.morale - 8);
    state.student.stress = Math.min(100, state.student.stress + 8);
  }
  if (state.student.stress >= 90) {
    state.morale -= 6;
    state.student.trust -= 6;
    log("林澈快撑不住了。继续压进度会牺牲长期培养。", "warn");
  }
  clampAll();
  render();
}

function monthlyUpkeep() {
  const baseCost = 3 + (state.month > 12 ? 1 : 0) + (state.papers > 1 ? 1 : 0) + (state.student.training > 55 ? 1 : 0);
  spendFunds(baseCost);
  state.student.stress += 4 + (state.risk > 0 ? 3 : 0) + (state.scooped > 0 ? 1 : 0);
  state.morale -= state.student.stress > 70 ? 5 : (state.student.stress > 55 ? 2 : 0);
  state.credibility -= state.risk > 1 ? 3 : (state.risk > 0 ? 1 : 0);
  if (state.opportunity > 0 && Math.random() < 0.35) {
    state.opportunity -= 1;
    state.reputation += 2;
    log("一个早先埋下的合作机会变成了邀请报告。", "good");
  }
  if (state.collabDebt > 0 && Math.random() < 0.35) {
    state.credibility -= 4;
    state.reputation -= 1;
    log("合作边界拖太久，合作者开始在解释权上施压。信誉 -4，声望 -1。", "warn");
  }
  if (state.scooped > 0 && Math.random() < 0.32) {
    state.scooped -= 1;
    state.field = Math.max(0, state.field - 4);
    state.paper.writing = Math.max(0, state.paper.writing - 3);
    log("竞争组抢先占了一小块解释权。领域影响 -4，写作 -3。", "warn");
  }
}

function endMonth() {
  if (state.ended) return;
  monthlyUpkeep();
  state.month += 1;
  if (state.month > TOTAL_MONTHS) {
    finalReview();
    return;
  }
  state.apMax = MAX_AP + (state.morale > 75 ? 1 : 0);
  state.ap = state.apMax;
  log("新月份开始。邮件、deadline 和学生状态一起回到桌面。");
  afterStateChange();
}

function checkTriggeredEvents() {
  for (const ev of events) {
    if (state.month >= ev.month && !state.triggeredEvents.includes(ev.month)) {
      state.triggeredEvents.push(ev.month);
      ev.effect();
      showModal("学术事件", ev.title, ev.body, [{ label: "继续", fn: closeModal }]);
      break;
    }
  }
}

function finalReview() {
  state.ended = true;
  stopAutoRun();
  const pass = state.papers >= PAPER_GOAL && state.credibility >= 60 && state.student.stress < 90;
  const excellent = pass && state.field >= 75 && state.credibility >= 75 && questDone("communityEndgame");
  let title;
  let body;
  if (excellent) {
    title = "共同体胜利";
    body = `三年结束。你发表 ${state.papers} 篇论文，拿下${state.grant.won ? "青年基金" : "稳定合作经费"}，还把一个 benchmark 做成了领域基础设施。\n\n最重要的是，林澈没有被项目压垮。他已经能独立判断一个结果是物理，还是旧代码的幻觉。\n\n结局评价：稳健学派的开端。`;
  } else if (pass) {
    title = "Tenure 通过";
    body = `三年结束。论文 ${state.papers}/${PAPER_GOAL}，声望 ${state.reputation}，信誉 ${state.credibility}，领域影响 ${state.field}。\n\n你通过了考核，但共同体还没有完全站起来。下一阶段的任务不是再多刷几篇，而是让别人能复现并延续你的路线。`;
  } else if (state.risk >= 3) {
    title = "泡沫结局";
    body = `三年结束。你冲得很快，但风险积累到 ${state.risk}。外组复现时发现若干 benchmark 对不上，委员会不愿赌。\n\n结局评价：声望来得快，信誉恢复慢。`;
  } else {
    title = "延期考核";
    body = `三年结束。论文 ${state.papers}/${PAPER_GOAL}，项目还没有形成足够清晰的影响。\n\n你没有彻底失败，但必须压缩方向，先把一条线做扎实。`;
  }
  render();
  showModal("最终评审", title, body, [{ label: "再来一局", fn: newGame }]);
}

function nodeDistance(a, b) {
  const na = nodes[a];
  const nb = nodes[b];
  const dx = na.x - nb.x;
  const dy = na.y - nb.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function distanceFromPlayer(id) {
  const node = nodes[id];
  const dx = node.x - state.playerX;
  const dy = node.y - state.playerY;
  return Math.sqrt(dx * dx + dy * dy);
}

function activeLocationId() {
  if (!state) return "office";
  let best = null;
  let bestDist = Infinity;
  for (const id of Object.keys(nodes)) {
    const dist = distanceFromPlayer(id);
    if (dist < bestDist) {
      bestDist = dist;
      best = id;
    }
  }
  return bestDist <= 5.8 ? best : null;
}

function currentNpcs() {
  return NPCS[state?.currentMap] || [];
}

function distanceFromNpc(npc) {
  const dx = npc.x - state.playerX;
  const dy = npc.y - state.playerY;
  return Math.sqrt(dx * dx + dy * dy);
}

function activeNpc() {
  if (!state) return null;
  let best = null;
  let bestDist = Infinity;
  for (const npc of currentNpcs()) {
    const dist = distanceFromNpc(npc);
    if (dist < bestDist) {
      bestDist = dist;
      best = npc;
    }
  }
  return bestDist <= 5.8 ? best : null;
}

function displayLocationId() {
  return activeLocationId() || state.selectedNode || state.location || "office";
}

function syncLocationFromPlayer() {
  const active = activeLocationId();
  if (active) {
    state.location = active;
    state.selectedNode = active;
  }
  return active;
}

function portalActionForLocation(locId) {
  if (!locId || !nodes[locId]) return null;
  const action = PORTAL_ACTIONS[locId];
  if (!action || !nodes[locId].actions.includes(action)) return null;
  return action;
}

function usePortal(locId) {
  const action = portalActionForLocation(locId);
  if (!action || !actionAvailable(action)) return false;
  state.location = locId;
  state.selectedNode = locId;
  state.dialogOpen = false;
  state.menuOpen = false;
  runAction(action);
  return true;
}

function navigateTo(id, cb) {
  if (!nodes[id] && state.currentMap !== "campus") switchMap("campus");
  if (!nodes[id] || moving || state.ended) return;
  const fromX = state.playerX;
  const fromY = state.playerY;
  if (Math.abs(fromX - nodes[id].x) < 0.4 && Math.abs(fromY - nodes[id].y) < 0.4) {
    state.selectedNode = id;
    state.location = id;
    render();
    if (cb) cb();
    return;
  }
  const to = nodes[id];
  const line = document.getElementById("routeLine");
  const board = document.getElementById("mapBoard").getBoundingClientRect();
  const x1 = (fromX / 100) * board.width;
  const y1 = (fromY / 100) * board.height;
  const x2 = (to.x / 100) * board.width;
  const y2 = (to.y / 100) * board.height;
  const length = Math.hypot(x2 - x1, y2 - y1);
  const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  line.style.left = `${x1}px`;
  line.style.top = `${y1}px`;
  line.style.width = `${length}px`;
  line.style.transform = `rotate(${angle}deg)`;
  line.classList.add("show");
  moving = true;
  state.selectedNode = id;
  state.playerX = to.x;
  state.playerY = to.y;
  state.location = id;
  render();
  setTimeout(() => {
    moving = false;
    line.classList.remove("show");
    render();
    if (cb) cb();
  }, 650);
}

function autoModeLabel() {
  return {
    balanced: "均衡",
    paper: "冲论文",
    grant: "保经费",
    safe: "低风险",
    student: "带学生",
  }[state.autoMode] || "均衡";
}

function getAutoPlan() {
  if (state.ended) return { target: state.location, action: null, text: "游戏已结束。" };
  if (state.ap <= 0) return { target: state.location, action: "endMonth", text: "行动点用完，进入下个月。" };

  const mode = state.autoMode;
  const p = state.paper;
  const grantNeed = !state.grant.won && !state.grant.submitted && (state.funds < 30 || mode === "grant" || state.month >= 12);

  if ((mode === "safe" || state.risk > 0) && state.risk > 0) {
    return { target: "journal", action: "internalAudit", text: "先去期刊社做内部审计，清掉撤稿风险。" };
  }
  if ((mode === "student" || state.student.stress > 76) && state.student.stress > 58) {
    return { target: "student", action: state.student.stress > 78 ? "restTeam" : "mentor", text: "学生压力偏高，先回工位指导或休整。" };
  }
  if (p.status === "major") {
    return { target: "journal", action: "rebuttal", text: "论文在大修，优先去期刊社写 rebuttal。" };
  }
  if (p.question >= 62 && p.method >= 62 && p.evidence >= 65 && p.writing >= 62 && p.trust >= 64) {
    return { target: "journal", action: "submitPaper", text: "论文已达到投稿阈值，去期刊社投稿。" };
  }
  if (grantNeed) {
    if (state.grant.fit < 65) return { target: "funding", action: "grantBriefing", text: "基金契合度不足，先去基金委听指南。" };
    if (state.grant.writing < 70) return { target: "office", action: "writeGrant", text: "基金现金流重要，回办公室写本子。" };
    if (state.grant.prelim < 42) return { target: "funding", action: "budgetDrill", text: "基金还缺预研和预算演练，先去基金委补材料。" };
    return { target: "funding", action: "submitGrant", text: "基金材料基本够了，提交申请。" };
  }
  if (p.question < 62) return { target: "library", action: p.question < 40 ? "readLiterature" : "mapControversy", text: "问题还不够清楚，去图书馆补文献和争议谱系。" };
  if (p.method < 62) return { target: "compute", action: p.method < 48 ? "debugMethod" : "reproduceBaseline", text: "方法链条薄弱，去计算中心修旧代码和 baseline。" };
  if (p.evidence < 65) {
    if (state.opportunity > 0 || mode === "paper") return { target: "data", action: "acquireData", text: "证据不足，去数据港口争取关键样本。" };
    return { target: "compute", action: "runBenchmark", text: "证据不足，先跑可复现 benchmark。" };
  }
  if (p.trust < 66) return { target: "frontier", action: "replicationSprint", text: "可信度还不够，去研究前沿做复现冲刺。" };
  if (p.writing < 62) return { target: "journal", action: "rewriteAbstract", text: "结果已经有了，去期刊社收紧摘要和 claim。" };
  if (state.field < 55 && mode !== "safe") return { target: "conference", action: "defendPoster", text: "需要领域影响力，去会议海报区防守。" };
  if (state.collabDebt > 0) return { target: "cafe", action: "collaborationDeal", text: "合作债需要谈清楚，去咖啡厅收口。" };
  return { target: "frontier", action: "buildBenchmark", text: "没有紧急问题，继续巩固研究版图。" };
}

function executeAutoStep() {
  if (moving || state.ended) return;
  const plan = getAutoPlan();
  log(`自动导航：${autoModeLabel()}策略，${plan.text}`);
  if (plan.action === "endMonth") {
    endMonth();
    return;
  }
  navigateTo(plan.target, () => runAction(plan.action));
}

function isBlockingOverlayOpen() {
  const modal = document.getElementById("modal");
  const guide = document.getElementById("guideOverlay");
  const battle = document.getElementById("battleOverlay");
  return (modal && !modal.classList.contains("hidden")) ||
    (guide && !guide.classList.contains("hidden")) ||
    (battle && !battle.classList.contains("hidden"));
}

function recommendedLocalAction(locId) {
  if (!locId || !nodes[locId]) return null;
  const available = nodes[locId].actions.filter(actionAvailable);
  if (available.length === 0) return null;
  const plan = getAutoPlan();
  if (plan.target === locId && available.includes(plan.action)) return plan.action;
  return available[0];
}

function interactAtCurrentLocation() {
  if (state.ended || moving) return;
  const npc = activeNpc();
  if (npc) {
    if (battleCleared(npc.battle)) {
      showModal("后续对话", npc.name, "这段冲突已经解决。新的压力来自别处，继续探索地图。", [{ label: "继续", fn: closeModal }]);
    } else {
      interactWithNpc(npc);
    }
    return;
  }
  const locId = activeLocationId();
  if (!locId) {
    toast("先走近一个地点，再按 Enter 互动。");
    return;
  }
  if (usePortal(locId)) return;
  if (state.dialogOpen) {
    const action = recommendedLocalAction(locId);
    if (action) runAction(action);
    return;
  }
  if (!recommendedLocalAction(locId)) {
    toast("这个地点现在没有可执行行动。");
    return;
  }
  state.location = locId;
  state.selectedNode = locId;
  state.dialogOpen = true;
  state.menuOpen = false;
  render();
}

function interactWithNpc(npc) {
  state.dialogOpen = false;
  state.menuOpen = false;
  const battle = BATTLES[npc.battle];
  if (!battle) {
    showModal("对话", npc.name, "他点点头，但现在没有新的事件。", [{ label: "继续", fn: closeModal }]);
    return;
  }
  if (battleCleared(npc.battle)) {
    showModal("后续对话", npc.name, `你已经处理过「${battle.title}」。现在可以继续跑图，或者去别的地图找新的冲突。`, [{ label: "继续", fn: closeModal }]);
    return;
  }
  startBattle(npc.battle);
}

function startBattle(id) {
  const def = BATTLES[id];
  if (!def) return;
  if (battleCleared(id)) {
    toast("这个遭遇已经解决过了。");
    return;
  }
  if (state.ap < 1) {
    toast("本月行动点用完了，进入下个月。");
    endMonth();
    return;
  }
  state.ap -= 1;
  stopAutoRun();
  resetMoveKeys();
  state.battle = {
    id,
    heroHp: 100,
    enemyHp: def.hp,
    enemyMax: def.hp,
    log: def.intro,
  };
  render();
  renderBattle();
  document.getElementById("battleOverlay").classList.remove("hidden");
}

function battleMove(kind) {
  const b = state.battle;
  const def = b && BATTLES[b.id];
  if (!b || !def) return;
  const p = state.paper;
  let damage = 0;
  let self = 0;
  let line = "";
  if (kind === "evidence") {
    damage = 16 + Math.floor((p.evidence + p.trust) / 14);
    line = `你打出「关键证据」。对方论点 -${damage}。`;
  } else if (kind === "logic") {
    damage = 14 + Math.floor((p.question + p.method) / 13);
    line = `你重构逻辑链。对方论点 -${damage}。`;
  } else if (kind === "limit") {
    damage = 10 + Math.floor(p.trust / 12);
    self = -10;
    state.credibility += 1;
    line = `你主动承认限制，信任上升。对方论点 -${damage}，你恢复 10。`;
  } else {
    damage = 24 + Math.floor(state.reputation / 8);
    self = 9;
    state.risk += 1;
    line = `你强行扩大 claim，短期很有气势。对方论点 -${damage}，但风险 +1。`;
  }
  b.enemyHp = Math.max(0, b.enemyHp - damage);
  b.heroHp = Math.max(0, Math.min(100, b.heroHp - self));
  if (b.enemyHp <= 0) {
    winBattle(def, line);
    return;
  }
  const counter = Math.max(5, 13 + Math.floor(Math.random() * 14) + Math.max(0, state.risk * 3) + Math.floor(state.scooped * 1.5) - Math.floor(state.credibility / 24));
  b.heroHp = Math.max(0, b.heroHp - counter);
  b.log = `${line}\n${def.enemy} 反击：尖锐质疑造成 ${counter} 压力。`;
  if (b.heroHp <= 0) {
    loseBattle(def);
    return;
  }
  renderBattle();
}

function applyBattleReward(reward = {}) {
  addPaper({
    question: reward.question || 0,
    method: reward.method || 0,
    evidence: reward.evidence || 0,
    writing: reward.writing || 0,
    trust: reward.trust || 0,
  });
  state.reputation += reward.reputation || 0;
  state.field += reward.field || 0;
  state.credibility += reward.credibility || 0;
  state.morale += reward.morale || 0;
  state.funds += reward.funds || 0;
  state.risk = Math.max(0, state.risk + (reward.risk || 0));
  state.scooped = Math.max(0, state.scooped + (reward.scooped || 0));
  state.collabDebt = Math.max(0, state.collabDebt + (reward.collabDebt || 0));
  state.opportunity = Math.max(0, state.opportunity + (reward.opportunity || 0));
  state.grant.fit += reward.grantFit || 0;
  state.grant.writing += reward.grantWriting || 0;
  state.grant.prelim += reward.grantPrelim || 0;
  state.student.stress += reward.stress || 0;
  state.student.training += reward.training || 0;
  state.student.trust += reward.trustStudent || 0;
}

function winBattle(def, line) {
  const id = state.battle && state.battle.id;
  const storyScene = BATTLE_STORY_SCENES[id];
  applyBattleReward(def.reward);
  if (id && !battleCleared(id)) {
    if (!state.completedBattles) state.completedBattles = [];
    state.completedBattles.push(id);
  }
  log(`战斗胜利：${def.title}`, "good");
  state.battle.log = `${line}\n胜利！你赢下了「${def.enemy}」。`;
  renderBattle();
  setTimeout(() => {
    document.getElementById("battleOverlay").classList.add("hidden");
    state.battle = null;
    afterStateChange();
    if (storyScene) showStoryScene(storyScene);
  }, 900);
}

function loseBattle(def) {
  state.reputation = Math.max(0, state.reputation - 3);
  state.student.stress += 9;
  state.morale -= 4;
  state.risk += 1;
  log(`战斗失利：${def.title}`, "warn");
  state.battle.log = `你暂时败下阵来。声望 -3，学生压力 +9，士气 -4，风险 +1。`;
  renderBattle();
  setTimeout(() => {
    document.getElementById("battleOverlay").classList.add("hidden");
    state.battle = null;
    afterStateChange();
  }, 1100);
}

function retreatBattle() {
  const b = state.battle;
  const def = b && BATTLES[b.id];
  if (!b || !def) return;
  state.student.stress += 5;
  state.credibility -= 2;
  state.risk += 1;
  log(`撤退：${def.title}`, "warn");
  document.getElementById("battleOverlay").classList.add("hidden");
  state.battle = null;
  afterStateChange();
}

function renderBattle() {
  const b = state.battle;
  if (!b) return;
  const def = BATTLES[b.id];
  const heroFace = document.getElementById("heroFace");
  const enemyFace = document.getElementById("enemyFace");
  document.getElementById("battleTitle").textContent = def.title;
  document.getElementById("enemyName").textContent = def.enemy;
  if (heroFace) {
    heroFace.textContent = "";
    heroFace.style.backgroundImage = `url("${SPRITES.hero}")`;
  }
  if (enemyFace) {
    enemyFace.classList.toggle("spriteFace", !!def.sprite);
    enemyFace.textContent = def.sprite ? "" : def.face;
    enemyFace.style.backgroundImage = def.sprite ? `url("${def.sprite}")` : "";
  }
  document.getElementById("heroHpText").textContent = `${b.heroHp}/100`;
  document.getElementById("enemyHpText").textContent = `${b.enemyHp}/${b.enemyMax}`;
  document.getElementById("heroHpBar").style.width = `${b.heroHp}%`;
  document.getElementById("enemyHpBar").style.width = `${Math.max(0, b.enemyHp / b.enemyMax * 100)}%`;
  document.getElementById("battleLog").textContent = b.log;
  document.getElementById("battleActions").innerHTML = `
    <button onclick="battleMove('evidence')">关键证据</button>
    <button onclick="battleMove('logic')">逻辑重构</button>
    <button onclick="battleMove('limit')">承认限制</button>
    <button onclick="battleMove('hype')">强行扩大 claim</button>
    <button onclick="retreatBattle()">撤退</button>
  `;
}

function closeInteraction() {
  state.dialogOpen = false;
  render();
}

function toggleMenu(force) {
  if (!state || state.ended) return;
  state.menuOpen = typeof force === "boolean" ? force : !state.menuOpen;
  if (state.menuOpen) state.dialogOpen = false;
  render();
}

function toggleAutoRun() {
  if (state.ended) return;
  if (state.autoRun) {
    stopAutoRun();
    render();
    return;
  }
  state.autoRun = true;
  render();
  autoTimer = setInterval(() => {
    if (moving || isBlockingOverlayOpen()) return;
    if (!state.autoRun || state.ended) {
      stopAutoRun();
      return;
    }
    executeAutoStep();
  }, 980);
}

function stopAutoRun() {
  if (!state) return;
  state.autoRun = false;
  if (autoTimer) clearInterval(autoTimer);
  autoTimer = null;
}

function showModal(eyebrow, title, body, buttons, img) {
  stopAutoRun();
  document.getElementById("modalEyebrow").textContent = eyebrow;
  document.getElementById("modalTitle").textContent = title;
  const modalBody = document.getElementById("modalBody");
  modalBody.textContent = body;
  const box = document.getElementById("modalButtons");
  box.innerHTML = "";
  for (const item of buttons) {
    const btn = document.createElement("button");
    btn.textContent = item.label;
    btn.addEventListener("click", item.fn);
    box.appendChild(btn);
  }
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
  render();
  setTimeout(flushStoryScenes, 60);
}

function toast(text) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1800);
}

function renderNodes() {
  const active = activeLocationId();
  const layer = document.getElementById("nodeLayer");
  layer.innerHTML = Object.entries(nodes).map(([id, node]) => `
    <button class="mapNode ${portalActionForLocation(id) ? "portal" : ""} ${id === "exit" ? "exit" : ""} ${id === active ? "active" : ""} ${id === state.selectedNode ? "target" : ""}"
      style="left:${node.x}%;top:${node.y}%;--node-color:${node.color}"
      data-node="${id}">
      <span class="nodeIcon">${node.icon}</span><b>${node.name}</b>${portalActionForLocation(id) ? `<em>${id === "exit" ? "返回" : "进入"}</em>` : ""}
      <p>${node.desc}</p>
    </button>
  `).join("");
  layer.querySelectorAll(".mapNode").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.node;
      navigateTo(id, portalActionForLocation(id) ? () => usePortal(id) : undefined);
    });
  });
}

function renderNpcs() {
  const layer = document.getElementById("npcLayer");
  if (!layer) return;
  const active = activeNpc();
  layer.innerHTML = currentNpcs().map(npc => `
    <button class="npcPawn ${npc.sprite ? "sprite" : ""} ${npc.monster ? "monster" : ""} ${battleCleared(npc.battle) ? "cleared" : ""} ${active && active.id === npc.id ? "active" : ""}"
      style="left:${npc.x}%;top:${npc.y}%;--npc-color:${npc.color};${npc.sprite ? `--npc-sprite:url('${npc.sprite}')` : ""}"
      data-npc="${npc.id}">
      <span>${npc.sprite ? "" : npc.icon}</span><b>${npc.name}</b>
    </button>
  `).join("");
  layer.querySelectorAll(".npcPawn").forEach(btn => {
    btn.addEventListener("click", () => {
      const npc = currentNpcs().find(x => x.id === btn.dataset.npc);
      if (!npc) return;
      state.playerX = npc.x;
      state.playerY = npc.y + 2.4;
      render();
      setTimeout(() => interactWithNpc(npc), 80);
    });
  });
}

function renderActions() {
  const active = activeLocationId();
  const hud = document.getElementById("actionHud");
  const speaker = document.getElementById("dialogSpeaker");
  const dialogText = document.getElementById("dialogText");
  const list = document.getElementById("actionList");
  if (!active || !state.dialogOpen) {
    if (hud) hud.classList.add("hidden");
    list.innerHTML = "";
    return;
  }
  const loc = nodes[active];
  if (hud) hud.classList.remove("hidden");
  if (speaker) speaker.textContent = loc.name;
  if (dialogText) dialogText.textContent = `${loc.desc} 你要做什么？`;
  list.innerHTML = loc.actions.map(id => {
    const def = actionDefs[id];
    const available = actionAvailable(id);
    return `
      <div class="actionItem">
        <div class="actionTop">
          <div><b>${def.label}</b><span class="effectLine">${def.summary}</span></div>
          <span>${def.cost} AP</span>
        </div>
        <button data-action="${id}" ${available && state.ap >= def.cost && !state.ended ? "" : "disabled"}>执行</button>
      </div>
    `;
  }).join("") + `
    <div class="actionItem">
      <div class="actionTop"><div><b>离开</b><span class="effectLine">继续在地图上探索。</span></div><span>Esc</span></div>
      <button data-close-dialog>返回地图</button>
    </div>`;
  list.querySelectorAll("button[data-action]").forEach(btn => {
    btn.addEventListener("click", () => runAction(btn.dataset.action));
  });
  const closeBtn = list.querySelector("button[data-close-dialog]");
  if (closeBtn) closeBtn.addEventListener("click", closeInteraction);
}

function setBar(key, value) {
  document.getElementById(`bar${key}`).style.width = `${Math.max(0, Math.min(100, value))}%`;
  document.getElementById(`val${key}`).textContent = Math.round(value);
}

function renderQuests() {
  const story = currentStoryStage();
  const storyEl = document.getElementById("storyText");
  const questList = document.getElementById("questList");
  if (storyEl) storyEl.textContent = `${story.title}：${story.desc}`;
  if (!questList) return;
  const visible = QUESTS.filter(questUnlocked);
  questList.innerHTML = visible.map(quest => {
    const done = questDone(quest.id);
    return `
      <div class="questItem ${done ? "done" : ""}">
        <div><b>${escapeHtml(quest.title)}</b><span>${escapeHtml(quest.giver)}</span></div>
        <p>${escapeHtml(quest.desc)}</p>
        <em>${done ? "完成" : escapeHtml(quest.progress(state))}</em>
      </div>
    `;
  }).join("");
}

function render() {
  clampAll();
  nodes = currentMapMeta().nodes;
  syncLocationFromPlayer();
  const active = activeLocationId();
  const npc = activeNpc();
  const displayId = displayLocationId();
  const loc = nodes[displayId];
  const pawn = document.getElementById("playerPawn");
  const board = document.getElementById("mapBoard");
  const map = currentMapMeta();
  if (board) {
    board.style.setProperty("--map-image", `url("${map.image || MAP_ASSETS.campus}")`);
    board.style.setProperty("--map-position", map.position);
    board.style.setProperty("--map-size", map.size);
    board.style.setProperty("--map-filter", map.filter || "none");
  }
  pawn.style.left = `${state.playerX}%`;
  pawn.style.top = `${state.playerY}%`;

  document.getElementById("monthText").textContent = `${Math.min(state.month, TOTAL_MONTHS)}/${TOTAL_MONTHS}`;
  document.getElementById("apText").textContent = `${state.ap}/${state.apMax}`;
  document.getElementById("fundText").textContent = state.funds;
  document.getElementById("paperText").textContent = `${state.papers}/${PAPER_GOAL}`;
  document.getElementById("repText").textContent = state.reputation;
  document.getElementById("credText").textContent = state.credibility;
  document.getElementById("fieldText").textContent = state.field;
  const battle = npc && BATTLES[npc.battle];
  const portalAction = active && portalActionForLocation(active);
  document.getElementById("currentPlace").textContent = npc ? npc.name : (active ? loc.name : "学术路上");
  document.getElementById("placeTitle").textContent = npc ? `遭遇：${npc.name}` : (portalAction ? `入口：${loc.name}` : (active ? loc.name : `前往：${loc.name}`));
  document.getElementById("placeDesc").textContent = npc
    ? (battleCleared(npc.battle) ? `「${battle ? battle.title : "对话"}」已经解决。按 Enter 继续对话。` : `按 Enter 消耗 1 AP 进入「${battle ? battle.title : "对话"}」。`)
    : (portalAction ? `按 Enter 直接${portalAction === "returnCampus" ? "返回校园" : "进入这张地图"}；也可以点击入口自动传送。` : (active ? loc.desc : "继续移动到地点附近后可以互动。"));
  const placeHud = document.getElementById("placeHud");
  if (placeHud) placeHud.classList.toggle("hidden", !!state.dialogOpen);
  document.getElementById("menuPanel").classList.toggle("hidden", !state.menuOpen);
  document.getElementById("navigatorHud").classList.toggle("hidden", !state.menuOpen);
  document.getElementById("logHud").classList.toggle("hidden", !state.menuOpen);
  const placeArt = document.getElementById("placeArt");
  if (placeArt) placeArt.src = loc.art;

  document.getElementById("paperTitle").textContent = `第 ${state.paperIndex} 篇论文：${state.paper.title}`;
  document.getElementById("paperState").textContent = state.paper.status === "major" ? "大修中" : "推进中";
  setBar("Question", state.paper.question);
  setBar("Method", state.paper.method);
  setBar("Evidence", state.paper.evidence);
  setBar("Writing", state.paper.writing);
  setBar("Trust", state.paper.trust);

  document.getElementById("studentText").textContent =
    `训练 ${state.student.training} · 压力 ${state.student.stress} · 信任 ${state.student.trust}`;
  renderQuests();

  const plan = getAutoPlan();
  document.getElementById("navPlan").textContent = `${autoModeLabel()}策略：${plan.text}`;
  document.getElementById("autoRunBtn").textContent = state.autoRun ? "停止自动" : "自动推进";
  document.getElementById("autoMode").value = state.autoMode;

  renderNodes();
  renderNpcs();
  renderActions();
  document.getElementById("logList").innerHTML = state.logs.slice(0, 18).map(item =>
    `<div class="logLine ${item.tone}">M${item.month}: ${escapeHtml(item.text)}</div>`
  ).join("");
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]));
}

function setMoveKey(code, value) {
  const map = {
    ArrowLeft: "left",
    KeyA: "left",
    ArrowRight: "right",
    KeyD: "right",
    ArrowUp: "up",
    KeyW: "up",
    ArrowDown: "down",
    KeyS: "down",
  };
  const key = map[code];
  if (!key) return false;
  moveKeys[key] = value;
  return true;
}

function handleKeyDown(e) {
  if (isBlockingOverlayOpen()) return;
  if (e.code === "Escape") {
    e.preventDefault();
    if (state.dialogOpen) closeInteraction();
    else if (state.menuOpen) toggleMenu(false);
    return;
  }
  if (setMoveKey(e.code, true)) {
    e.preventDefault();
    stopAutoRun();
    state.dialogOpen = false;
  } else if (e.code === "Enter") {
    e.preventDefault();
    interactAtCurrentLocation();
  } else if (e.code === "Space") {
    e.preventDefault();
    executeAutoStep();
  } else if (e.code === "KeyM") {
    e.preventDefault();
    toggleMenu();
  }
}

function handleKeyUp(e) {
  if (setMoveKey(e.code, false)) e.preventDefault();
}

function startMovementLoop() {
  if (moveLoopStarted) return;
  moveLoopStarted = true;
  requestAnimationFrame(moveFrame);
}

function moveFrame(ts) {
  if (!lastMoveTs) lastMoveTs = ts;
  const dt = Math.min(0.05, (ts - lastMoveTs) / 1000);
  lastMoveTs = ts;

  const anyMove = moveKeys.up || moveKeys.down || moveKeys.left || moveKeys.right;
  const pawn = document.getElementById("playerPawn");
  if (state && !state.ended && anyMove && !moving && !isBlockingOverlayOpen()) {
    let dx = 0;
    let dy = 0;
    if (moveKeys.left) dx -= 1;
    if (moveKeys.right) dx += 1;
    if (moveKeys.up) dy -= 1;
    if (moveKeys.down) dy += 1;
    const len = Math.hypot(dx, dy) || 1;
    const speed = 24;
    state.playerX = Math.max(6, Math.min(94, state.playerX + (dx / len) * speed * dt));
    state.playerY = Math.max(9, Math.min(91, state.playerY + (dy / len) * speed * dt));
    const active = syncLocationFromPlayer();
    if (!active) state.selectedNode = nearestMapNodeToPlayer();
    if (pawn) pawn.classList.add("walking");
    render();
  } else if (pawn) {
    pawn.classList.remove("walking");
  }
  requestAnimationFrame(moveFrame);
}

function resetMoveKeys() {
  moveKeys.up = false;
  moveKeys.down = false;
  moveKeys.left = false;
  moveKeys.right = false;
}

function nearestMapNodeToPlayer() {
  let best = "office";
  let bestDist = Infinity;
  for (const id of Object.keys(nodes)) {
    const dist = distanceFromPlayer(id);
    if (dist < bestDist) {
      best = id;
      bestDist = dist;
    }
  }
  return best;
}

function newGame() {
  stopAutoRun();
  resetMoveKeys();
  const guide = document.getElementById("guideOverlay");
  const guideHidden = guide && guide.classList.contains("hidden");
  nodes = campusNodes;
  state = initialState();
  log("剧情开始：东海大学给了你一个办公室、一名博士生和三年时间。");
  log("目标：三年内发表 3 篇可信论文，稳住学生、经费和复现信誉。");
  closeModal();
  render();
  if (guideHidden) showStoryScene("opening");
}

document.getElementById("centerBtn").addEventListener("click", () => navigateTo("office"));
document.getElementById("newGameBtn").addEventListener("click", newGame);
document.getElementById("menuBtn").addEventListener("click", () => toggleMenu());
document.getElementById("autoStepBtn").addEventListener("click", executeAutoStep);
document.getElementById("autoRunBtn").addEventListener("click", toggleAutoRun);
document.getElementById("startGuideBtn").addEventListener("click", () => {
  document.getElementById("guideOverlay").classList.add("hidden");
  resetMoveKeys();
  state.playerX = nodes.office.x;
  state.playerY = nodes.office.y;
  state.location = "office";
  state.selectedNode = "office";
  render();
  showStoryScene("opening");
});
document.getElementById("autoMode").addEventListener("change", e => {
  state.autoMode = e.target.value;
  render();
});
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);
window.addEventListener("blur", resetMoveKeys);

newGame();
startMovementLoop();
