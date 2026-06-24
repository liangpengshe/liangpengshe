// 10 篇 AI 电商变现 + AI 自媒体引流/变现 SOP 数据
// 每篇：slug, title, cover, tags, time, summary, category, painPoints, tools, steps, expectedResults

export type SOPStep = {
  title: string
  detail: string
  tools: string[]
  duration: string
  output: string
}

export type SOP = {
  slug: string
  title: string
  cover: string
  tags: string
  time: string
  summary: string
  category: 'ai-ecommerce' | 'ai-media'
  difficulty: '入门' | '进阶' | '高阶'
  painPoints: string[]
  tools: { name: string; url?: string; use: string }[]
  steps: SOPStep[]
  expectedResults: { metric: string; value: string }[]
  revenueModel: string
  warnings: string[]
}

const img = (prompt: string) =>
  `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=landscape_16_9`

export const sops: SOP[] = [
  // ===== AI 电商变现 =====
  {
    slug: 'ai-tiktok-shop',
    title: 'AI 选品 + TikTok Shop 跨境带货 7 日启动 SOP',
    cover: img('TikTok shop mobile ecommerce AI product selection dashboard neon purple gradient futuristic'),
    tags: '高阶玩法',
    time: '7 天',
    difficulty: '进阶',
    summary: '从 0 起步，用 AI 选品、数据监控、AI 翻译/详情页生成、AI 客服 4 步把 TikTok 美区小店做到首单。',
    category: 'ai-ecommerce',
    painPoints: [
      '不会英语小语种，跨境商品文案难写',
      '选品靠感觉、压货滞销、ROI 算不清',
      '客服 24h 倒时差，人工成本高',
      '不知道哪条视频能爆，缺乏数据反馈',
    ],
    tools: [
      { name: 'Kalodata / FastMoss', use: 'TikTok 爆品数据监控' },
      { name: 'GPT-4o / Claude', use: '选品分析、多语种文案' },
      { name: 'Midjourney v6.1', use: 'AI 商品主图、模特、场景图' },
      { name: 'Heygen / D-ID', use: 'AI 数字人口播视频' },
      { name: 'Shopify + Plug in USD', use: '落地页与支付' },
      { name: 'ManyChat + GPT', use: 'AI 智能客服自动回复' },
      { name: 'Capcut 剪映国际版', use: '短视频剪辑、字幕、配音' },
    ],
    steps: [
      {
        title: 'Step 1 - AI 数据选品（前 2 天）',
        detail: '用 Kalodata 导出近 30 天 GMV Top 500 爆品 CSV，按「客单价 $20-50、近 7 天销量 +20%、竞争品 < 50、评论 < 100」四个维度筛 30 个候选。喂给 GPT 写选品分析表，剔除侵权词、敏感品类。',
        tools: ['Kalodata', 'GPT-4o', 'Google Trends'],
        duration: '4-6 小时',
        output: '20 个通过初筛的候选 SKU + 1 份《选品对比表》',
      },
      {
        title: 'Step 2 - AI 出图 + 详情页（第 3-4 天）',
        detail: '用 Midjourney 生成 6 张白底主图、3 张场景图、3 张尺寸图，喂回 GPT 写美/英/西三语种详情页 A+ Content。落地页用 Shopify 主题 Dawn，集成 Plug in USD 收单。',
        tools: ['Midjourney', 'GPT-4o', 'Shopify'],
        duration: '8-10 小时',
        output: '1 套 6+3+3 主图 + 3 语种详情页 + Shopify 落地页',
      },
      {
        title: 'Step 3 - 数字人投流 + AI 客服（第 5-7 天）',
        detail: '用 Heygen 把详情页口播生成 30 条 30s 短视频，配 5 条原创真人出镜做 A/B 测。每天上传 5 条并开 Spark Ads 投流。同时挂 ManyChat 自动回复，常见问答让 GPT 生成 50 条话术库。',
        tools: ['Heygen', 'TikTok Ads Manager', 'ManyChat', 'GPT-4o'],
        duration: '每天 3 小时',
        output: '30 条素材 + 出单即用客服机器人',
      },
    ],
    expectedResults: [
      { metric: '启动到首单', value: '3-7 天' },
      { metric: '单条素材成本', value: '$0（AI 生成）' },
      { metric: '客服人力节省', value: '80%' },
      { metric: '首月 GMV', value: '$1,000 - $5,000' },
    ],
    revenueModel: '商品差价（建议毛利 60%+）+ 联盟分销佣金',
    warnings: [
      'TikTok 美区需美国主体，可先用个人 SSN 走小店 + 后期转公司',
      '侵权是红线，Midjourney 生成后用 TinEye 反查',
      '客单价低于 $15 的品慎选，物流吃掉利润',
    ],
  },
  {
    slug: 'ai-shopify-listing',
    title: 'AI 一键生成 Shopify 多语种详情页 SOP',
    cover: img('Shopify product page AI multi language translation dashboard emerald gradient modern UI'),
    tags: '新手友好',
    time: '3 天',
    difficulty: '入门',
    summary: '1 个英文详情页，AI 自动扩成 8 种语言、3 个版本主图，落地独立站转化率提升 40%。',
    category: 'ai-ecommerce',
    painPoints: [
      '独立站只支持英语，丢 70% 非英语市场',
      '人工翻译贵、机翻质量差、SEO 收录差',
      '同一商品要拍 5 套主图，人力爆表',
      '不同地区用户偏好差异大，详情页不会本地化',
    ],
    tools: [
      { name: 'ChatGPT-4o', use: '多语种文案改写、SEO meta' },
      { name: 'DeepL Write', use: '德/法/日/西本地化润色' },
      { name: 'Midjourney / Flux', use: '本地模特/场景主图' },
      { name: 'Shopify Markets', use: '多币种、多语言切换' },
      { name: 'Vitals / Loox', use: '评论聚合、UGC 展示' },
    ],
    steps: [
      {
        title: 'Step 1 - 主源英文详情页梳理（4 小时）',
        detail: '把现有英文详情页拆成 5 个模块：标题、5 个 Bullet Points、A+ Banner、长描述、FAQ。用 GPT 改写为 1 份「源文案表」，明确每个模块的卖点关键词。',
        tools: ['ChatGPT-4o', 'Google Docs'],
        duration: '4 小时',
        output: '1 份结构化源文案（5 模块）',
      },
      {
        title: 'Step 2 - 多语种本地化（8 小时）',
        detail: '把源文案喂给 GPT：「请以 [目标国家] 母语 native speaker 视角改写，符合当地审美和文化，避免直译」。再用 DeepL Write 二次润色。8 语种一次性产出。',
        tools: ['ChatGPT-4o', 'DeepL Write'],
        duration: '8 小时',
        output: '8 语种 × 5 模块 = 40 段文案 + meta',
      },
      {
        title: 'Step 3 - 主图本地化 + 部署（6 小时）',
        detail: 'Midjourney 生成「不同肤色模特 / 不同家庭场景 / 不同节日元素」三套主图，配对应语种文字。Shopify Markets 启用，按 IP 自动切语种 + 货币。',
        tools: ['Midjourney', 'Shopify Markets', 'Canva'],
        duration: '6 小时',
        output: '3 套本地化主图 + 多语种独立站',
      },
    ],
    expectedResults: [
      { metric: '翻译成本', value: '从 $200/语种 → $0' },
      { metric: '非英语市场转化', value: '+40%' },
      { metric: '详情页生产速度', value: '1 → 8 语种/天' },
      { metric: 'SEO 收录', value: '8 语种国家站收录' },
    ],
    revenueModel: '独立站直接售卖 + 广告联盟',
    warnings: [
      '医疗/电子类商品需本地认证，避免用 AI 翻译合规文本',
      '日语/阿拉伯语 RTL 排版需要单独测试',
      '本地模特图涉及肖像权，建议用 Flux / Midjourney 合成',
    ],
  },
  {
    slug: 'ai-private-traffic',
    title: '私域 AI 智能客服 + 复购召回 SOP',
    cover: img('private traffic AI customer service WeChat automation workflow pink gradient dashboard'),
    tags: '进阶玩法',
    time: '5 天',
    difficulty: '进阶',
    summary: '用 AI 把加微 → 首聊 → 标签 → 二次触达 → 复购全链路打通，私域转化率提升 3 倍。',
    category: 'ai-ecommerce',
    painPoints: [
      '加微后发消息石沉大海、沉默率高',
      '客服 1v1 回复效率低、夜间转化浪费',
      '客户标签混乱、推品不精准',
      '复购靠运气、缺少系统化触达',
    ],
    tools: [
      { name: '企微 SCRM（微伴/尘锋/微盛）', use: '客户标签、群发、SOP' },
      { name: 'GPT-4o / Coze / Dify', use: 'AI 对话引擎' },
      { name: 'n8n / Make', use: '自动化工作流' },
      { name: 'Supabase', use: '客户行为日志存储' },
    ],
    steps: [
      {
        title: 'Step 1 - 用户分层 + 话术库（第 1 天）',
        detail: '梳理 8 大客户场景（新客首聊 / 询价未购 / 已购待发货 / 收货求好评 / 售后 / 复购唤醒 / 流失召回 / VIP 维护），每个场景写 3-5 条话术喂给 GPT，统一品牌口吻。',
        tools: ['ChatGPT-4o', '飞书多维表格'],
        duration: '6 小时',
        output: '8 场景 × 5 话术 = 40 条种子话术',
      },
      {
        title: 'Step 2 - AI 客服机器人接入（第 2-3 天）',
        detail: '企微 SCRM 接入 GPT API 或 Dify Chatflow。配置触发器：客户发消息 → AI 自动回复；客户沉默 24h → 触发唤醒 SOP；客户发订单截图 → AI 自动查询物流。',
        tools: ['Dify', '企微 SCRM', 'Webhook'],
        duration: '1-2 天',
        output: '7×24 智能客服上线',
      },
      {
        title: 'Step 3 - 复购召回自动化（第 4-5 天）',
        detail: '用 n8n 搭建：收货后第 7 天 → 好评邀请；第 30 天 → 关联推荐；第 60 天 → 限时优惠；第 90 天 → 流失挽回。每条消息由 GPT 基于用户标签个性化生成。',
        tools: ['n8n', 'ChatGPT-4o', '企微 SCRM'],
        duration: '1 天',
        output: '4 节点自动化触达流',
      },
    ],
    expectedResults: [
      { metric: '客服人力', value: '节省 70%' },
      { metric: '客户首响时间', value: '从 2h → 5s' },
      { metric: '30 天复购率', value: '+50%' },
      { metric: '私域 ROI', value: '提升 3 倍' },
    ],
    revenueModel: '复购订单 + 高客单推荐 + 社群团购',
    warnings: [
      '企微加好友上限每日 200 个，需控制节奏',
      'AI 回复敏感词需人工审核，医疗/金融不要全 AI',
      '客户标签超过 20 个会拖累自动化效率，建议分群',
    ],
  },
  {
    slug: 'ai-pinduoduo',
    title: '拼多多 AI 自动生成主图 + 客服话术 SOP',
    cover: img('Pinduoduo mobile e-commerce product images AI generation orange red gradient Chinese style'),
    tags: '新手友好',
    time: '3 天',
    difficulty: '入门',
    summary: '拼多多商家 0 基础也能日更 50 条主图、100 条客服话术，店铺日销从 0 到 1000 单。',
    category: 'ai-ecommerce',
    painPoints: [
      '主图不会设计、找美工贵、爆款素材学不来',
      '客服话术翻来覆去、夜班没人值守',
      'sku 太多、上新慢、错过平台活动',
      '价格战激烈、不敢提价、利润稀薄',
    ],
    tools: [
      { name: 'Midjourney / 即梦 AI', use: '主图、场景图、卖点图' },
      { name: 'ChatGPT-4o / Kimi', use: '客服话术、活动文案' },
      { name: '拼多多商家版', use: '店铺后台、客服系统' },
      { name: '蝉妈妈 / 飞瓜', use: '竞品爆款监控' },
    ],
    steps: [
      {
        title: 'Step 1 - 竞品爆款拆解（3 小时）',
        detail: '蝉妈妈拉近 7 天同类目 Top 100 链接，把主图、色调、卖点、评论高频词喂给 GPT，让它输出「我应该做的主图元素清单 + 差异化方向」。',
        tools: ['蝉妈妈', 'ChatGPT-4o'],
        duration: '3 小时',
        output: '1 份差异化主图清单 + 文案方向',
      },
      {
        title: 'Step 2 - AI 主图量产（6 小时）',
        detail: 'Midjourney 批量生成：白底 + 场景 + 卖点 + 数字 + 对比 5 类主图各 10 张，每张图叠加价格数字、卖点短语（用 Canva/创客贴合成）。一次性产出 50 张。',
        tools: ['Midjourney', 'Canva', '创客贴'],
        duration: '6 小时',
        output: '50 张主图 / sku',
      },
      {
        title: 'Step 3 - 客服 AI 化 + 自动回复（4 小时）',
        detail: '用 GPT 写 100 条客服话术覆盖：询价、议价、发货、售后、退换、活动、好评邀请等。拼多多商家版「自动回复」按关键词触发。',
        tools: ['ChatGPT-4o', '拼多多商家后台'],
        duration: '4 小时',
        output: '100 条话术 + 关键词触发配置',
      },
    ],
    expectedResults: [
      { metric: '主图产出', value: '5 张/天 → 50 张/天' },
      { metric: '客服夜班人力', value: '节省 90%' },
      { metric: '点击率', value: '+30%' },
      { metric: '日销单量', value: '0 → 1000+' },
    ],
    revenueModel: '拼多多店铺差价 + 多店群矩阵',
    warnings: [
      '拼多多对虚假宣传敏感，主图禁用「最/极/第一」',
      '同一身份证最多开 5 个店铺，矩阵要注意合规',
      'AI 生成图涉及品牌字样需脱敏',
    ],
  },
  {
    slug: 'ai-after-sales-automation',
    title: 'AI 售后自动化 + 差评预警 SOP',
    cover: img('after sales AI automation customer review early warning blue gradient dashboard'),
    tags: '进阶玩法',
    time: '5 天',
    difficulty: '进阶',
    summary: 'AI 实时监控差评、主动介入挽回，差评率从 5% 降到 1%，每条好评自动催生 UGC 内容。',
    category: 'ai-ecommerce',
    painPoints: [
      '差评出来才发现，错过最佳挽回期',
      '售后客服话术不统一、升级投诉率高',
      '好评不会写、UGC 内容稀缺',
      '退换货流程乱、成本算不清',
    ],
    tools: [
      { name: '淘宝/天猫/拼多多 商家后台', use: '评价/售后 API' },
      { name: 'GPT-4o', use: '差评话术 + 好评邀约' },
      { name: '飞书多维表格 + Webhook', use: '差评实时推送' },
      { name: 'n8n / Make', use: '差评 → 客服工单' },
    ],
    steps: [
      {
        title: 'Step 1 - 差评关键词监控（半天）',
        detail: '配置 n8n 轮询任务，每 10 分钟拉取店铺新评价。当评价含「差/退/坏/假/坑/退钱/投诉」等关键词时，自动推送飞书群 + 工单系统，附带订单号 + 客户联系方式。',
        tools: ['n8n', '飞书机器人', '淘宝开放平台'],
        duration: '4 小时',
        output: '差评实时监控流',
      },
      {
        title: 'Step 2 - AI 介入话术（1 天）',
        detail: 'GPT 写 5 类差评话术：物流慢、质量问题、尺寸不符、客服态度、误会误操作。每类话术 3 种风格（道歉 + 补偿 / 解释 + 退款 / 引导修改评价）。客服 1 键选择发送。',
        tools: ['ChatGPT-4o', '飞书多维表格'],
        duration: '8 小时',
        output: '15 条场景话术',
      },
      {
        title: 'Step 3 - 好评自动邀约 + UGC 沉淀（3 天）',
        detail: '订单签收后第 3 / 第 7 / 第 15 天，AI 自动发送「带图好评」邀约话术（根据用户标签个性化）。用户晒图后 AI 自动感谢 + 赠送优惠券。UGC 沉淀到独立站「买家秀」频道。',
        tools: ['n8n', 'ChatGPT-4o', '有赞/微盟'],
        duration: '1 天配置 + 2 天观察',
        output: '3 节点触达 + UGC 库',
      },
    ],
    expectedResults: [
      { metric: '差评率', value: '5% → 1%' },
      { metric: '差评挽回率', value: '60%+' },
      { metric: '好评带图率', value: '10% → 35%' },
      { metric: '客服效率', value: '+200%' },
    ],
    revenueModel: '复购订单 + 主动好评带来的自然流量',
    warnings: [
      '禁止用利益诱导好评（5 元红包等），平台会降权',
      'AI 话术需人工抽检 5%，避免错误承诺',
      '差评工单优先级要按金额分层',
    ],
  },

  // ===== AI 自媒体引流/变现 =====
  {
    slug: 'ai-xiaohongshu-matrix',
    title: '小红书矩阵号 AI 内容工厂 SOP',
    cover: img('Xiaohongshu Little Red Book social media AI content factory pink gradient creative'),
    tags: '新手友好',
    time: '7 天',
    difficulty: '进阶',
    summary: '1 人 + AI 矩阵 10 个小红书号，每天产出 30 篇爆款笔记，月引私域 5,000+ 精准用户。',
    category: 'ai-media',
    painPoints: [
      '写一篇笔记 3 小时，量产困难',
      '爆款选题靠感觉、命中率低',
      '多个账号切换累、违规风险高',
      '引流到私域路径长、转化差',
    ],
    tools: [
      { name: '灰豚数据 / 新红', use: '爆款选题监控' },
      { name: 'ChatGPT-4o / Kimi', use: '标题 + 正文生成' },
      { name: 'Midjourney / 即梦 AI', use: '封面图生成' },
      { name: '剪映 / Canva', use: '封面排版' },
      { name: 'Notion / 飞书', use: '内容库 + SOP' },
    ],
    steps: [
      {
        title: 'Step 1 - 爆款选题库搭建（1 天）',
        detail: '灰豚导出近 7 天 Top 500 笔记标题 + 互动量，用 GPT 提炼 20 类「常青选题模板」。每个账号确定 2-3 个垂类，账号简介 + 头像 + 名字用 AI 批量生成差异化版本。',
        tools: ['灰豚数据', 'ChatGPT-4o'],
        duration: '6-8 小时',
        output: '20 选题模板 + 10 套账号资料',
      },
      {
        title: 'Step 2 - 笔记量产流水线（3 天）',
        detail: '把选题模板喂给 GPT：「请用第一人称、emoji 适量、含 3 个痛点 + 3 个解决方案、结尾引导评论，生成 5 篇不同角度的笔记」。Midjourney 出 5 张同风格封面。每账号每天 3 篇。',
        tools: ['ChatGPT-4o', 'Midjourney', 'Canva'],
        duration: '每天 4 小时',
        output: '30 篇/天笔记 + 150 张封面',
      },
      {
        title: 'Step 3 - 引流 + 转化路径（3 天）',
        detail: '笔记正文不直接放微信号，用「评论区求链接 / 主页简介 / 资料包」三步引流。配置自动回复话术，触发后发送企微二维码。每周复盘爆款，更新选题库。',
        tools: ['小红书后台', '企微活码', 'ManyChat'],
        duration: '每天 2 小时',
        output: '完整引流 SOP + 转化数据看板',
      },
    ],
    expectedResults: [
      { metric: '单号日更', value: '1 → 3 篇' },
      { metric: '爆款率', value: '5% → 15%' },
      { metric: '月引私域', value: '0 → 5,000+' },
      { metric: '内容成本', value: '降低 80%' },
    ],
    revenueModel: '私域转化 + 知识付费 + 商单广告',
    warnings: [
      '小红书 1 个手机号 1 个身份证最多 1 个专业号',
      '矩阵号不要同 IP / 同设备 / 同 WiFi 登录',
      '笔记引流别在正文放微信号，违规限流',
    ],
  },
  {
    slug: 'ai-douyin-clone',
    title: '抖音数字人克隆 + 24h 无人直播 SOP',
    cover: img('Douyin AI digital human clone live streaming 24h dark purple cyberpunk futuristic'),
    tags: '高阶玩法',
    time: '10 天',
    difficulty: '高阶',
    summary: '用 Heygen/D-ID 克隆自己/AI 形象，24h 不间断直播带货，1 个直播间月 GMV 10w+。',
    category: 'ai-media',
    painPoints: [
      '真人直播时长有限、夜班播不动',
      '主播跳槽风险、培养新人成本高',
      '多账号开播需要多个主播',
      '直播话术不会写、留人难',
    ],
    tools: [
      { name: 'Heygen / D-ID / 闪剪', use: '数字人克隆视频' },
      { name: 'ChatGPT-4o / Coze', use: 'AI 互动话术' },
      { name: 'OBS / 直播伴侣', use: '推流 + 多账号管理' },
      { name: '抖音直播伴侣', use: '数字人循环播放' },
    ],
    steps: [
      {
        title: 'Step 1 - 数字人录制 + 训练（1-2 天）',
        detail: '用 Heygen 录制 5 分钟真人素材（正脸/侧脸/表情），生成 1080p 数字人。或用 D-ID 上传 1 张照片 + 音频生成。如果做海外，用 Synthesia。',
        tools: ['Heygen', 'D-ID'],
        duration: '1-2 天',
        output: '1 个高精度数字人模型',
      },
      {
        title: 'Step 2 - 直播话术 + 互动 AI（3 天）',
        detail: 'GPT 写 50 条话术：开场留人、产品介绍、逼单、催单、答疑问。Coze / Dify 搭 AI 智能体，对接抖音弹幕 API，实时回答观众问题。',
        tools: ['Coze', 'Dify', '抖音开放平台'],
        duration: '2-3 天',
        output: '50 条话术 + 实时 AI 客服',
      },
      {
        title: 'Step 3 - 24h 循环直播 + 投流（5-7 天）',
        detail: '用 OBS + 直播伴侣推流，循环播放预录数字人视频 + 实时 AI 互动话术。挂购物车，开千川投流。白天真人辅助回复复杂问题，夜间纯 AI。',
        tools: ['OBS', '抖音千川', '直播伴侣'],
        duration: '5-7 天',
        output: '7×24 数字人直播间',
      },
    ],
    expectedResults: [
      { metric: '直播时长', value: '6h → 24h' },
      { metric: '人力成本', value: '节省 80%' },
      { metric: '月 GMV', value: '5w-30w' },
      { metric: '互动率', value: '比录播高 5 倍' },
    ],
    revenueModel: '直播带货佣金 + 千川投流 ROI',
    warnings: [
      '抖音对数字人直播有审核，2024 年起部分类目禁止',
      '必须明确标注「AI 数字人」，否则违规下播',
      'AI 互动答错会激怒观众，要准备兜底话术',
    ],
  },
  {
    slug: 'ai-bilibili-creator',
    title: 'B 站 AI 知识区 + 商单变现 SOP',
    cover: img('Bilibili knowledge creator AI video content blue pink gradient creative workspace'),
    tags: '新手友好',
    time: '14 天',
    difficulty: '进阶',
    summary: '从 0 粉丝到 10w 粉 B 站知识区博主，AI 辅助选题/脚本/剪辑，月接 3-5 单商单 + 充电。',
    category: 'ai-media',
    painPoints: [
      'B 站审核严、原创要求高、纯 AI 内容会被限流',
      '脚本写 1 周、剪辑 3 天，量产困难',
      '选题猜不透算法、爆款看运气',
      '粉丝达到 1w 后不知道怎么接商单',
    ],
    tools: [
      { name: '新榜 / 飞瓜 B 站', use: '选题数据 + 竞品分析' },
      { name: 'ChatGPT-4o / Claude', use: '脚本生成（人机协作）' },
      { name: 'ElevenLabs / 剪映', use: 'AI 配音 + 字幕' },
      { name: 'Capcut / 剪映专业版', use: '剪辑 + 关键帧' },
      { name: 'B 站花火平台', use: '商单接单' },
    ],
    steps: [
      {
        title: 'Step 1 - 垂类定位 + 选题库（2 天）',
        detail: '选定 1 个垂类（如 AI 工具、心理学、效率提升）。新榜拉近 30 天 Top 100 视频拆解标题、封面、节奏点。GPT 总结「常青选题 20 类 + 钩子模板 30 条」。',
        tools: ['新榜', 'ChatGPT-4o'],
        duration: '2 天',
        output: '垂类定位 + 50 选题清单',
      },
      {
        title: 'Step 2 - 人机协作脚本 + 剪辑（7 天）',
        detail: '脚本 70% 人工 + 30% AI 改写，避免平台判定 AI 创作。AI 负责：搜集资料、生成大纲、润色文案、配音（ElevenLabs）、生成字幕。剪辑用剪映一键包装。',
        tools: ['ChatGPT-4o', 'ElevenLabs', '剪映专业版'],
        duration: '7 天 / 4 条视频',
        output: '4 条 8-15min 知识视频',
      },
      {
        title: 'Step 3 - 商单 + 充电 + 直播变现（5 天）',
        detail: '粉丝过 1w 入驻 B 站「花火」接商单，单条报价 = 粉丝数 × 0.05-0.1。开通充电 + 直播打赏。每周更新 2 条 + 月度直播 4 次。',
        tools: ['B 站花火', 'B 站直播姬', 'B 站充电'],
        duration: '持续',
        output: '商业化体系搭建',
      },
    ],
    expectedResults: [
      { metric: '月更视频', value: '2 → 8 条' },
      { metric: '起号周期', value: '3-6 个月到 10w 粉' },
      { metric: '单条商单', value: '5,000-15,000' },
      { metric: '月收入', value: '0 → 2w-5w' },
    ],
    revenueModel: 'B 站充电 + 花火商单 + 直播打赏 + 知识付费引流私域',
    warnings: [
      'B 站对纯 AI 创作会限流，必须人机协作',
      '知识区细分赛道太宽会数据分散，建议先窄后宽',
      '商单要合规报备，否则影响权重',
    ],
  },
  {
    slug: 'ai-youtube-faceless',
    title: 'YouTube 无脸视频 + 联盟营销 SOP',
    cover: img('YouTube faceless video automation AI voiceover dark red gradient digital studio'),
    tags: '进阶玩法',
    time: '14 天',
    difficulty: '进阶',
    summary: '不露脸不开口，AI 视频 + AI 配音 + AI 字幕，月产 30 条 YouTube Shorts，联盟营销月入 $3,000+。',
    category: 'ai-media',
    painPoints: [
      '英语不好但想做 YouTube',
      '不想露脸、不想录音',
      '选题多但制作慢、量产难',
      'YouTube 算法难懂、流量起伏大',
    ],
    tools: [
      { name: 'Pictory / InVideo AI', use: 'AI 一键生成视频' },
      { name: 'ElevenLabs / Murf', use: 'AI 多语种配音' },
      { name: 'Whisper / 剪映', use: 'AI 字幕生成' },
      { name: 'Canva / Leonardo AI', use: '缩略图生成' },
      { name: 'Amazon Associates / Impact', use: '联盟营销' },
    ],
    steps: [
      {
        title: 'Step 1 - 频道定位 + 选题（2 天）',
        detail: '选高 CPM 利基：理财/AI 工具/健康/科技评测。VidIQ / TubeBuddy 拉 30 天 Top 100 视频，GPT 提炼「常青选题 20 类 + 高 CTR 缩略图模板 10 套」。',
        tools: ['VidIQ', 'TubeBuddy', 'ChatGPT-4o'],
        duration: '2 天',
        output: '频道定位 + 50 选题 + 10 缩略图模板',
      },
      {
        title: 'Step 2 - AI 视频量产流水线（7 天）',
        detail: 'Pictory 喂脚本 → AI 自动配素材 + 字幕 + 转场。ElevenLabs 配多语种人声。Canva 生成高 CTR 缩略图（人物 + 大字 + 强对比）。每天产出 4-5 条。',
        tools: ['Pictory', 'ElevenLabs', 'Canva'],
        duration: '每天 3 小时',
        output: '30 条视频 + 30 张缩略图',
      },
      {
        title: 'Step 3 - 联盟营销 + Shorts 引流（5 天）',
        detail: '视频描述挂 Amazon Associates / Impact 联盟链接（用 AI 工具评测、软件推荐类目最优）。同步把长视频切片为 Shorts，发到 TikTok/IG Reels 矩阵导流。',
        tools: ['Amazon Associates', 'Impact', 'TubeBuddy'],
        duration: '5 天配置 + 持续',
        output: '联盟营销体系 + 多平台分发',
      },
    ],
    expectedResults: [
      { metric: '月产视频', value: '8 → 30 条' },
      { metric: 'CPM', value: '$8-30' },
      { metric: '首月收入', value: '$500-1,500' },
      { metric: '6 个月后', value: '$3,000-10,000/月' },
    ],
    revenueModel: 'YouTube 广告分成 + 联盟佣金 + 数字产品',
    warnings: [
      'YouTube 严格审查「Reused Content」，必须有原创剪辑',
      'Pictory 素材库是通用的，建议加独家素材',
      '纯 AI 配音必须配真人字幕 + 节奏调整',
    ],
  },
  {
    slug: 'ai-podcast-newsletter',
    title: 'AI 播客 + 订阅通讯双平台变现 SOP',
    cover: img('AI podcast newsletter digital subscription purple orange gradient modern audio studio'),
    tags: '新手友好',
    time: '10 天',
    difficulty: '进阶',
    summary: '用 AI 录制播客 + 写 Newsletter，每月沉淀 1,000 付费订阅用户，客单价 $9/月。',
    category: 'ai-media',
    painPoints: [
      '录制播客累、设备贵、剪辑难',
      'Newsletter 持续产出难、掉粉快',
      '付费墙转化低、不知道怎么定价',
      '内容分发渠道少、增长慢',
    ],
    tools: [
      { name: 'NotebookLM / ElevenLabs', use: 'AI 双人对话播客生成' },
      { name: 'Descript / 剪映', use: '播客剪辑 + 字幕' },
      { name: 'Substack / Beehiiv', use: 'Newsletter 平台' },
      { name: 'Spotify for Podcasters', use: '播客分发' },
      { name: 'ConvertKit / Substack Paid', use: '付费订阅' },
    ],
    steps: [
      {
        title: 'Step 1 - 内容源 + 双人播客生成（3 天）',
        detail: '把 1 篇文章/1 个产品/1 个新闻喂给 NotebookLM，自动生成双人对话播客。再用 Descript 剪辑降噪、加片头片尾、生成 SRT 字幕。',
        tools: ['NotebookLM', 'Descript'],
        duration: '3 天',
        output: '4 期 20-30min 播客 + 字幕',
      },
      {
        title: 'Step 2 - Newsletter 内容生产（3 天）',
        detail: 'GPT 改写播客文案为 Newsletter 文章，加 3 个深度观点 + 1 个资源链接 + 1 个 CTA。设计 1 套品牌模板（Substack/Beehiiv 模板）。',
        tools: ['ChatGPT-4o', 'Substack', 'Canva'],
        duration: '3 天',
        output: '4 篇 1500-2500 字 Newsletter',
      },
      {
        title: 'Step 3 - 订阅 + 付费墙转化（4 天）',
        detail: '前 3 期免费吸引订阅，第 4 期起开启付费墙（$9/月或 $80/年）。每周 1 期播客 + 1 期 Newsletter。评论区 + 社群运营建立信任。',
        tools: ['Substack Paid', 'ConvertKit', 'Discord/Slack'],
        duration: '4 天',
        output: '付费订阅体系',
      },
    ],
    expectedResults: [
      { metric: '内容产出', value: '1 期/周 → 2 期/周' },
      { metric: '订阅转化', value: '5%-10%' },
      { metric: '6 个月订阅用户', value: '1,000+' },
      { metric: '月收入', value: '$5,000-15,000' },
    ],
    revenueModel: '付费订阅 + 付费社群 + 联盟 + 数字产品',
    warnings: [
      'NotebookLM 生成对话有幻觉，重要事实要人工核验',
      'Newsletter 掉粉率高，每周必须稳定产出',
      '付费墙开通太早会损失 50% 流量，建议 3-5 期后再开',
    ],
  },
]

export function getSOPBySlug(slug: string): SOP | undefined {
  return sops.find((s) => s.slug === slug)
}
