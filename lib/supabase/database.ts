'use client'

import { createClient } from './client'
import type {
  Profile,
  RelationshipStageData,
  Strategy,
  Interaction,
} from '@/types'

/**
 * Supabase 数据库访问层
 * 封装所有数据库操作，提供类型安全的 API
 */
export class SupabaseDatabase {
  // ==================== 认证相关 ====================

  /**
   * 获取当前登录用户
   */
  static async getCurrentUser() {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  }

  /**
   * 检查用户是否已登录
   */
  static async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return user !== null
  }

  // ==================== Profiles CRUD ====================

  /**
   * 获取当前用户的所有对象资料
   */
  static async getProfiles(): Promise<Profile[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Profile[]
  }

  /**
   * 根据 ID 获取单个对象资料
   */
  static async getProfileById(id: string): Promise<Profile | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data as Profile
  }

  /**
   * 创建新的对象资料
   */
  static async createProfile(
    profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Profile> {
    const supabase = createClient()
    const user = await this.getCurrentUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // 转换字段名以匹配数据库
    const dbData = {
      user_id: user.id,
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      birthday: profile.birthday,
      zodiac: profile.zodiac,
      occupation: profile.occupation,
      contact: profile.contact,
      location: profile.location,
      interests: profile.interests,
      personality_tags: profile.personalityTags,
      mbti: profile.mbti,
      attachment_style: profile.attachmentStyle,
      love_languages: profile.loveLanguages,
      is_favorite: profile.isFavorite || false,
      appearance: profile.appearance,
      social_media: profile.socialMedia,
      notes: profile.notes,
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert(dbData)
      .select()
      .single()

    if (error) throw error
    return this.mapDbProfileToProfile(data as any)
  }

  /**
   * 更新对象资料
   */
  static async updateProfile(
    id: string,
    updates: Partial<Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Profile> {
    const supabase = createClient()

    // 转换字段名
    const dbUpdates: any = {}
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.age !== undefined) dbUpdates.age = updates.age
    if (updates.gender !== undefined) dbUpdates.gender = updates.gender
    if (updates.birthday !== undefined) dbUpdates.birthday = updates.birthday
    if (updates.zodiac !== undefined) dbUpdates.zodiac = updates.zodiac
    if (updates.occupation !== undefined) dbUpdates.occupation = updates.occupation
    if (updates.contact !== undefined) dbUpdates.contact = updates.contact
    if (updates.location !== undefined) dbUpdates.location = updates.location
    if (updates.interests !== undefined) dbUpdates.interests = updates.interests
    if (updates.personalityTags !== undefined) dbUpdates.personality_tags = updates.personalityTags
    if (updates.mbti !== undefined) dbUpdates.mbti = updates.mbti
    if (updates.attachmentStyle !== undefined) dbUpdates.attachment_style = updates.attachmentStyle
    if (updates.loveLanguages !== undefined) dbUpdates.love_languages = updates.loveLanguages
    if (updates.isFavorite !== undefined) dbUpdates.is_favorite = updates.isFavorite
    if (updates.appearance !== undefined) dbUpdates.appearance = updates.appearance
    if (updates.socialMedia !== undefined) dbUpdates.social_media = updates.socialMedia
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes

    const { data, error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return this.mapDbProfileToProfile(data as any)
  }

  /**
   * 删除对象资料
   */
  static async deleteProfile(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (error) throw error
  }

  // ==================== RelationshipStages CRUD ====================

  /**
   * 获取对象的阶段数据
   */
  static async getStageData(personId: string): Promise<RelationshipStageData | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('relationship_stages')
      .select('*')
      .eq('person_id', personId)
      .single()

    if (error) return null
    return this.mapDbStageToStageData(data as any)
  }

  /**
   * 保存阶段数据
   */
  static async saveStageData(
    data: Omit<RelationshipStageData, 'updatedAt'>
  ): Promise<RelationshipStageData> {
    const supabase = createClient()
    const user = await this.getCurrentUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const dbData = {
      user_id: user.id,
      person_id: data.personId,
      current_stage: data.currentStage,
      stage_history: data.stageHistory,
      stage_progress: data.stageProgress,
      current_tasks: data.currentTasks,
    }

    const { data: result, error } = await supabase
      .from('relationship_stages')
      .upsert(dbData, { onConflict: 'person_id' })
      .select()
      .single()

    if (error) throw error
    return this.mapDbStageToStageData(result as any)
  }

  // ==================== Strategies CRUD ====================

  /**
   * 获取对象的恋爱方案
   */
  static async getStrategy(personId: string): Promise<Strategy | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('strategies')
      .select('*')
      .eq('person_id', personId)
      .single()

    if (error) return null
    return this.mapDbStrategyToStrategy(data as any)
  }

  /**
   * 保存恋爱方案
   */
  static async saveStrategy(
    strategy: Omit<Strategy, 'createdAt'>
  ): Promise<Strategy> {
    const supabase = createClient()
    const user = await this.getCurrentUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const dbData = {
      user_id: user.id,
      person_id: strategy.personId,
      current_stage: strategy.currentStage,
      daily_actions: strategy.dailyActions,
      weekly_plan: strategy.weeklyPlan,
      key_milestones: strategy.keyMilestones,
      warnings: strategy.warnings,
      success_probability: strategy.successProbability,
    }

    const { data, error } = await supabase
      .from('strategies')
      .upsert(dbData, { onConflict: 'person_id' })
      .select()
      .single()

    if (error) throw error
    return this.mapDbStrategyToStrategy(data as any)
  }

  // ==================== 辅助方法 ====================

  /**
   * 将数据库格式的 Profile 转换为应用格式
   */
  private static mapDbProfileToProfile(db: any): Profile {
    return {
      id: db.id || '',
      name: db.name || '',
      age: db.age || 0,
      gender: db.gender || 'other',
      birthday: db.birthday || '',
      zodiac: db.zodiac || 'aries',
      occupation: db.occupation || '',
      contact: db.contact || '',
      location: db.location || '',
      interests: Array.isArray(db.interests) ? db.interests : [],
      personalityTags: Array.isArray(db.personality_tags) ? db.personality_tags : [],
      mbti: db.mbti,
      attachmentStyle: db.attachment_style,
      loveLanguages: Array.isArray(db.love_languages) ? db.love_languages : [],
      isFavorite: Boolean(db.is_favorite),
      appearance: db.appearance,
      socialMedia: db.social_media,
      notes: db.notes || '',
      createdAt: db.created_at || new Date().toISOString(),
      updatedAt: db.updated_at || new Date().toISOString(),
    }
  }

  /**
   * 将数据库格式的 RelationshipStageData 转换为应用格式
   */
  private static mapDbStageToStageData(db: any): RelationshipStageData {
    return {
      personId: db.person_id || '',
      currentStage: db.current_stage || 'meeting',
      stageHistory: Array.isArray(db.stage_history) ? db.stage_history : [],
      stageProgress: db.stage_progress || {},
      currentTasks: Array.isArray(db.current_tasks) ? db.current_tasks : [],
      updatedAt: db.updated_at || new Date().toISOString(),
    }
  }

  /**
   * 将数据库格式的 Strategy 转换为应用格式
   */
  private static mapDbStrategyToStrategy(db: any): Strategy {
    return {
      personId: db.person_id || '',
      currentStage: db.current_stage || 'meeting',
      dailyActions: Array.isArray(db.daily_actions) ? db.daily_actions : [],
      weeklyPlan: db.weekly_plan || { goal: '', activities: [], expectedOutcomes: [] },
      keyMilestones: Array.isArray(db.key_milestones) ? db.key_milestones : [],
      warnings: Array.isArray(db.warnings) ? db.warnings : [],
      successProbability: db.success_probability || 50,
      generatedAt: db.generated_at || new Date().toISOString(),
    }
  }
}
