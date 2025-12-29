'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { ProfileForm } from '@/components/profile-form';
import { ProfileList } from '@/components/profile-list';
import { SignOutButton } from '@/components/sign-out-button';
import { useStore } from '@/lib/store';
import { storage } from '@/lib/storage';
import { createClient } from '@/lib/supabase/client';
import { Plus, Heart } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { Profile } from '@/types';
import { toast } from 'sonner';
import { GlobalSearch } from '@/components/search/global-search';

export default function HomePage() {
  const router = useRouter();
  const { profiles, setProfiles, addProfile, deleteProfile, refreshProfiles, isLoading } = useStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [currentStages, setCurrentStages] = useState<Record<string, import('@/types').RelationshipStage>>({});
  const [mounted, setMounted] = useState(false);
  const hasInitialized = useRef(false);

  // 确保只在客户端挂载
  useEffect(() => {
    setMounted(true);
  }, []);

  // 初始化用户认证
  useEffect(() => {
    if (!mounted || hasInitialized.current) return;
    hasInitialized.current = true;

    const checkUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
          await refreshProfiles();
        }
      } catch (error) {
        console.error('Failed to check user:', error);
        setError('网络连接失败，请检查网络设置');
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, [mounted]);

  // 加载阶段数据
  useEffect(() => {
    if (!loading && user && profiles.length > 0) {
      const loadStages = async () => {
        const stages: Record<string, import('@/types').RelationshipStage> = {};
        for (const profile of profiles) {
          const stageData = await storage.getRelationshipStage(profile.id);
          if (stageData) {
            stages[profile.id] = stageData.currentStage;
          }
        }
        setCurrentStages(stages);
      };
      loadStages();
    }
  }, [loading, user, profiles]);

  // 防止 hydration 不匹配
  if (!mounted || loading || isLoading) {
    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center p-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>重新加载</Button>
          </Card>
        </div>
      );
    }
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-8">
          <Heart className="h-16 w-16 text-pink-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">欢迎来到恋爱记录</h2>
          <p className="text-muted-foreground mb-6">登录后开始记录您的恋爱旅程</p>
          <Button onClick={() => router.push('/login')} size="lg">立即登录</Button>
        </Card>
      </div>
    );
  }

  const handleAddProfile = async (data: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newProfile = await storage.createProfile(data);
      addProfile(newProfile);
      setIsAddDialogOpen(false);
      toast.success('添加成功', { description: '对象已成功添加' });
    } catch (error) {
      console.error('Failed to create profile:', error);
      toast.error('添加失败', { description: '请重试或检查网络连接' });
    }
  };

  const handleDeleteProfile = async (id: string) => {
    await storage.deleteProfile(id);
    deleteProfile(id);
  };

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    setIsEditDialogOpen(true);
  };

  const handleUpdateProfile = async (data: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingProfile) return;
    const updatedProfile = await storage.updateProfile(editingProfile.id, data);
    if (updatedProfile) {
      setProfiles(profiles.map(p => p.id === updatedProfile.id ? updatedProfile : p));
    }
    setIsEditDialogOpen(false);
    setEditingProfile(null);
  };

  const handleToggleFavorite = async (id: string) => {
    const profile = profiles.find(p => p.id === id);
    if (profile) {
      const updatedProfile = await storage.updateProfile(id, { isFavorite: !profile.isFavorite });
      if (updatedProfile) {
        setProfiles(profiles.map(p => p.id === updatedProfile.id ? updatedProfile : p));
      }
    }
  };

  const handleSearchProfileClick = (profileId: string) => {
    router.push(`/profile/${profileId}`);
  };

  const handleSearchInteractionClick = (profileId: string) => {
    router.push(`/profile/${profileId}?tab=interactions`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-pink-500 fill-pink-500" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                恋爱过程记录
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <GlobalSearch
                profiles={profiles}
                interactions={[]}
                onProfileClick={handleSearchProfileClick}
                onInteractionClick={handleSearchInteractionClick}
              />
              <span className="text-sm text-muted-foreground">{user?.email || 'User'}</span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">我的心动对象</h2>
            <p className="text-sm text-muted-foreground">
              共 {profiles.length} 个对象
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                添加对象
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>添加心动对象</DialogTitle>
                <DialogDescription>
                  填写TA的基本信息，开始记录恋爱过程
                </DialogDescription>
              </DialogHeader>
              <ProfileForm
                onSubmit={handleAddProfile}
                onCancel={() => setIsAddDialogOpen(false)}
                submitLabel="添加"
              />
            </DialogContent>
          </Dialog>

          {/* 编辑对话框 */}
          {editingProfile && (
            <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
              setIsEditDialogOpen(open);
              if (!open) setEditingProfile(null);
            }}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>编辑对象信息</DialogTitle>
                  <DialogDescription>
                    修改TA的信息
                  </DialogDescription>
                </DialogHeader>
                <ProfileForm
                  key={editingProfile.id}
                  initialData={editingProfile}
                  onSubmit={handleUpdateProfile}
                  onCancel={() => {
                    setIsEditDialogOpen(false);
                    setEditingProfile(null);
                  }}
                  submitLabel="保存"
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        <ProfileList
          profiles={profiles}
          currentStages={currentStages}
          onDelete={handleDeleteProfile}
          onEdit={handleEditProfile}
          onToggleFavorite={handleToggleFavorite}
        />

        {/* Quick Tips */}
        {profiles.length > 0 && (
          <div className="mt-8 p-6 bg-white rounded-lg border border-pink-100 shadow-sm">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              小贴士
            </h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• 点击卡片查看详细信息和管理恋爱阶段</li>
              <li>• 记录每一次互动，追踪关系进展</li>
              <li>• 查看星座分析和个性化恋爱方案</li>
            </ul>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>记录每一个心动瞬间 ❤️</p>
        </div>
      </footer>
    </div>
  );
}
