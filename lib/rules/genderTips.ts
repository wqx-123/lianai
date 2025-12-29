import { Gender, RelationshipStage } from '@/types';

interface Tip {
  category: string;
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  steps?: string[];
}

/**
 * 基于性别和阶段的恋爱技巧规则引擎
 */
export class GenderTipsRules {
  // 认识阶段 - 追女生
  private meetingFemale: Tip[] = [
    {
      category: 'chat',
      title: '开场话题建议',
      content: '从轻松话题切入，如美食、旅行、宠物、明星八卦等。避免过于私人或敏感的话题。',
      priority: 'high',
      steps: [
        '① 观察她的社交动态，寻找共同话题',
        '② 用轻松的语气开启对话，如"看到你也喜欢XX"',
        '③ 适时抛出问题，鼓励她分享',
        '④ 认真倾听，记住她提到的细节',
      ],
    },
    {
      category: 'chat',
      title: '建立吸引力',
      content: '女生更注重细节和感受，通过幽默、自信和细心来建立吸引力。',
      priority: 'high',
      steps: [
        '① 展现自信但不自负的态度',
        '② 适当幽默，但不要过度',
        '③ 注意细节，记住她说的小事',
        '④ 展现自己的价值和特长',
      ],
    },
    {
      category: 'communication',
      title: '倾听与回应技巧',
      content: '多提问，认真倾听对方回答，适时给予回应和赞美。女生喜欢被认真对待的感觉。',
      priority: 'high',
      steps: [
        '① 保持眼神交流，专注倾听',
        '② 适时点头和"嗯嗯"回应',
        '③ 提出延伸性问题，如"然后呢""为什么"',
        '④ 给予真诚的赞美',
      ],
    },
    {
      category: 'date',
      title: '初次约会地点选择',
      content: '选择轻松、安全、有话题的场合，避免过于私密或嘈杂的环境。',
      priority: 'high',
      steps: [
        '① 推荐咖啡厅、书店、艺术展览等',
        '② 确保地点安全、交通便利',
        '③ 选择有活动内容的场所，方便互动',
        '④ 提前了解场所有无特殊要求',
      ],
    },
    {
      category: 'chat',
      title: '保持神秘感',
      content: '不要一次性透露所有信息，保持适度神秘感，让她有继续探索的兴趣。',
      priority: 'medium',
      steps: [
        '① 分配信息，不要一次说完',
        '② 留下悬念，"下次告诉你"',
        '③ 展现多面性，不要被看透',
        '④ 保持自己的生活节奏',
      ],
    },
    {
      category: 'gift',
      title: '小礼物原则',
      content: '初次见面不建议送礼，如需送礼应选择简单、无压力的小物件。',
      priority: 'low',
      steps: [
        '① 选择实用不贵重的物品',
        '② 避免过于私人的礼物',
        '③ 可以是一杯咖啡、一本好书',
        '④ 送礼时说明原因，不要太刻意',
      ],
    },
    {
      category: 'warning',
      title: '避免过度热情',
      content: '不要表现出过度的需求感，保持自然、自信的状态。',
      priority: 'high',
      steps: [
        '① 控制联系频率，不要秒回',
        '② 保持自己的生活和兴趣',
        '③ 不要过度赞美或讨好',
        '④ 展现自信和独立',
      ],
    },
  ];

