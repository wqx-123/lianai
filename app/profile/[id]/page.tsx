'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StageTracker } from '@/components/stage-tracker';
import { StageProgressVisualizer } from '@/components/stage-progress-visualizer';
import { AnalysisCard } from '@/components/analysis-card';
import { StrategyPanel } from '@/components/strategy-panel';
import { InteractionList } from '@/components/interactions/interaction-list';
import { StatisticsPanel } from '@/components/dashboard/statistics-panel';
import { Profile, RelationshipStageData, ZodiacAnalysis, PersonaAnalysis, Strategy, StageTask, Interaction } from '@/types';
import { storage } from '@/lib/storage';
import { zodiacRules } from '@/lib/rules/zodiac';
import { personaRules } from '@/lib/rules/persona';
import { strategyRules } from '@/lib/rules/strategy';
import { ArrowLeft, MapPin, Briefcase, Calendar, Heart, BarChart3 } from 'lucide-react';

export default function ProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const profileId = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [stageData, setStageData] = useState<RelationshipStageData | null>(null);
  const [zodiacAnalysis, setZodiacAnalysis] = useState<ZodiacAnalysis | undefined>(undefined);
  const [personaAnalysis, setPersonaAnalysis] = useState<PersonaAnalysis | undefined>(undefined);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profileId) {
      const loadData = async () => {
        const profileData = await storage.getProfileById(profileId);
        if (profileData) {
          setProfile(profileData);

          // 获取阶段数据
          let stageInfo = await storage.getRelationshipStage(profileId);
          if (!stageInfo) {
            // 初始化阶段数据
            stageInfo = {
              personId: profileId,
              currentStage: 'meeting',
              stageHistory: [],
              stageProgress: {
                meeting: { tasksCompleted: 0, totalTasks: 5, percentage: 0 },
                knowing: { tasksCompleted: 0, totalTasks: 6, percentage: 0 },
                escalating: { tasksCompleted: 0, totalTasks: 6, percentage: 0 },
                intimate: { tasksCompleted: 0, totalTasks: 6, percentage: 0 },
                committed: { tasksCompleted: 0, totalTasks: 5, percentage: 0 },
              },
              currentTasks: strategyRules.getStageTasks('meeting').map(t => ({
                id: t.id,
                title: t.title,
                description: t.description,
                completed: false,
              })),
              updatedAt: new Date().toISOString(),
            };
            await storage.setRelationshipStage(stageInfo);
          }
          setStageData(stageInfo);

          // 星座分析
          const zodiacInfo = zodiacRules.analyze(profileData.zodiac);
          setZodiacAnalysis(zodiacInfo);

          // 人物画像分析
          if (profileData.mbti || profileData.attachmentStyle || profileData.loveLanguages) {
            const personaInfo = personaRules.analyzePersona({
              mbti: profileData.mbti,
              attachmentStyle: profileData.attachmentStyle,
              loveLanguages: profileData.loveLanguages || [],
            });
            setPersonaAnalysis(personaInfo);
          }

          // 生成方案
          generateStrategy(profileData, stageInfo);

          // 加载互动记录
          const interactionList = await storage.getInteractions(profileId);
          setInteractions(interactionList);
        }
        setLoading(false);
      };
      loadData();
    }
  }, [profileId]);

  const generateStrategy = (profileData: Profile, stageInfo: RelationshipStageData) => {
    const newStrategy = strategyRules.generateStrategy({
      profile: profileData,
      stageData: stageInfo,
      zodiacAnalysis: zodiacAnalysis,
    });
    storage.setStrategy(newStrategy);
    setStrategy(newStrategy);
  };

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    if (!stageData || !profile) return;

    const updatedTasks = stageData.currentTasks?.map(t =>
      t.id === taskId ? { ...t, completed, completedAt: completed ? new Date().toISOString() : undefined } : t
    ) || [];

    // 更新进度
    const stageContent = strategyRules.getStageContent(stageData.currentStage);
    const totalTasks = stageContent?.tasks.length || 0;
    const completedCount = updatedTasks.filter(t => t.completed).length;
    const percentage = Math.round((completedCount / totalTasks) * 100);

    const updatedStageData: RelationshipStageData = {
      ...stageData,
      currentTasks: updatedTasks,
      stageProgress: {
        ...(stageData.stageProgress || {}),
        [stageData.currentStage]: {
          tasksCompleted: completedCount,
          totalTasks,
          percentage,
        },
      },
      updatedAt: new Date().toISOString(),
    };

    await storage.setRelationshipStage(updatedStageData);
    setStageData(updatedStageData);

    // 重新生成方案
    generateStrategy(profile, updatedStageData);
  };

  const handleRefreshStrategy = () => {
    if (profile && stageData) {
      generateStrategy(profile, stageData);
    }
  };

  const handleStageChange = (newStageData: RelationshipStageData) => {
    setStageData(newStageData);
    if (profile) {
      generateStrategy(profile, newStageData);
    }
  };

  // 互动记录处理函数
  const handleCreateInteraction = async (data: Omit<Interaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newInteraction = await storage.createInteraction(data);
    setInteractions((prev) => [newInteraction, ...prev]);
  };

  const handleUpdateInteraction = async (interaction: Interaction) => {
    // 注意：当前 storage 接口没有 update 方法，这里先做简单处理
    // 实际使用时需要删除旧的，创建新的
    await storage.deleteInteraction(interaction.id);
    const newInteraction = await storage.createInteraction({
      ...interaction,
      updatedAt: new Date().toISOString(),
    });
    setInteractions((prev) => prev.map((i) => (i.id === interaction.id ? newInteraction : i)));
  };

  const handleDeleteInteraction = async (id: string) => {
    await storage.deleteInteraction(id);
    setInteractions((prev) => prev.filter((i) => i.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">未找到该对象</p>
            <Button onClick={() => router.push('/')}>返回首页</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ZODIAC_EMOJIS: Record<string, string> = {
    aries: '♈',
    taurus: '♉',
    gemini: '♊',
    cancer: '♋',
    leo: '♌',
    virgo: '♍',
    libra: '♎',
    scorpio: '♏',
    sagittarius: '♐',
    capricorn: '♑',
    aquarius: '♒',
    pisces: '♓',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">对象详情</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-3xl bg-gradient-to-br from-pink-400 to-purple-400 text-white">
                  {profile.name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  <Badge variant="outline">
                    {profile.age}岁
                  </Badge>
                  <Badge variant="outline">
                    {profile.gender === 'male' ? '男' : profile.gender === 'female' ? '女' : '其他'}
                  </Badge>
                  {profile.zodiac && (
                    <Badge variant="outline">
                      {ZODIAC_EMOJIS[profile.zodiac]} {zodiacRules.getZodiacInfo(profile.zodiac)?.name}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {profile.occupation && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      <span>{profile.occupation}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.birthday && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(profile.birthday).toLocaleDateString('zh-CN')}</span>
                    </div>
                  )}
                </div>

                {profile.interests && profile.interests.length > 0 && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest) => (
                        <Badge key={interest} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.personalityTags && profile.personalityTags.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                      {profile.personalityTags.map((tag) => (
                        <Badge key={tag} variant="outline" className="border-pink-200 text-pink-700">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {profile.notes && (
              <>
                <Separator className="my-4" />
                <p className="text-sm text-muted-foreground">{profile.notes}</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="stage" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="stage" className="gap-2">
              <Heart className="h-4 w-4" />
              阶段管理
            </TabsTrigger>
            <TabsTrigger value="analysis">分析</TabsTrigger>
            <TabsTrigger value="strategy">方案</TabsTrigger>
            <TabsTrigger value="interactions">记录</TabsTrigger>
            <TabsTrigger value="statistics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              统计
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stage" className="space-y-6">
            {stageData && profile && (
              <>
                <StageProgressVisualizer
                  stageData={stageData}
                  profile={profile}
                  onStageChange={handleStageChange}
                />
                <StageTracker stageData={stageData} profile={profile} onTaskToggle={handleTaskToggle} />
              </>
            )}
          </TabsContent>

          <TabsContent value="analysis">
            <AnalysisCard
              profile={profile}
              zodiacAnalysis={zodiacAnalysis}
              personaAnalysis={personaAnalysis}
            />
          </TabsContent>

          <TabsContent value="strategy">
            {strategy && <StrategyPanel strategy={strategy} onRefresh={handleRefreshStrategy} />}
          </TabsContent>

          <TabsContent value="interactions">
            <InteractionList
              personId={profileId}
              interactions={interactions}
              onCreate={handleCreateInteraction}
              onEdit={handleUpdateInteraction}
              onDelete={handleDeleteInteraction}
            />
          </TabsContent>

          <TabsContent value="statistics">
            <StatisticsPanel interactions={interactions} stageData={stageData} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
