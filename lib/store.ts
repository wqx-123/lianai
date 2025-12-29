import { create } from 'zustand';
import { Profile, RelationshipStage, RelationshipStageData } from '@/types';
import { storage } from './storage';

interface AppState {
  // 加载状态
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // 当前选中的对象 ID
  selectedProfileId: string | null;
  setSelectedProfileId: (id: string | null) => void;

  // 所有对象列表
  profiles: Profile[];
  setProfiles: (profiles: Profile[]) => void;
  addProfile: (profile: Profile) => void;
  updateProfile: (id: string, updates: Partial<Profile>) => void;
  deleteProfile: (id: string) => void;
  refreshProfiles: () => Promise<void>;

  // 当前对象
  currentProfile: Profile | null;
  setCurrentProfile: (profile: Profile | null) => void;

  // 当前阶段数据
  stageData: RelationshipStageData | null;
  setStageData: (data: RelationshipStageData | null) => void;
  refreshStageData: (personId: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  // 加载状态
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // 当前选中的对象 ID
  selectedProfileId: null,
  setSelectedProfileId: (id) => set({ selectedProfileId: id }),

  // 所有对象列表
  profiles: [],
  setProfiles: (profiles) => set({ profiles }),
  addProfile: (profile) => set((state) => ({ profiles: [profile, ...state.profiles] })),
  updateProfile: (id, updates) =>
    set((state) => ({
      profiles: state.profiles.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  deleteProfile: (id) =>
    set((state) => ({
      profiles: state.profiles.filter((p) => p.id !== id),
      selectedProfileId: state.selectedProfileId === id ? null : state.selectedProfileId,
      currentProfile: state.currentProfile?.id === id ? null : state.currentProfile,
      stageData: state.stageData?.personId === id ? null : state.stageData,
    })),
  refreshProfiles: async () => {
    set({ isLoading: true });
    try {
      const profiles = await storage.getProfiles();
      set({ profiles });
    } catch (error) {
      console.error('Failed to refresh profiles:', error);
      set({ profiles: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  // 当前对象
  currentProfile: null,
  setCurrentProfile: (profile) => set({ currentProfile: profile }),

  // 当前阶段数据
  stageData: null,
  setStageData: (data) => set({ stageData: data }),
  refreshStageData: async (personId) => {
    try {
      const stageData = await storage.getRelationshipStage(personId);
      set({ stageData });
    } catch (error) {
      console.error('Failed to refresh stage data:', error);
      set({ stageData: null });
    }
  },
}));