  // 认识阶段 - 追男生
  private meetingMale: Tip[] = [
    {
      category: 'chat',
      title: '开场话题建议',
      content: '从共同兴趣入手，如运动、游戏、科技、汽车等。男生喜欢分享自己的专业领域。',
      priority: 'high',
      steps: [
        '① 观察他的兴趣，找到切入点',
        '② 请教他的专业或爱好',
        '③ 表现出真诚的好奇和佩服',
        '④ 适时分享自己的观点',
      ],
    },
    {
      category: 'chat',
      title: '建立吸引力',
      content: '男生更注重视觉和共同兴趣，通过颜值、性格和共同爱好建立吸引力。',
      priority: 'high',
      steps: [
        '① 保持良好的形象和打扮',
        '② 展现独立和有趣的一面',
        '③ 分享共同兴趣，建立共鸣',
        '④ 适当展现柔弱，激发保护欲',
      ],
    },
    {
      category: 'communication',
      title: '倾听与回应技巧',
      content: '男生喜欢被认可和崇拜，认真倾听并给予正面反馈。',
      priority: 'high',
      steps: [
        '① 听他讲述时表现出兴趣',
        '② 适时提问，展示关注',
        '③ 给予肯定和赞美',
        '④ 分享类似经历，建立共鸣',
      ],
    },
    {
      category: 'date',
      title: '初次约会地点选择',
      content: '选择有活动内容的场所，避免尴尬的沉默。运动、游戏、美食都是好选择。',
      priority: 'high',
      steps: [
        '① 选择有互动活动的场所',
        '② 考虑他的兴趣偏好',
        '③ 可以是运动、游戏、美食探索',
        '④ 避免过于正式或安静的环境',
      ],
    },
    {
      category: 'chat',
      title: '展现独立性',
      content: '男生喜欢有自己生活和想法的女生，不要太依赖。',
      priority: 'medium',
      steps: [
        '① 分享自己的工作和兴趣',
        '② 展现独立解决问题的能力',
        '③ 不要总是等待他的联系',
        '④ 保持神秘感和个性',
      ],
    },
    {
      category: 'warning',
      title: '不要过度主动',
      content: '适当保持距离，让他来追求你。太主动会降低你的价值感。',
      priority: 'high',
      steps: [
        '① 控制主动联系的频率',
        '② 不要秒回每一条消息',
        '③ 让他来计划和安排约会',
        '④ 展现被追求的价值',
      ],
    },
  ];

  // 了解阶段 - 追女生
  private knowingFemale: Tip[] = [
    {
      category: 'chat',
      title: '深入交流话题',
      content: '聊一些更有深度的话题，如理想型、对感情的看法、未来的规划等。',
      priority: 'high',
      steps: [
        '① 从轻松话题过渡到深度话题',
        '② 分享自己的经历和想法',
        '③ 询问她的观点和感受',
        '④ 建立情感共鸣',
      ],
    },
    {
      category: 'communication',
      title: '情感连接技巧',
      content: '通过情感共鸣建立深度连接，让她觉得你懂她。',
      priority: 'high',
      steps: [
        '① 认真倾听她的情感需求',
        '② 表达理解和共情',
        '③ 分享类似经历',
        '④ 给予情感支持',
      ],
    },
    {
      category: 'date',
      title: '多样化约会体验',
      content: '安排不同类型的约会：电影、展览、运动、美食等，观察她在不同场合的状态。',
      priority: 'high',
      steps: [
        '① 规划不同类型的约会',
        '② 观察她的反应和偏好',
        '③ 记住她喜欢的活动',
        '④ 重复安排她喜欢的约会',
      ],
    },
    {
      category: 'communication',
      title: '保持联系频率',
      content: '每天保持适度的联系，但不要过度，给彼此空间。',
      priority: 'medium',
      steps: [
        '① 早晚问候保持存在感',
        '② 分享日常小事',
        '③ 不要全天候轰炸消息',
        '④ 观察她的回复节奏调整',
      ],
    },
    {
      category: 'gift',
      title: '贴心小礼物',
      content: '根据她的喜好送小礼物，体现你记得她的喜好。',
      priority: 'medium',
      steps: [
        '① 留意她提到过的小喜好',
        '② 选择有纪念意义的物品',
        '③ 可以是她喜欢的零食、书籍',
        '④ 送礼时说明"记得你喜欢"',
      ],
    },
    {
      category: 'warning',
      title: '不要过早表白',
      content: '了解阶段不宜过早表白，可能会给她压力，让关系自然发展。',
      priority: 'high',
      steps: [
        '① 先建立足够的了解和信任',
        '② 观察她的态度和信号',
        '③ 选择合适的时机',
        '④ 用行动而非言语表达',
      ],
    },
  ];

