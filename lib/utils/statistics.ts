import { Interaction, RelationshipStage, RelationshipStageData } from '@/types';

export interface InteractionStats {
  total: number;
  byType: Record<string, number>;
  byMood: Record<string, number>;
  frequencyTimeline: Array<{ date: string; count: number }>;
  averageFrequency: number; // 每周平均互动次数
}

export interface StageDuration {
  stage: RelationshipStage;
  duration: number; // 天数
  startDate: string;
  endDate?: string;
}

// 计算互动统计
export function calculateInteractionStats(interactions: Interaction[]): InteractionStats {
  // 按类型统计
  const byType: Record<string, number> = {
    chat: 0,
    call: 0,
    date: 0,
    gift: 0,
    other: 0,
  };
  interactions.forEach((i) => {
    byType[i.type] = (byType[i.type] || 0) + 1;
  });

  // 按情绪统计
  const byMood: Record<string, number> = {
    positive: 0,
    neutral: 0,
    negative: 0,
    none: 0,
  };
  interactions.forEach((i) => {
    if (i.mood) {
      byMood[i.mood]++;
    } else {
      byMood.none++;
    }
  });

  // 按日期统计（最近30天）
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const dailyCounts: Record<string, number> = {};

  interactions.forEach((i) => {
    const date = new Date(i.timestamp);
    if (date >= thirtyDaysAgo) {
      const dateStr = date.toISOString().split('T')[0];
      dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;
    }
  });

  const frequencyTimeline = Object.entries(dailyCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // 计算平均频率（每周互动次数）
  const daysWithData = Object.keys(dailyCounts).length || 1;
  const totalRecent = Object.values(dailyCounts).reduce((sum, count) => sum + count, 0);
  const averageFrequency = Math.round((totalRecent / daysWithData) * 7);

  return {
    total: interactions.length,
    byType,
    byMood,
    frequencyTimeline,
    averageFrequency,
  };
}

// 计算阶段停留时长
export function calculateStageDurations(stageData: RelationshipStageData): StageDuration[] {
  const durations: StageDuration[] = [];
  const history = stageData.stageHistory || [];

  history.forEach((entry, index) => {
    const startDate = new Date(entry.enteredAt);
    const endDate = entry.exitedAt ? new Date(entry.exitedAt) : new Date();
    const durationInDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    durations.push({
      stage: entry.stage,
      duration: durationInDays,
      startDate: entry.enteredAt,
      endDate: entry.exitedAt,
    });
  });

  // 添加当前阶段
  if (stageData.currentStage) {
    const currentEntry = history[history.length - 1];
    if (currentEntry) {
      const startDate = new Date(currentEntry.enteredAt);
      const durationInDays = Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      // 如果当前阶段已经添加过，更新它
      const existingIndex = durations.findIndex(d => d.stage === stageData.currentStage);
      if (existingIndex >= 0) {
        durations[existingIndex].duration = durationInDays;
        durations[existingIndex].endDate = undefined;
      } else {
        durations.push({
          stage: stageData.currentStage,
          duration: durationInDays,
          startDate: currentEntry.enteredAt,
        });
      }
    }
  }

  return durations;
}

// 获取阶段名称
export function getStageName(stage: RelationshipStage): string {
  const stageNames: Record<RelationshipStage, string> = {
    meeting: '认识阶段',
    knowing: '了解阶段',
    escalating: '关系升级',
    intimate: '亲密关系',
    committed: '确认关系',
  };
  return stageNames[stage] || stage;
}

// 获取情绪标签
export function getMoodLabel(mood: string): string {
  const moodLabels: Record<string, string> = {
    positive: '积极',
    neutral: '中性',
    negative: '消极',
    none: '未标记',
  };
  return moodLabels[mood] || mood;
}

// 获取互动类型标签
export function getInteractionTypeLabel(type: string): string {
  const typeLabels: Record<string, string> = {
    chat: '聊天',
    call: '通话',
    date: '约会',
    gift: '礼物',
    other: '其他',
  };
  return typeLabels[type] || type;
}
