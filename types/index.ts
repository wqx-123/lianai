// ==================== 基础类型 ====================

export type Gender = 'male' | 'female' | 'other';

export type ZodiacSign =
  | 'aries'       // 白羊座
  | 'taurus'      // 金牛座
  | 'gemini'      // 双子座
  | 'cancer'      // 巨蟹座
  | 'leo'         // 狮子座
  | 'virgo'       // 处女座
  | 'libra'       // 天秤座
  | 'scorpio'     // 天蝎座
  | 'sagittarius' // 射手座
  | 'capricorn'   // 摩羯座
  | 'aquarius'    // 水瓶座
  | 'pisces';     // 双鱼座

export type RelationshipStage =
  | 'meeting'     // 认识阶段
  | 'knowing'     // 了解阶段
  | 'escalating'  // 关系升级阶段
  | 'intimate'    // 亲密关系阶段
  | 'committed';  // 确认关系

export type MBTIType =
  | 'ISTJ' | 'ISFJ' | 'INFJ' | 'INTJ'
  | 'ISTP' | 'ISFP' | 'INFP' | 'INTP'
  | 'ESTP' | 'ESFP' | 'ENFP' | 'ENTP'
  | 'ESTJ' | 'ESFJ' | 'ENFJ' | 'ENTJ';

export type AttachmentStyle =
  | 'secure'      // 安全型
  | 'anxious'     // 焦虑型
  | 'avoidant'    // 回避型
  | 'disorganized'; // 混乱型

export type LoveLanguage =
  | 'words_of_affirmation'  // 肯定言辞
  | 'quality_time'          // 精心时刻
  | 'receiving_gifts'       // 接受礼物
  | 'acts_of_service'       // 服务行动
  | 'physical_touch';       // 身体接触

// ==================== 对象信息 ====================

export interface Profile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  birthday: string; // ISO date string
  zodiac: ZodiacSign;
  occupation: string;
  contact?: string; // 可选加密
  location?: string;
  interests: string[];
  personalityTags: string[];
  // 人物画像字段
  mbti?: MBTIType;
  attachmentStyle?: AttachmentStyle;
  loveLanguages?: LoveLanguage[];
  // 心动标记
  isFavorite?: boolean;
  appearance?: {
    height?: number;
    weight?: number;
    features?: string[];
  };
  socialMedia?: {
    platform: string;
    url: string;
  }[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== 阶段管理 ====================

export interface StageTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
}

export interface StageHistory {
  stage: RelationshipStage;
  enteredAt: string;
  exitedAt?: string;
  durationDays?: number;
  completedTasks: string[];
}

export interface StageProgress {
  tasksCompleted: number;
  totalTasks: number;
  percentage: number;
}

export interface RelationshipStageData {
  personId: string;
  currentStage: RelationshipStage;
  stageHistory: StageHistory[];
  stageProgress: Record<RelationshipStage, StageProgress>;
  currentTasks: StageTask[];
  updatedAt: string;
}

// ==================== 阶段内容库 ====================

export interface StageTip {
  category: 'chat' | 'date' | 'communication' | 'gift' | 'warning';
  title: string;
  content: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface MediaReference {
  type: 'movie' | 'tv' | 'anime' | 'other';
  title: string;
  description: string;
  scene: string;
  takeaway: string;
  videoUrl?: string; // 视频链接（本地路径或在线URL）
  videoType?: 'local' | 'youtube' | 'bilibili' | 'vimeo' | 'other'; // 视频类型
  videoPlatform?: 'youtube' | 'bilibili' | 'vimeo' | 'other'; // 视频平台（保留兼容）
}

export interface StageContent {
  stage: RelationshipStage;
  name: string;
  description: string;
  tips: StageTip[];
  mediaReferences: MediaReference[];
  tasks: Omit<StageTask, 'completed' | 'completedAt'>[];
  transitionConditions: string[];
}

// ==================== 星座分析 ====================

export interface ZodiacInfo {
  sign: ZodiacSign;
  name: string;
  nameEn: string;
  dateRange: string;
  element: 'fire' | 'earth' | 'air' | 'water';
  quality: 'cardinal' | 'fixed' | 'mutable';
  ruler: string;
  traits: {
    positive: string[];
    negative: string[];
  };
  love: {
    style: string;
    needs: string[];
    turnOns: string[];
    turnOffs: string[];
    compatibility: Record<ZodiacSign, number>;
  };
  communication: {
    style: string;
    bestApproach: string;
    avoid: string[];
  };
  luck: {
    colors: string[];
    numbers: number[];
    days: number[];
  };
}

export interface ZodiacAnalysis {
  sign: ZodiacSign;
  traits: string[];
  loveStyle: string;
  compatibilityScore: number;
  communicationStyle: string;
  warningBehaviors: string[];
}

// ==================== 画像分析 ====================

export interface PersonaAnalysis {
  mbti?: MBTIType;
  attachmentStyle?: AttachmentStyle;
  loveLanguages: LoveLanguage[];
  communicationStyle: string;
  socialStyle?: string;
  decisionMaking?: string;
}

// ==================== 互动记录 ====================

export type InteractionType =
  | 'chat'
  | 'call'
  | 'date'
  | 'gift'
  | 'other';

export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'file';
  url: string;
  name: string;
  size?: number;
  thumbnail?: string;
}

export interface Interaction {
  id: string;
  personId: string;
  type: InteractionType;
  title?: string;
  content?: string;
  attachments?: Attachment[];
  timestamp: string;
  description: string;
  notes?: string;
  mood?: 'positive' | 'neutral' | 'negative';
  createdAt: string;
  updatedAt?: string;
}

// ==================== 恋爱方案 ====================

export interface ActionItem {
  action: string;
  reason: string;
  timing?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface WeeklyPlan {
  goal: string;
  activities: WeeklyActivity[];
  expectedOutcomes: string[];
}

export interface WeeklyActivity {
  name: string;
  actionSteps: string[];
}

export interface Milestone {
  event: string;
  readiness: number;
  suggestion: string;
  timeframe?: string;
}

export interface Strategy {
  personId: string;
  currentStage: RelationshipStage;
  dailyActions: ActionItem[];
  weeklyPlan: WeeklyPlan;
  keyMilestones: Milestone[];
  warnings: string[];
  successProbability: number;
  generatedAt: string;
}

// ==================== 存储配置 ====================

export type StorageMode = 'local' | 'cloud';

export interface StorageConfig {
  mode: StorageMode;
  lastSync?: string;
}

// ==================== API 响应类型 ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ==================== 表单类型 ====================

export interface ProfileFormData {
  name: string;
  age: number;
  gender: Gender;
  birthday: string;
  zodiac?: ZodiacSign;
  occupation: string;
  contact?: string;
  location?: string;
  interests: string[];
  personalityTags: string[];
  mbti?: MBTIType;
  attachmentStyle?: AttachmentStyle;
  loveLanguages?: LoveLanguage[];
  isFavorite?: boolean;
  height?: number;
  weight?: number;
  notes?: string;
}

export interface StageTransitionData {
  fromStage: RelationshipStage;
  toStage: RelationshipStage;
  reason: string;
  timestamp: string;
}

// ==================== 筛选和搜索 ====================

export interface ProfileFilters {
  gender?: Gender;
  ageRange?: [number, number];
  zodiac?: ZodiacSign;
  stage?: RelationshipStage;
  search?: string;
}

export interface SortOption {
  field: 'name' | 'age' | 'createdAt' | 'updatedAt';
  order: 'asc' | 'desc';
}
