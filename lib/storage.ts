import { Profile, RelationshipStageData, Interaction, Strategy, StorageConfig, StorageMode } from '@/types';
import { SupabaseDatabase } from './supabase/database';

// 生成 UUID 的兼容函数
function generateId(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // 回退方案：生成一个类似 UUID 的字符串
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ==================== 存储键名定义 ====================

const STORAGE_KEYS = {
  CONFIG: 'lianai_config',
  PROFILES: 'lianai_profiles',
  STAGES: 'lianai_stages',
  INTERACTIONS: 'lianai_interactions',
  STRATEGIES: 'lianai_strategies',
} as const;

// ==================== 本地存储实现 ====================

class LocalStorage {
  // 获取存储模式配置
  getStorageConfig(): StorageConfig {
    if (typeof window === 'undefined') return { mode: 'local' };
    const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return data ? JSON.parse(data) : { mode: 'local' };
  }

  // 设置存储模式
  setStorageMode(mode: StorageMode): void {
    if (typeof window === 'undefined') return;
    const config: StorageConfig = { mode, lastSync: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }

  // ==================== Profile 操作 ====================

  getProfiles(): Profile[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      console.error('Failed to parse profiles data');
      return [];
    }
  }

  getProfileById(id: string): Profile | null {
    const profiles = this.getProfiles();
    return profiles.find(p => p.id === id) || null;
  }

  createProfile(profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>): Profile {
    const profiles = this.getProfiles();
    const newProfile: Profile = {
      ...profile,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    profiles.push(newProfile);
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    return newProfile;
  }

  updateProfile(id: string, updates: Partial<Profile>): Profile | null {
    const profiles = this.getProfiles();
    const index = profiles.findIndex(p => p.id === id);
    if (index === -1) return null;

    profiles[index] = {
      ...profiles[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    return profiles[index];
  }

  deleteProfile(id: string): boolean {
    let profiles = this.getProfiles();
    const initialLength = profiles.length;
    profiles = profiles.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));

    // 同时删除关联数据
    this.deleteRelationshipStage(id);
    this.deleteInteractionsByPersonId(id);
    this.deleteStrategy(id);

    return profiles.length < initialLength;
  }

  // ==================== RelationshipStage 操作 ====================

  getRelationshipStage(personId: string): RelationshipStageData | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.STAGES);
    if (!data) return null;
    try {
      const stages: RelationshipStageData[] = JSON.parse(data);
      return stages.find(s => s.personId === personId) || null;
    } catch {
      console.error('Failed to parse stages data');
      return null;
    }
  }

  setRelationshipStage(stageData: RelationshipStageData): void {
    if (typeof window === 'undefined') return;
    const data = localStorage.getItem(STORAGE_KEYS.STAGES);
    let stages: RelationshipStageData[] = [];
    if (data) {
      try {
        stages = JSON.parse(data);
      } catch {
        console.error('Failed to parse stages data');
        stages = [];
      }
    }

    const index = stages.findIndex(s => s.personId === stageData.personId);
    if (index >= 0) {
      stages[index] = stageData;
    } else {
      stages.push(stageData);
    }
    localStorage.setItem(STORAGE_KEYS.STAGES, JSON.stringify(stages));
  }

  updateRelationshipStage(personId: string, updates: Partial<RelationshipStageData>): RelationshipStageData | null {
    const stageData = this.getRelationshipStage(personId);
    if (!stageData) return null;

    const updated = { ...stageData, ...updates, updatedAt: new Date().toISOString() };
    this.setRelationshipStage(updated);
    return updated;
  }

  deleteRelationshipStage(personId: string): void {
    if (typeof window === 'undefined') return;
    const data = localStorage.getItem(STORAGE_KEYS.STAGES);
    let stages: RelationshipStageData[] = [];
    if (data) {
      try {
        stages = JSON.parse(data);
      } catch {
        console.error('Failed to parse stages data');
        stages = [];
      }
    }
    stages = stages.filter(s => s.personId !== personId);
    localStorage.setItem(STORAGE_KEYS.STAGES, JSON.stringify(stages));
  }

  // ==================== Interaction 操作 ====================

  getInteractions(personId?: string): Interaction[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.INTERACTIONS);
    let interactions: Interaction[] = data ? JSON.parse(data) : [];

    if (personId) {
      interactions = interactions.filter(i => i.personId === personId);
    }
    return interactions;
  }

  createInteraction(interaction: Omit<Interaction, 'id' | 'createdAt'>): Interaction {
    const interactions = this.getInteractions();
    const newInteraction: Interaction = {
      ...interaction,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    interactions.push(newInteraction);
    localStorage.setItem(STORAGE_KEYS.INTERACTIONS, JSON.stringify(interactions));
    return newInteraction;
  }

  deleteInteraction(id: string): boolean {
    let interactions = this.getInteractions();
    const initialLength = interactions.length;
    interactions = interactions.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.INTERACTIONS, JSON.stringify(interactions));
    return interactions.length < initialLength;
  }

  deleteInteractionsByPersonId(personId: string): void {
    let interactions = this.getInteractions();
    interactions = interactions.filter(i => i.personId !== personId);
    localStorage.setItem(STORAGE_KEYS.INTERACTIONS, JSON.stringify(interactions));
  }

  // ==================== Strategy 操作 ====================

  getStrategy(personId: string): Strategy | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.STRATEGIES);
    if (!data) return null;
    try {
      const strategies: Strategy[] = JSON.parse(data);
      return strategies.find(s => s.personId === personId) || null;
    } catch {
      console.error('Failed to parse strategies data');
      return null;
    }
  }

  setStrategy(strategy: Strategy): void {
    if (typeof window === 'undefined') return;
    const data = localStorage.getItem(STORAGE_KEYS.STRATEGIES);
    let strategies: Strategy[] = [];
    if (data) {
      try {
        strategies = JSON.parse(data);
      } catch {
        console.error('Failed to parse strategies data');
        strategies = [];
      }
    }

    const index = strategies.findIndex(s => s.personId === strategy.personId);
    if (index >= 0) {
      strategies[index] = strategy;
    } else {
      strategies.push(strategy);
    }
    localStorage.setItem(STORAGE_KEYS.STRATEGIES, JSON.stringify(strategies));
  }

  deleteStrategy(personId: string): void {
    if (typeof window === 'undefined') return;
    const data = localStorage.getItem(STORAGE_KEYS.STRATEGIES);
    let strategies: Strategy[] = [];
    if (data) {
      try {
        strategies = JSON.parse(data);
      } catch {
        console.error('Failed to parse strategies data');
        strategies = [];
      }
    }
    strategies = strategies.filter(s => s.personId !== personId);
    localStorage.setItem(STORAGE_KEYS.STRATEGIES, JSON.stringify(strategies));
  }

  // ==================== 工具方法 ====================

  clearAllData(): void {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  exportData(): string {
    const data: Record<string, unknown> = {};
    Object.entries(STORAGE_KEYS).forEach(([_, key]) => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          // If parsing fails, store as string
          data[key] = value;
        }
      }
    });
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      });
      return true;
    } catch {
      return false;
    }
  }
}

