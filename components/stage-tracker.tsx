'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { RelationshipStage, RelationshipStageData, Profile, Gender } from '@/types';
import { strategyRules } from '@/lib/rules/strategy';
import { genderTipsRules } from '@/lib/rules/genderTips';
import { CheckCircle2, Circle, Film, Lightbulb, ListTodo } from 'lucide-react';
import { VideoPlayer } from '@/components/video-player';

const STAGE_INFO: Record<RelationshipStage, { name: string; description: string; color: string; emoji: string }> = {
  meeting: { name: '认识阶段', description: '初次接触，建立印象', color: 'bg-blue-500', emoji: '👋' },
  knowing: { name: '了解阶段', description: '深入交流，探索兴趣', color: 'bg-green-500', emoji: '🤔' },
  escalating: { name: '关系升级', description: '暧昧期，试探心意', color: 'bg-yellow-500', emoji: '💕' },
  intimate: { name: '亲密关系', description: '深度连接，建立信任', color: 'bg-pink-500', emoji: '💗' },
  committed: { name: '确认关系', description: '正式表白，建立关系', color: 'bg-red-500', emoji: '💍' },
};

interface StageTrackerProps {
  stageData: RelationshipStageData;
  profile?: Profile;
  onTaskToggle?: (taskId: string, completed: boolean) => void;
}

// 根据性别调整搜索关键词
function adjustSearchUrl(url: string, gender?: Gender): string {
  if (!gender || !url.includes('keyword=')) {
    return url;
  }

  const targetGender = gender === 'male' ? '男生' : '女生';
  const keywordsMap: Record<string, string> = {
    '搭讪教程': gender === 'male' ? '如何认识男生' : '如何认识女生',
    '深入了解女生': `深入了解${targetGender}`,
    '第一次约会技巧': gender === 'male' ? '和男生第一次约会' : '和女生第一次约会',
    '恋爱先生': gender === 'male' ? '追男生技巧' : '追女生技巧',
    '恋爱技巧': gender === 'male' ? '如何与男生发生亲密关系' : '如何与女生发生亲密关系',
    '关系升级技巧': gender === 'male' ? '和男生升级关系' : '和女生升级关系',
    '表白技巧': gender === 'male' ? '向男生表白' : '向女生表白',
  };

  // 优先使用 URL API 处理（支持 URL 编码）
  try {
    const urlObj = new URL(url);
    const keyword = urlObj.searchParams.get('keyword');
    if (keyword) {
      const decodedKeyword = decodeURIComponent(keyword);
      if (keywordsMap[decodedKeyword]) {
        urlObj.searchParams.set('keyword', keywordsMap[decodedKeyword]);
        return urlObj.toString();
      }
    }
  } catch {
    // URL 解析失败，尝试简单替换
  }

  // 尝试直接匹配并替换关键词（兼容非编码 URL）
  for (const [key, value] of Object.entries(keywordsMap)) {
    if (url.includes(`keyword=${key}`)) {
      return url.replace(`keyword=${key}`, `keyword=${value}`);
    }
  }

  return url;
}

