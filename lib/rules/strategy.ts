import { Profile, RelationshipStage, Strategy, RelationshipStageData, PersonaAnalysis, ZodiacAnalysis } from '@/types';
import stagesData from '@/data/stages.json';
import { zodiacRules } from './zodiac';
import { personaRules } from './persona';

type StagesDataMap = typeof stagesData;
type StageContent = StagesDataMap[keyof StagesDataMap];

/**
 * 恋爱方案规则引擎
 */
export class StrategyRules {
  private stages: StagesDataMap;

  constructor() {
    this.stages = stagesData as StagesDataMap;
  }

  /**
   * 获取阶段内容
   */
  getStageContent(stage: RelationshipStage): StageContent | null {
    return this.stages[stage] || null;
  }

  /**
   * 生成个性化恋爱方案
   */
  generateStrategy(params: {
    profile: Profile;
    stageData: RelationshipStageData;
    zodiacAnalysis?: ZodiacAnalysis;
    personaAnalysis?: PersonaAnalysis;
  }): Strategy {
    const { profile, stageData, zodiacAnalysis, personaAnalysis } = params;
    const currentStage = stageData.currentStage;
    const stageContent = this.getStageContent(currentStage);

    if (!stageContent) {
      return this.createDefaultStrategy(profile.id, currentStage);
    }

    const dailyActions = this.generateDailyActions(profile, stageContent, zodiacAnalysis, personaAnalysis);
    const weeklyPlan = this.generateWeeklyPlan(profile, stageContent, currentStage);
    const keyMilestones = this.generateKeyMilestones(stageData, stageContent);
    const warnings = this.generateWarnings(profile, stageContent, zodiacAnalysis);
    const successProbability = this.calculateSuccessProbability(stageData, zodiacAnalysis, personaAnalysis);

    return {
      personId: profile.id,
      currentStage,
      dailyActions,
      weeklyPlan,
      keyMilestones,
      warnings,
      successProbability,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * 生成每日行动建议
   */
  private generateDailyActions(
    profile: Profile,
    stageContent: StageContent,
    zodiacAnalysis?: ZodiacAnalysis,
    personaAnalysis?: PersonaAnalysis
  ) {
    const actions: Strategy['dailyActions'] = [];

    // 基于阶段的行动
    for (const tip of stageContent.tips) {
      if (tip.priority === 'high' || tip.priority === 'medium') {
        actions.push({
          action: tip.title,
          reason: tip.content,
          priority: tip.priority === 'high' ? 'high' : 'medium',
        });
      }
    }

    // 基于星座的个性化建议
    if (zodiacAnalysis) {
      const loveAdvice = zodiacRules.getLoveAdvice(profile.zodiac);
      actions.push({
        action: '了解对方的星座特点',
        reason: loveAdvice.join('；'),
        priority: 'medium',
      });
    }

    // 基于爱语类型的建议
    if (personaAnalysis?.loveLanguages) {
      const langActions = personaRules.getLoveLanguageActions(personaAnalysis.loveLanguages);
      for (const action of langActions.slice(0, 3)) {
        actions.push({
          action,
          reason: `对方的主要爱语是这种方式`,
          priority: 'medium',
        });
      }
    }

    // 基于兴趣的聊天话题
    if (profile.interests.length > 0) {
      actions.push({
        action: `聊聊${profile.interests.slice(0, 2).join('、')}等话题`,
        reason: '根据对方的兴趣爱好选择话题',
        priority: 'low',
      });
    }

    return actions;
  }

  /**
   * 生成每周计划
   */
  private generateWeeklyPlan(profile: Profile, stageContent: StageContent, currentStage: RelationshipStage) {
    const goals: Record<RelationshipStage, string> = {
      meeting: '建立初步印象，留下好印象',
      knowing: '深入了解，发现共同点',
      escalating: '增加暧昧，试探心意',
      intimate: '加深情感连接，建立信任',
      committed: '维护关系，共同成长',
    };

    // 每个活动的具体行动方案
    const activitySteps: Record<string, string[]> = {
      // 认识阶段
      '喝咖啡聊天': [
        '提前挑选环境舒适、安静的咖啡厅',
        '准备2-3个轻松的破冰话题（天气、美食、旅行等）',
        '注意倾听，适时提出延伸性问题',
        '控制在1-2小时内，留下期待下次见面的空间',
      ],
      '参观展览': [
        '选择对方感兴趣的展览（艺术、科技、历史等）',
        '提前了解展览亮点，准备相关话题',
        '展览后找咖啡厅休息交流感想',
        '可以借此了解对方的审美和价值观',
      ],
      '散步聊天': [
        '选择风景好、人流适中的公园或河岸',
        '准备一些轻松的话题，避免冷场',
        '注意对方反应，适时调整聊天节奏',
        '可以自然地分享一些个人小故事',
      ],
      // 了解阶段
      '看电影': [
        '选择双方都感兴趣的电影类型',
        '电影后找地方讨论剧情和感想',
        '通过电影话题了解对方的价值观',
        '可以聊聊对角色的看法，了解性格倾向',
      ],
      '品尝美食': [
        '根据对方口味选择餐厅（辣、清淡等）',
        '可以尝试新开的特色餐厅',
        '分享彼此的美食喜好和回忆',
        '可以约定下次一起尝试其他美食',
      ],
      '运动健身': [
        '选择轻松的运动（保龄球、羽毛球、游泳）',
        '运动后一起吃健康的轻食',
        '可以展现阳光积极的一面',
        '运动中自然互动，增进默契',
      ],
      // 关系升级阶段
      '浪漫晚餐': [
        '选择有氛围、环境优雅的餐厅',
        '提前预订靠窗或安静的位置',
        '准备一些话题，避免尴尬沉默',
        '晚餐后可以散步，延长相处时间',
      ],
      '看夜景': [
        '选择视野好的地点（山顶、江边、观景台）',
        '可以准备小零食或饮料',
        '夜晚更容易产生浪漫氛围',
        '适合聊一些更深入的话题',
      ],
      '主题乐园': [
        '一起玩刺激的项目，增加心跳感',
        '排队时可以聊天互动',
        '拍一些合影，留下美好回忆',
        '可以展现照顾对方的一面',
      ],
      '增加暧昧话题（女生）': [
        '聊聊理想型：询问TA对另一半的期待， subtly 将自己往那个方向靠拢',
        '试探心意：问"有没有人追你""你觉得我们是什么关系"',
        '表达依赖：说"和你在一起很开心""最近总觉得想找你聊天"',
        '假设场景：问"如果我们在一起，你会想做什么"',
        '分享秘密：说一些只告诉TA的事情，增加TA的特殊感',
      ],
      '增加暧昧话题（男生）': [
        '眼神交流：说话时注视TA的眼睛，保持比平时更久的视线',
        '赞美细节：夸TA今天的穿搭、发型等细节，显示你很关注TA',
        '试探频率：问"你平时喜欢和什么样的男生聊天"',
        '创造回忆：提到你们之前的互动"上次和你做XX真的很开心"',
        '适度吃醋：提及其他异性时表现一点点在意',
      ],
      '增加肢体接触（女生）': [
        '自然触碰：过马路时轻轻拉住TA的胳膊，过完松开',
        '整理衣物：帮TA整理衣领、擦掉脸上的东西等自然动作',
        '借力靠近：累了靠在TA肩膀上，或走路时偶尔碰到肩膀',
        '温度测试：把手放到TA面前说"我手冷"，看TA反应',
        '借用物品：用TA的手机、戴TA的围巾等，增加亲密感',
      ],
      '增加肢体接触（男生）': [
        '绅士引导：手轻轻放在TA背部引导方向，而非直接拉手',
        '保护姿态：过马路或人多时自然护在TA外侧',
        '温度测试：问TA冷不冷，把外套给TA披上',
        '帮助动作：帮TA开门、提东西、拉椅子等绅士行为',
        '试探升级：一起走路时手偶尔碰到TA的手，观察反应',
      ],
      // 亲密关系阶段
      '短途旅行': [
        '选择1-2天的周边游目的地',
        '共同规划行程，增加参与感',
        '旅行中更容易看到真实的一面',
        '创造独特的共同回忆',
      ],
      '在家做饭': [
        '一起买菜，体验生活气息',
        '分工合作，增加互动',
        '可以边做边聊，氛围轻松',
        '共同享受劳动成果，增进亲密感',
      ],
      '深度交流': [
        '选择安静私密的环境',
        '分享一些小时候的经历或秘密',
        '聊聊对未来的规划和期望',
        '真诚表达对对方的欣赏和感谢',
      ],
      // 确认关系阶段
      '规划未来': [
        '聊聊未来1-3年的计划和目标',
        '讨论彼此对关系的期待',
        '可以提及一些共同愿景',
        '尊重对方的想法和节奏',
      ],
      '见家长': [
        '提前了解对方家长的喜好',
        '准备得体的着装和小礼物',
        '表现礼貌和真诚',
        '见面后和对方交流感受',
      ],
      '共同兴趣活动': [
        '一起参与双方都喜欢的活动',
        '可以培养新的共同爱好',
        '在活动中展现默契和配合',
        '让关系更加稳定和有趣',
      ],
      // 兴趣类
      '周边游': [
        '选择1-2小时车程的目的地',
        '提前查看天气和攻略',
        '准备一些零食和音乐',
        '拍照留念，记录美好时光',
      ],
      '探店打卡': [
        '寻找评价好的新开店铺',
        '可以拍照片发朋友圈',
        '分享对食物的体验',
        '发现更多共同喜好',
      ],
    };

    // 根据阶段推荐活动
    const stageActivities: Record<RelationshipStage, string[]> = {
      meeting: ['喝咖啡聊天', '参观展览', '散步聊天'],
      knowing: ['看电影', '品尝美食', '运动健身'],
      escalating: ['浪漫晚餐', '看夜景', '主题乐园'],
      intimate: ['短途旅行', '在家做饭', '深度交流'],
      committed: ['规划未来', '见家长', '共同兴趣活动'],
    };

    let activities = stageActivities[currentStage].map(name => ({
      name,
      actionSteps: activitySteps[name] || [],
    }));

    // 关系升级阶段额外添加性别特定的活动
    if (currentStage === 'escalating') {
      const gender = profile.gender || 'female';
      if (gender === 'female') {
        // 对象是女生，添加追女生的暧昧话题和肢体接触方法
        activities.push({
          name: '增加暧昧话题',
          actionSteps: activitySteps['增加暧昧话题（女生）'] || [],
        });
        activities.push({
          name: '增加肢体接触',
          actionSteps: activitySteps['增加肢体接触（女生）'] || [],
        });
      } else if (gender === 'male') {
        // 对象是男生，添加追男生的暧昧话题和肢体接触方法
        activities.push({
          name: '增加暧昧话题',
          actionSteps: activitySteps['增加暧昧话题（男生）'] || [],
        });
        activities.push({
          name: '增加肢体接触',
          actionSteps: activitySteps['增加肢体接触（男生）'] || [],
        });
      } else {
        // 其他性别，默认使用女生版本
        activities.push({
          name: '增加暧昧话题',
          actionSteps: activitySteps['增加暧昧话题（女生）'] || [],
        });
        activities.push({
          name: '增加肢体接触',
          actionSteps: activitySteps['增加肢体接触（女生）'] || [],
        });
      }
    }

    // 基于兴趣添加活动
    if (profile.interests.includes('旅行')) {
      activities.push({
        name: '周边游',
        actionSteps: activitySteps['周边游'] || [],
      });
    }
    if (profile.interests.includes('美食')) {
      activities.push({
        name: '探店打卡',
        actionSteps: activitySteps['探店打卡'] || [],
      });
    }
    if (profile.interests.includes('运动')) {
      activities.push({
        name: '运动健身',
        actionSteps: activitySteps['运动健身'] || [],
      });
    }

    return {
      goal: goals[currentStage],
      activities: activities.slice(0, 4),
      expectedOutcomes: [
        '增进彼此了解',
        '创造美好回忆',
        '加深情感连接',
      ],
    };
  }

  /**
   * 生成关键节点
   */
  private generateKeyMilestones(stageData: RelationshipStageData, stageContent: StageContent) {
    const milestones: Strategy['keyMilestones'] = [];
    const currentStageIndex = this.getStageIndex(stageData.currentStage);
    const allStages: RelationshipStage[] = ['meeting', 'knowing', 'escalating', 'intimate', 'committed'];

    // 当前阶段任务完成度
    const progress = stageData.stageProgress?.[stageData.currentStage];
    if (progress) {
      const readiness = Math.round(progress.percentage);
      let suggestion = '';

      if (readiness < 40) {
        suggestion = '继续努力完成当前阶段的任务';
      } else if (readiness < 70) {
        suggestion = '进展不错，继续保持';
      } else if (readiness < 100) {
        suggestion = '即将完成当前阶段，准备进入下一阶段';
      } else {
        suggestion = '可以准备进入下一个阶段了';
      }

      milestones.push({
        event: `完成${stageContent.name}的所有任务`,
        readiness,
        suggestion,
      });
    }

    // 下一阶段预告
    if (currentStageIndex < allStages.length - 1) {
      const nextStage = allStages[currentStageIndex + 1];
      const nextStageContent = this.getStageContent(nextStage);
      if (nextStageContent) {
        milestones.push({
          event: `进入${nextStageContent.name}`,
          readiness: Math.min(100, Math.round((progress?.percentage || 0) * 0.8)),
          suggestion: nextStageContent.transitionConditions.join('；'),
          timeframe: '预计1-2周后',
        });
      }
    }

    // 表白时机（针对escalating和intimate阶段）
    if (stageData.currentStage === 'escalating') {
      milestones.push({
        event: '表白时机',
        readiness: 60,
        suggestion: '建议等到intimate阶段再表白，成功率更高',
        timeframe: '观察1-2周',
      });
    }

    return milestones;
  }

  /**
   * 生成警告
   */
  private generateWarnings(profile: Profile, stageContent: StageContent, zodiacAnalysis?: ZodiacAnalysis) {
    const warnings: string[] = [];

    // 从阶段提示中提取警告
    for (const tip of stageContent.tips) {
      if (tip.category === 'warning') {
        warnings.push(tip.content);
      }
    }

    // 星座相关警告
    if (zodiacAnalysis?.warningBehaviors) {
      warnings.push(...zodiacAnalysis.warningBehaviors.map(w => `避免：${w}`));
    }

    // 通用警告
    warnings.push('尊重对方的边界和节奏');
    warnings.push('保持真实的自己，不要过度伪装');

    return warnings;
  }

  /**
   * 计算成功概率
   */
  private calculateSuccessProbability(
    stageData: RelationshipStageData,
    zodiacAnalysis?: ZodiacAnalysis,
    personaAnalysis?: PersonaAnalysis
  ): number {
    let probability = 50;

    // 基于阶段进度
    const progress = stageData.stageProgress?.[stageData.currentStage];
    if (progress) {
      probability += Math.round(progress.percentage * 0.3);
    }

    // 基于星座配对（如果有对方信息）
    if (zodiacAnalysis?.compatibilityScore) {
      probability = Math.round((probability + zodiacAnalysis.compatibilityScore) / 2);
    }

    // 基于依恋类型
    if (personaAnalysis?.attachmentStyle === 'secure') {
      probability += 10;
    } else if (personaAnalysis?.attachmentStyle === 'anxious' || personaAnalysis?.attachmentStyle === 'avoidant') {
      probability -= 5;
    }

    return Math.min(95, Math.max(20, probability));
  }

  /**
   * 创建默认方案
   */
  private createDefaultStrategy(personId: string, currentStage: RelationshipStage): Strategy {
    return {
      personId,
      currentStage,
      dailyActions: [
        {
          action: '保持真诚和尊重',
          reason: '任何关系的基础',
          priority: 'high',
        },
        {
          action: '多倾听对方',
          reason: '了解对方的需求和想法',
          priority: 'high',
        },
      ],
      weeklyPlan: {
        goal: '增进了解和感情',
        activities: ['聊天交流', '一起做事'],
        expectedOutcomes: ['了解对方', '拉近距离'],
      },
      keyMilestones: [],
      warnings: ['保持耐心', '尊重对方'],
      successProbability: 50,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * 获取阶段索引
   */
  private getStageIndex(stage: RelationshipStage): number {
    const stages: RelationshipStage[] = ['meeting', 'knowing', 'escalating', 'intimate', 'committed'];
    return stages.indexOf(stage);
  }

  /**
   * 获取阶段任务列表
   */
  getStageTasks(stage: RelationshipStage): Array<{ id: string; title: string; description?: string }> {
    const content = this.getStageContent(stage);
    return content?.tasks || [];
  }

  /**
   * 获取阶段提示列表
   */
  getStageTips(stage: RelationshipStage) {
    const content = this.getStageContent(stage);
    return content?.tips || [];
  }

  /**
   * 获取阶段媒体参考
   */
  getStageMediaReferences(stage: RelationshipStage) {
    const content = this.getStageContent(stage);
    return content?.mediaReferences || [];
  }

  /**
   * 检查是否可以切换到下一阶段
   */
  canTransitionToNext(stageData: RelationshipStageData): { canTransition: boolean; reasons: string[] } {
    const currentStage = stageData.currentStage;
    const content = this.getStageContent(currentStage);

    if (!content) {
      return { canTransition: false, reasons: ['无法获取阶段信息'] };
    }

    const progress = stageData.stageProgress?.[currentStage];
    const reasons: string[] = [];
    let canTransition = true;

    // 检查任务完成度
    if (progress && progress.percentage < 70) {
      canTransition = false;
      reasons.push(`当前阶段任务完成度仅${progress.percentage}%，建议达到70%以上`);
    }

    // 检查切换条件
    for (const condition of content.transitionConditions) {
      reasons.push(condition);
    }

    return { canTransition, reasons: content.transitionConditions };
  }
}

// 导出单例
export const strategyRules = new StrategyRules();