// ==================== Supabase 云端存储实现 ====================

class SupabaseStorage {
  // 获取存储模式配置
  getStorageConfig(): StorageConfig {
    return { mode: 'cloud', lastSync: new Date().toISOString() };
  }

  // 设置存储模式
  setStorageMode(mode: StorageMode): void {
    // Supabase 模式下不支持切换到本地
    console.warn('Cannot change storage mode when using Supabase');
  }

  // ==================== Profile 操作 ====================

  async getProfiles(): Promise<Profile[]> {
    return await SupabaseDatabase.getProfiles();
  }

  async getProfileById(id: string): Promise<Profile | null> {
    return await SupabaseDatabase.getProfileById(id);
  }

  async createProfile(profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>): Promise<Profile> {
    return await SupabaseDatabase.createProfile(profile);
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | null> {
    try {
      return await SupabaseDatabase.updateProfile(id, updates);
    } catch {
      return null;
    }
  }

  async deleteProfile(id: string): Promise<boolean> {
    try {
      await SupabaseDatabase.deleteProfile(id);
      return true;
    } catch {
      return false;
    }
  }

  // ==================== RelationshipStage 操作 ====================

  async getRelationshipStage(personId: string): Promise<RelationshipStageData | null> {
    return await SupabaseDatabase.getStageData(personId);
  }

  async setRelationshipStage(stageData: RelationshipStageData): Promise<void> {
    await SupabaseDatabase.saveStageData(stageData);
  }

  async updateRelationshipStage(personId: string, updates: Partial<RelationshipStageData>): Promise<RelationshipStageData | null> {
    const current = await this.getRelationshipStage(personId);
    if (!current) return null;

    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    await this.setRelationshipStage(updated);
    return updated;
  }

  async deleteRelationshipStage(personId: string): Promise<void> {
    // 在 Supabase 中，阶段数据会通过外键级联删除
    // 无需额外操作
  }

  // ==================== Interaction 操作 ====================
  // 注意：当前 Supabase schema 中未实现 interactions 表，暂时使用本地存储

  getInteractions(personId?: string): Interaction[] {
    // 回退到本地存储
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.INTERACTIONS);
    let interactions: Interaction[] = data ? JSON.parse(data) : [];

    if (personId) {
      interactions = interactions.filter(i => i.personId === personId);
    }
    return interactions;
  }