export function StageTracker({ stageData, profile, onTaskToggle }: StageTrackerProps) {
  // 如果 stageData 不存在，显示加载状态
  if (!stageData) {
    return <div className="p-4 text-center text-muted-foreground">加载中...</div>;
  }

  const [activeTab, setActiveTab] = useState<'overview' | 'tips' | 'media'>('overview');

  const currentStageInfo = STAGE_INFO[stageData.currentStage] || STAGE_INFO.meeting;
  const stageContent = strategyRules.getStageContent(stageData.currentStage);
  const stageTasks = strategyRules.getStageTasks(stageData.currentStage) || [];
  const stageMedia = strategyRules.getStageMediaReferences(stageData.currentStage) || [];

  // 根据性别获取恋爱技巧
  const gender = profile?.gender || 'female';
  const stageTips = genderTipsRules.getTips(stageData.currentStage, gender) || [];

  const progress = stageData.stageProgress?.[stageData.currentStage];
  const progressPercent = progress?.percentage || 0;

  // 安全访问 currentStageInfo
  const safeStageInfo = currentStageInfo || STAGE_INFO.meeting;

  return (
    <div className="space-y-6">
      {/* 当前阶段 */}
      <Card className="border-2 border-pink-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-3">
                <span className="text-3xl">{safeStageInfo.emoji}</span>
                {safeStageInfo.name}
              </CardTitle>
              <CardDescription className="mt-2">{safeStageInfo.description}</CardDescription>
            </div>
            <Badge className={`${safeStageInfo.color} text-white px-4 py-2 text-sm`}>
              当前阶段
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>阶段进度</span>
              <span className="font-semibold">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            {progress && (
              <p className="text-sm text-muted-foreground">
                已完成 {progress.tasksCompleted} / {progress.totalTasks} 个任务
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 阶段内容 */}
      <Card>
        <CardHeader>
          <CardTitle>阶段指南</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="gap-2">
                <ListTodo className="h-4 w-4" />
                任务清单
              </TabsTrigger>
              <TabsTrigger value="tips" className="gap-2">
                <Lightbulb className="h-4 w-4" />
                恋爱技巧
              </TabsTrigger>
              <TabsTrigger value="media" className="gap-2">
                <Film className="h-4 w-4" />
                影视参考
              </TabsTrigger>
            </TabsList>

            {/* 任务清单 */}
            <TabsContent value="overview" className="mt-6">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {Array.isArray(stageTasks) && stageTasks.map((task, index) => {
                    const isCompleted = stageData.currentTasks?.find(t => t.id === task.id)?.completed;
                    return (
                      <div
                        key={task.id}
                        className="flex items-start gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => onTaskToggle?.(task.id, !isCompleted)}
                      >
                        <div className="mt-0.5">
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                            {index + 1}. {task.title}
                          </p>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* 恋爱技巧 */}
            <TabsContent value="tips" className="mt-6">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {Array.isArray(stageTips) && stageTips.map((tip, index) => {
                    const categoryColors: Record<string, string> = {
                      chat: 'bg-blue-100 text-blue-700',
                      date: 'bg-green-100 text-green-700',
                      communication: 'bg-purple-100 text-purple-700',
                      gift: 'bg-pink-100 text-pink-700',
                      warning: 'bg-red-100 text-red-700',
                    };
                    const categoryNames: Record<string, string> = {
                      chat: '聊天',
                      date: '约会',
                      communication: '沟通',
                      gift: '礼物',
                      warning: '注意',
                    };

                    return (
                      <div key={index} className="p-4 rounded-lg border bg-card">
                        <div className="flex items-start gap-3">
                          <Badge className={categoryColors[tip.category] || 'bg-gray-100'}>
                            {categoryNames[tip.category] || tip.category}
                          </Badge>
                          <div className="flex-1">
                            <h4 className="font-semibold">{tip.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{tip.content}</p>
                            {tip.steps && tip.steps.length > 0 && (
                              <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                                <h5 className="text-sm font-medium mb-2">详细步骤：</h5>
                                <ol className="text-sm text-muted-foreground space-y-1">
                                  {tip.steps.map((step, stepIndex) => (
                                    <li key={stepIndex} className="flex gap-2">
                                      <span className="text-muted-foreground/50">{stepIndex + 1}.</span>
                                      <span>{step}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* 影视参考 */}
            <TabsContent value="media" className="mt-6">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {Array.isArray(stageMedia) && stageMedia.map((media, index) => {
                    const typeBadges: Record<string, string> = {
                      movie: 'bg-purple-100 text-purple-700',
                      tv: 'bg-blue-100 text-blue-700',
                      anime: 'bg-pink-100 text-pink-700',
                      other: 'bg-gray-100 text-gray-700',
                    };
                    const typeNames: Record<string, string> = {
                      movie: '电影',
                      tv: '剧集',
                      anime: '动漫',
                      other: '其他',
                    };

                    return (
                      <div key={index} className="p-4 rounded-lg border bg-card">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center gap-2">
                            <Badge className={typeBadges[media.type] || 'bg-gray-100'}>
                              {typeNames[media.type] || media.type}
                            </Badge>
                            {media.videoUrl && (
                              <VideoPlayer
                                url={adjustSearchUrl(media.videoUrl, profile?.gender)}
                                type={(media.videoType || 'other') as 'other' | 'local' | 'youtube' | 'bilibili' | 'vimeo'}
                                title={media.title}
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{media.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{media.description}</p>
                            <Separator className="my-2" />
                            <p className="text-sm">
                              <span className="font-medium">经典桥段：</span>{media.scene}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              <span className="font-medium">借鉴要点：</span>{media.takeaway}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
