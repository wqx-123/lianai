import { ZodiacSign, ZodiacAnalysis } from '@/types';
import zodiacData from '@/data/zodiac.json';

type ZodiacDataMap = typeof zodiacData;
type ZodiacInfo = ZodiacDataMap[keyof ZodiacDataMap];

/**
 * 星座规则引擎
 */
export class ZodiacRules {
  private data: ZodiacDataMap;

  constructor() {
    this.data = zodiacData as ZodiacDataMap;
  }

  /**
   * 获取星座信息
   */
  getZodiacInfo(sign: ZodiacSign): ZodiacInfo | undefined {
    return this.data[sign];
  }

  /**
   * 获取所有星座列表
   */
  getAllSigns(): { sign: ZodiacSign; name: string; nameEn: string }[] {
    return Object.values(this.data).map(info => ({
      sign: info.sign as ZodiacSign,
      name: info.name,
      nameEn: info.nameEn,
    }));
  }

  /**
   * 分析星座
   */
  analyze(sign: ZodiacSign): ZodiacAnalysis | undefined {
    const info = this.getZodiacInfo(sign);
    if (!info) return undefined;

    return {
      sign: info.sign as ZodiacSign,
      traits: [...info.traits.positive, ...info.traits.negative.slice(0, 2)],
      loveStyle: info.love.style,
      compatibilityScore: 75, // 默认分数，实际需要两个人的星座对比
      communicationStyle: info.communication.style,
      warningBehaviors: info.communication.avoid,
    };
  }

  /**
   * 计算两个星座的配对指数
   */
  getCompatibility(sign1: ZodiacSign, sign2: ZodiacSign): number {
    const info1 = this.getZodiacInfo(sign1);
    if (!info1) return 50;

    return info1.love.compatibility[sign2] || 50;
  }

  /**
   * 获取恋爱建议
   */
  getLoveAdvice(sign: ZodiacSign): string[] {
    const info = this.getZodiacInfo(sign);
    if (!info) return [];

    return [
      `恋爱风格：${info.love.style}`,
      `沟通方式：${info.communication.style}`,
      `最佳方式：${info.communication.bestApproach}`,
      `需要：${info.love.needs.join('、')}`,
      `偏好：${info.love.turnOns.join('、')}`,
      `避免：${info.communication.avoid.join('、')}`,
    ];
  }

  /**
   * 获取幸运信息
   */
  getLuckInfo(sign: ZodiacSign): { colors: string[]; numbers: number[]; days: number[] } | undefined {
    const info = this.getZodiacInfo(sign);
    if (!info) return undefined;

    return {
      colors: info.luck.colors,
      numbers: info.luck.numbers,
      days: info.luck.days,
    };
  }

  /**
   * 根据日期计算星座
   */
  calculateZodiacFromDate(date: Date): ZodiacSign {
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // 星座日期范围 [月, 日, 星座]
    const zodiacDates: [number, number, ZodiacSign][] = [
      [3, 21, 'aries'],
      [4, 20, 'taurus'],
      [5, 21, 'gemini'],
      [6, 22, 'cancer'],
      [7, 23, 'leo'],
      [8, 23, 'virgo'],
      [9, 23, 'libra'],
      [10, 24, 'scorpio'],
      [11, 23, 'sagittarius'],
      [12, 22, 'capricorn'],
      [1, 20, 'aquarius'],
      [2, 19, 'pisces'],
    ];

    for (const [startMonth, startDay, sign] of zodiacDates) {
      const endDateMonth = startMonth === 12 ? 1 : startMonth + 1;
      const endDateDay = 20;

      if ((month === startMonth && day >= startDay) || (month === endDateMonth && day <= endDateDay)) {
        return sign;
      }
    }

    return 'capricorn';
  }

  /**
   * 获取星座元素分类
   */
  getElement(sign: ZodiacSign): 'fire' | 'earth' | 'air' | 'water' | undefined {
    const info = this.getZodiacInfo(sign);
    return info?.element as 'fire' | 'earth' | 'air' | 'water' | undefined;
  }

  /**
   * 判断两个星座是否元素相容
   */
  isElementCompatible(sign1: ZodiacSign, sign2: ZodiacSign): boolean {
    const element1 = this.getElement(sign1);
    const element2 = this.getElement(sign2);

    if (!element1 || !element2) return false;

    // 同元素相容
    if (element1 === element2) return true;

    // 相容的元素组合
    const compatibleElements: Record<string, string[]> = {
      fire: ['air'],
      air: ['fire', 'water'],
      water: ['earth', 'air'],
      earth: ['water'],
    };

    return compatibleElements[element1]?.includes(element2) || false;
  }
}

// 导出单例
export const zodiacRules = new ZodiacRules();