  createInteraction(interaction: Omit<Interaction, 'id' | 'createdAt'>): Interaction {
    // 回退到本地存储
    const interactions = this.getInteractions();
    const newInteraction: Interaction = {
      ...interaction,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    interactions.push(newInteraction);
    localStorage.setItem(STORAGE_KEYS.INTERACTIONS, JSON.stringify(interactions));
    return newInteraction;
  }

  deleteInteraction(id: string): boolean {
    let interactions = this.getInteractions();
    const initialLength = interactions.length;
    interactions = interactions.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.INTERACTIONS, JSON.stringify(interactions));
    return interactions.length < initialLength;
  }

  deleteInteractionsByPersonId(personId: string): void {
    let interactions = this.getInteractions();
    interactions = interactions.filter(i => i.personId !== personId);
    localStorage.setItem(STORAGE_KEYS.INTERACTIONS, JSON.stringify(interactions));
  }

  // ==================== Strategy 操作 ====================

  async getStrategy(personId: string): Promise<Strategy | null> {
    return await SupabaseDatabase.getStrategy(personId);
  }

  async setStrategy(strategy: Strategy): Promise<void> {
    await SupabaseDatabase.saveStrategy(strategy);
  }

  async deleteStrategy(personId: string): Promise<void> {
    // 在 Supabase 中，策略数据会通过外键级联删除
    // 无需额外操作
  }

  // ==================== 工具方法 ====================

  clearAllData(): void {
    // Supabase 模式下不支持清除所有数据
    // 用户需要通过账户设置来清除数据
    console.warn('Cannot clear all data when using Supabase');
  }

  exportData(): string {
    // Supabase 模式下不支持导出数据（除非从服务器获取）
    console.warn('Export not fully supported in Supabase mode');
    return '{}';
  }

  importData(jsonData: string): boolean {
    // Supabase 模式下不支持导入数据
    console.warn('Import not supported in Supabase mode');
    return false;
  }
}

// ==================== 存储服务实例 ====================

// 检查是否配置了 Supabase
function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// 根据配置选择存储实现
export const storage = isSupabaseConfigured()
  ? new SupabaseStorage()
  : new LocalStorage();

// ==================== 辅助函数 ====================

// 根据生日计算星座
export function calculateZodiac(birthday: string): import('@/types').ZodiacSign {
  const date = new Date(birthday);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const zodiacDates: [number, number, import('@/types').ZodiacSign][] = [
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
    const endDateDay = 20; // 简化处理

    if (month === startMonth && day >= startDay) return sign;
    if (month === endDateMonth && day <= 20) return sign;
  }

  return 'capricorn'; // 默认
}

// 计算年龄
export function calculateAge(birthday: string): number {
  const today = new Date();
  const birthDate = new Date(birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// 格式化日期
export function formatDate(dateString: string, format: 'short' | 'long' = 'short'): string {
  const date = new Date(dateString);
  if (format === 'short') {
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

// 格式化相对时间
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}月前`;
  return `${Math.floor(diffDays / 365)}年前`;
}
