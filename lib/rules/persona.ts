import { MBTIType, AttachmentStyle, LoveLanguage, PersonaAnalysis } from '@/types';
import personasData from '@/data/personas.json';

type PersonasDataMap = typeof personasData;

/**
 * 画像规则引擎
 */
export class PersonaRules {
  private data: PersonasDataMap;

  constructor() {
    this.data = personasData as PersonasDataMap;
  }

  /**
   * 获取 MBTI 信息
   */
  getMBTIInfo(type: MBTIType) {
    return this.data.mbti[type] || null;
  }

  /**
   * 获取所有 MBTI 类型
   */
  getAllMBTITypes(): { type: MBTIType; name: string }[] {
    return Object.entries(this.data.mbti).map(([type, info]: [string, any]) => ({
      type: type as MBTIType,
      name: info.name,
    }));
  }

  /**
   * 获取依恋类型信息
   */
  getAttachmentStyleInfo(style: AttachmentStyle) {
    return this.data.attachmentStyles[style] || null;
  }

  /**
   * 获取所有依恋类型
   */
  getAllAttachmentStyles(): { style: AttachmentStyle; name: string }[] {
    return Object.entries(this.data.attachmentStyles).map(([style, info]: [string, any]) => ({
      style: style as AttachmentStyle,
      name: info.name,
    }));
  }

  /**
   * 获取爱语类型信息
   */
  getLoveLanguageInfo(lang: LoveLanguage) {
    return this.data.loveLanguages[lang] || null;
  }

  /**
   * 获取所有爱语类型
   */
  getAllLoveLanguages(): { lang: LoveLanguage; name: string; description: string }[] {
    return Object.entries(this.data.loveLanguages).map(([lang, info]: [string, any]) => ({
      lang: lang as LoveLanguage,
      name: info.name,
      description: info.description,
    }));
  }

  /**
   * 分析人物画像
   */
  analyzePersona(params: {
    mbti?: MBTIType;
    attachmentStyle?: AttachmentStyle;
    loveLanguages: LoveLanguage[];
  }): PersonaAnalysis {
    const { mbti, attachmentStyle, loveLanguages } = params;

    let communicationStyle = '';
    let socialStyle = '';

    // 基于 MBTI 获取沟通风格
    if (mbti) {
      const mbtiInfo = this.getMBTIInfo(mbti);
      if (mbtiInfo) {
        communicationStyle = mbtiInfo.communicationStyle;
        socialStyle = mbtiInfo.traits.join('、');
      }
    }

    // 基于依恋类型调整沟通建议
    if (attachmentStyle) {
      const attachInfo = this.getAttachmentStyleInfo(attachmentStyle);
      if (attachInfo && attachInfo.bestApproach) {
        communicationStyle += ` ${attachInfo.bestApproach}`;
      }
    }

    return {
      mbti,
      attachmentStyle,
      loveLanguages,
      communicationStyle: communicationStyle || '温和友善，注重感受',
      socialStyle,
    };
  }

  /**
   * 获取 MBTI 相容性建议
   */
  getMBTICompatibility(type1: MBTIType, type2: MBTIType): { score: number; advice: string } {
    const info1 = this.getMBTIInfo(type1);
    const info2 = this.getMBTIInfo(type2);

    if (!info1 || !info2) {
      return { score: 50, advice: '无法分析 MBTI 相容性' };
    }

    // 基于 MBTI 理论计算相容性
    let score = 50;

    // E/I 相反通常更有吸引力
    const e1 = type1[0] === 'E';
    const e2 = type2[0] === 'E';
    if (e1 !== e2) score += 10;

    // S/N 相同通常更容易理解
    const s1 = type1[1] === 'S';
    const s2 = type2[1] === 'S';
    if (s1 === s2) score += 15;

    // T/F 相反通常互补
    const t1 = type1[2] === 'T';
    const t2 = type2[2] === 'T';
    if (t1 !== t2) score += 10;

    // J/P 相同通常生活方式更协调
    const j1 = type1[3] === 'J';
    const j2 = type2[3] === 'J';
    if (j1 === j2) score += 15;

    score = Math.min(100, Math.max(0, score));

    let advice = '';
    if (score >= 80) {
      advice = '你们的人格类型非常匹配，相处会很和谐！';
    } else if (score >= 60) {
      advice = '你们的人格类型有一定互补性，需要互相理解和适应。';
    } else {
      advice = '你们的人格类型差异较大，需要更多的沟通和包容。';
    }

    return { score, advice };
  }

  /**
   * 根据爱语类型获取行动建议
   */
  getLoveLanguageActions(languages: LoveLanguage[]): string[] {
    const actions: string[] = [];

    for (const lang of languages) {
      const info = this.getLoveLanguageInfo(lang);
      if (info && info.bestActions) {
        actions.push(...info.bestActions);
      }
    }

    return actions;
  }

  /**
   * 根据依恋类型获取相处建议
   */
  getAttachmentAdvice(style: AttachmentStyle): string[] {
    const info = this.getAttachmentStyleInfo(style);
    if (!info) return [];

    return [
      `恋爱风格：${info.description}`,
      `特征：${info.traits.join('、')}`,
      `最佳方式：${info.bestApproach}`,
    ];
  }

  /**
   * 获取兴趣标签列表
   */
  getInterestTags(): { common: string[]; personalityTags: string[] } {
    return {
      common: this.data.interests.common,
      personalityTags: this.data.interests.personalityTags,
    };
  }

  /**
   * 推荐聊天话题
   */
  getChatTopics(persona: PersonaAnalysis): string[] {
    const topics: string[] = [];

    // 基于 MBTI 推荐话题
    if (persona.mbti) {
      const info = this.getMBTIInfo(persona.mbti);
      if (info) {
        if (persona.mbti.includes('N')) {
          topics.push('未来的梦想和规划', '人生哲学', '抽象概念讨论');
        } else {
          topics.push('日常生活', '实际事务', '具体计划');
        }
        if (persona.mbti.includes('F')) {
          topics.push('情感话题', '人际关系', '价值观');
        } else {
          topics.push('逻辑分析', '问题解决', '知识分享');
        }
      }
    }

    // 基于爱语推荐活动
    for (const lang of persona.loveLanguages) {
      const info = this.getLoveLanguageInfo(lang);
      if (info && info.examples) {
        topics.push(...info.examples.slice(0, 2));
      }
    }

    return topics.length > 0 ? topics : ['兴趣爱好', '日常生活', '未来规划'];
  }

  /**
   * 获取约会建议
   */
  getDateIdeas(persona: PersonaAnalysis): string[] {
    const ideas: string[] = [];

    // 基于 MBTI 推荐约会活动
    if (persona.mbti) {
      const info = this.getMBTIInfo(persona.mbti);
      if (info) {
        if (persona.mbti.includes('E')) {
          ideas.push('热闹的社交活动', '群体运动', '户外探险');
        } else {
          ideas.push('安静的书店', '私人影院', '家里做饭');
        }
        if (persona.mbti.includes('S')) {
          ideas.push('动手体验', '美食品尝', '户外活动');
        } else {
          ideas.push('艺术展览', '哲学讨论', '创意工作坊');
        }
      }
    }

    return ideas.length > 0 ? ideas : ['咖啡厅聊天', '看电影', '散步'];
  }
}

// 导出单例
export const personaRules = new PersonaRules();