  // 了解阶段 - 追男生
  private knowingMale: Tip[] = [
    {
      category: 'chat',
      title: '深入交流话题',
      content: '聊聊他的事业规划、兴趣爱好、人生目标，男生喜欢被理解和支持。',
      priority: 'high',
      steps: [
        '① 询问他的工作和规划',
        '② 表现出理解和支持',
        '③ 分享自己的想法',
        '④ 寻找共同目标',
      ],
    },
    {
      category: 'communication',
      title: '展示理解和支持',
      content: '男生需要被理解和支持，成为他的精神支柱。',
      priority: 'high',
      steps: [
        '① 理解他的压力和挑战',
        '② 给予鼓励和支持',
        '③ 在他需要时陪伴',
        '④ 成为他的倾诉对象',
      ],
    },
    {
      category: 'date',
      title: '共同活动约会',
      content: '安排他感兴趣的活动，如运动、游戏、户外探险等。',
      priority: 'high',
      steps: [
        '① 选择他喜欢的活动',
        '② 参与并展现兴趣',
        '③ 不要抱怨或嫌弃',
        '④ 创造美好回忆',
      ],
    },
    {
      category: 'communication',
      title: '保持适度的神秘感',
      content: '不要让他完全看透你，保持新鲜感和吸引力。',
      priority: 'medium',
      steps: [
        '① 不要每次都秒回消息',
        '② 保持自己的生活节奏',
        '③ 偶尔拒绝他的邀请',
        '④ 让他有探索的动力',
      ],
    },
    {
      category: 'warning',
      title: '不要过度依赖',
      content: '保持独立性，不要让他觉得你离不开他。',
      priority: 'high',
      steps: [
        '① 继续保持自己的社交',
        '② 不要每次都答应约会',
        '③ 展现独立的一面',
        '④ 让他知道你很有价值',
      ],
    },
  ];

  // 关系升级阶段 - 追女生
  private escalatingFemale: Tip[] = [
    {
      category: 'chat',
      title: '增加暧昧话题',
      content: '可以聊一些更亲密的话题，如理想型、对感情的看法、对彼此的印象。',
      priority: 'high',
      steps: [
        '① 从感情话题开始试探',
        '② 询问她的理想型',
        '③ 聊聊对彼此的印象',
        '④ 观察她的反应调整',
      ],
    },
    {
      category: 'communication',
      title: '肢体接触试探',
      content: '适当的肢体接触可以升级关系，但要观察她的反应，尊重她的边界。',
      priority: 'high',
      steps: [
        '① 从无意触碰开始',
        '② 过马路时自然牵手',
        '③ 帮她整理头发',
        '④ 观察反应，不排斥则继续',
      ],
    },
    {
      category: 'date',
      title: '创造浪漫氛围',
      content: '选择更浪漫的约会地点和时间，如晚上、有氛围的餐厅、散步等。',
      priority: 'high',
      steps: [
        '① 选择晚上约会',
        '② 挑选有氛围的餐厅',
        '③ 约会后散步聊天',
        '④ 创造独处机会',
      ],
    },
    {
      category: 'communication',
      title: '暗示心意',
      content: '用语言或行动暗示自己的心意，如"和你在一起很开心""很想你"等。',
      priority: 'high',
      steps: [
        '① 表达在一起的感受',
        '② 分享想念的情绪',
        '③ 给予特别的关注',
        '④ 用行动表达在意',
      ],
    },
    {
      category: 'gift',
      title: '更有意义的礼物',
      content: '送更有心意和纪念意义的礼物，体现你对她用心。',
      priority: 'medium',
      steps: [
        '① 选择与回忆相关的物品',
        '② 可以是手工制品',
        '③ 附上手写卡片',
        '④ 送礼时说出心意',
      ],
    },
    {
      category: 'warning',
      title: '不要逼得太紧',
      content: '暧昧期需要耐心，不要逼迫她表态，让感情自然发酵。',
      priority: 'high',
      steps: [
        '① 保持耐心，不要催促',
        '② 不要强迫表白',
        '③ 观察她的节奏',
        '④ 给她思考的空间',
      ],
    },
  ];

  // 关系升级阶段 - 追男生
  private escalatingMale: Tip[] = [
    {
      category: 'chat',
      title: '增加暧昧氛围',
      content: '通过言语和行为创造暧昧，让他意识到你不仅是朋友。',
      priority: 'high',
      steps: [
        '① 眼神交流保持更久',
        '② 肢体接触更加自然',
        '③ 言语暗示特别对待',
        '④ 创造独处机会',
      ],
    },
    {
      category: 'communication',
      title: '释放可得性信号',
      content: '让他知道你单身且对他有意思，但不要太明显。',
      priority: 'high',
      steps: [
        '① 提到自己单身状态',
        '② 赞美他的优点',
        '③ 给予特别关注',
        '④ 制造嫉妒心理（适度）',
      ],
    },
    {
      category: 'date',
      title: '浪漫氛围营造',
      content: '选择更私密和浪漫的场合，创造暧昧氛围。',
      priority: 'high',
      steps: [
        '① 选择晚上约会',
        '② 挑选安静有氛围的地方',
        '③ 创造独处机会',
        '④ 适当的眼神交流',
      ],
    },
    {
      category: 'communication',
      title: '主动创造机会',
      content: '主动创造让关系升级的机会，不要总是等待他来。',
      priority: 'high',
      steps: [
        '① 主动约他出来',
        '② 制造身体接触机会',
        '③ 给予明显的暗示',
        '④ 在合适的时机表白',
      ],
    },
    {
      category: 'warning',
      title: '不要过于主动',
      content: '即使主动也要保持自己的价值，不要太倒贴。',
      priority: 'high',
      steps: [
        '① 主动但不过度',
        '② 保持自己的底线',
        '③ 让他来追求',
        '④ 展现自己的价值',
      ],
    },
  ];

  // 亲密关系阶段 - 追女生
  private intimateFemale: Tip[] = [
    {
      category: 'communication',
      title: '分享真实自我',
      content: '分享自己的脆弱、恐惧、不完美的一面，建立真正的亲密。',
      priority: 'high',
      steps: [
        '① 分享自己的经历',
        '② 谈谈自己的脆弱',
        '③ 表达真实的情感',
        '④ 鼓励她也分享',
      ],
    },
    {
      category: 'chat',
      title: '深度对话',
      content: '进行关于人生、价值观、未来的深度对话，了解彼此的内心世界。',
      priority: 'high',
      steps: [
        '① 选择合适的时间',
        '② 营造轻松的氛围',
        '③ 从轻松话题深入',
        '④ 认真倾听和理解',
      ],
    },
    {
      category: 'date',
      title: '共度时光',
      content: '安排一些可以深入相处的活动，如旅行、做饭给对方吃、宅家看电影。',
      priority: 'high',
      steps: [
        '① 计划短途旅行',
        '② 一起做饭',
        '③ 在家看电影',
        '④ 创造私密回忆',
      ],
    },
    {
      category: 'communication',
      title: '支持彼此',
      content: '在她遇到困难时给予支持，成为她的精神支柱。',
      priority: 'high',
      steps: [
        '① 及时了解她的情况',
        '② 给予情感支持',
        '③ 提供实际帮助',
        '④ 陪伴度过难关',
      ],
    },
    {
      category: 'warning',
      title: '保持边界感',
      content: '虽然亲密但仍要保持各自的空间和边界，不要过度依赖或控制。',
      priority: 'medium',
      steps: [
        '① 保持自己的空间',
        '② 不要过度粘人',
        '③ 尊重她的隐私',
        '④ 保持独立生活',
      ],
    },
  ];

  // 亲密关系阶段 - 追男生
  private intimateMale: Tip[] = [
    {
      category: 'communication',
      title: '情感依赖建立',
      content: '让他习惯你的存在，成为他生活中不可或缺的一部分。',
      priority: 'high',
      steps: [
        '① 分享生活中的大小事',
        '② 成为他第一个想分享的人',
        '③ 给予理解和包容',
        '④ 创造共同回忆',
      ],
    },
    {
      category: 'chat',
      title: '深度理解',
      content: '深入了解他的内心世界，成为最懂他的人。',
      priority: 'high',
      steps: [
        '① 了解他的压力和困惑',
        '② 给予理解和支持',
        '③ 分享自己的想法',
        '④ 建立默契',
      ],
    },
    {
      category: 'date',
      title: '融入彼此生活',
      content: '开始参与彼此的生活，如见朋友、一起做家务等。',
      priority: 'high',
      steps: [
        '① 介绍给朋友认识',
        '② 一起做日常事务',
        '③ 参与他的兴趣爱好',
        '④ 创造共同生活',
      ],
    },
    {
      category: 'communication',
      title: '规划未来',
      content: '开始讨论和规划涉及两人的未来，建立共同愿景。',
      priority: 'high',
      steps: [
        '① 聊聊未来的计划',
        '② 探讨彼此的期望',
        '③ 寻找共同目标',
        '④ 建立共同愿景',
      ],
    },
  ];

  // 确认关系阶段 - 通用（不分性别）
  private committed: Tip[] = [
    {
      category: 'chat',
      title: '选择合适的表白时机',
      content: '找一个合适的时机和氛围，如约会结束时、特殊节日、有纪念意义的地点。',
      priority: 'high',
      steps: [
        '① 选择私密、放松的环境',
        '② 确保对方心情良好',
        '③ 可以选特殊日子',
        '④ 准备好要说的话',
      ],
    },
    {
      category: 'communication',
      title: '真诚表白',
      content: '用真诚的方式表达自己的心意，不需要华丽的辞藻，真心最重要。',
      priority: 'high',
      steps: [
        '① 直接表达心意',
        '② 说出喜欢的原因',
        '③ 展现真诚的态度',
        '④ 不要给压力',
      ],
    },
    {
      category: 'date',
      title: '精心安排',
      content: '可以安排一个特别的表白场景，如第一次见面的地方、喜欢的餐厅、准备小礼物。',
      priority: 'medium',
      steps: [
        '① 选择有意义的地方',
        '② 准备小礼物',
        '③ 营造浪漫氛围',
        '④ 排练一下要说的话',
      ],
    },
    {
      category: 'communication',
      title: '给对方时间',
      content: '表白后给对方思考的时间，不要强求立即回应。',
      priority: 'high',
      steps: [
        '① 表达后不要追问',
        '② 给予足够的时间',
        '③ 保持正常联系',
        '④ 接受任何结果',
      ],
    },
    {
      category: 'communication',
      title: '明确关系',
      content: '确认关系后明确彼此的期待，如是否公开、如何称呼、未来规划。',
      priority: 'high',
      steps: [
        '① 讨论关系的定义',
        '② 确定是否公开',
        '③ 商定称呼方式',
        '④ 规划近期发展',
      ],
    },
    {
      category: 'warning',
      title: '接受拒绝的可能',
      content: '要做好被拒绝的心理准备，以成熟的方式接受结果。',
      priority: 'medium',
      steps: [
        '① 做好心理准备',
        '② 不要纠缠或施压',
        '③ 保持风度和尊严',
        '④ 继续做好自己',
      ],
    },
  ];

  /**
   * 根据性别和阶段获取恋爱技巧
   */
  getTips(stage: RelationshipStage, gender: Gender): Tip[] {
    if (gender === 'other') {
      // 如果是其他性别，返回女生的技巧作为默认
      gender = 'female';
    }

    const key = `${stage}_${gender}`;
    const tipsMap: Record<string, Tip[]> = {
      'meeting_female': this.meetingFemale,
      'meeting_male': this.meetingMale,
      'knowing_female': this.knowingFemale,
      'knowing_male': this.knowingMale,
      'escalating_female': this.escalatingFemale,
      'escalating_male': this.escalatingMale,
      'intimate_female': this.intimateFemale,
      'intimate_male': this.intimateMale,
      'committed_female': this.committed,
      'committed_male': this.committed,
    };

    return tipsMap[key] || [];
  }

  /**
   * 获取技巧分类
   */
  getCategories(): Record<string, string> {
    return {
      chat: '聊天',
      date: '约会',
      communication: '沟通',
      gift: '礼物',
      warning: '注意',
    };
  }
}

// 导出单例
export const genderTipsRules = new GenderTipsRules();
