'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  Circle,
  Lock,
  Heart,
  HandHeart,
  Sparkles,
  Users,
  HeartHandshake,
  ChevronRight,
  Film,
  Lightbulb,
  ListTodo,
  Eye,
} from 'lucide-react';
import { RelationshipStageData, RelationshipStage, Profile } from '@/types';
import { storage } from '@/lib/storage';
import { strategyRules } from '@/lib/rules/strategy';

interface StageProgressVisualizerProps {
  stageData: RelationshipStageData;
  profile: Profile;
  onStageChange: (newStageData: RelationshipStageData) => void;
}

// 阶段配置
const STAGE_CONFIG: Record<
  RelationshipStage,
  {
    name: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    description: string;
  }
> = {
  meeting: {
    name: '认识阶段',
    icon: <Users className="h-5 w-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: '初次接触，建立第一印象',
  },
  knowing: {
    name: '了解阶段',
    icon: <Heart className="h-5 w-5" />,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: '深入交流，探索兴趣和价值观',
  },
  escalating: {
    name: '关系升级',
    icon: <Sparkles className="h-5 w-5" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    description: '暧昧期，试探心意',
  },
  intimate: {
    name: '亲密关系',
    icon: <HandHeart className="h-5 w-5" />,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    description: '深度连接，建立信任',
  },
  committed: {
    name: '确认关系',
    icon: <HeartHandshake className="h-5 w-5" />,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    description: '正式建立恋爱关系',
  },
};

// 阶段顺序
const STAGE_ORDER: RelationshipStage[] = ['meeting', 'knowing', 'escalating', 'intimate', 'committed'];

export function StageProgressVisualizer({
  stageData,
  profile,
  onStageChange,
}: StageProgressVisualizerProps) {
  // 如果 stageData 不存在，显示加载状态
  if (!stageData) {
    return <div className="p-4 text-center text-muted-foreground">加载中...</div>;
  }

  // 安全获取阶段配置的辅助函数
  const getStageConfig = (stage: RelationshipStage | string | undefined | null) => {
    if (!stage || !STAGE_CONFIG[stage as RelationshipStage]) {
      return STAGE_CONFIG.meeting;
    }
    return STAGE_CONFIG[stage as RelationshipStage];
  };

  // 安全获取进度数据
  const getProgress = (stage: RelationshipStage | string | undefined | null) => {
    if (!stage) {
      return { tasksCompleted: 0, totalTasks: 0, percentage: 0 };
    }
    return stageData.stageProgress?.[stage as RelationshipStage] || { tasksCompleted: 0, totalTasks: 0, percentage: 0 };
  };

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedStage, setSelectedStage] = useState<RelationshipStage | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'tips' | 'media'>('overview');

  const currentStageIndex = STAGE_ORDER.indexOf(stageData.currentStage || 'meeting');
  const currentStageConfig = getStageConfig(stageData.currentStage);
  const selectedStageConfig = getStageConfig(selectedStage);
  const currentProgress = getProgress(stageData.currentStage || 'meeting');
  const isAllTasksCompleted = currentProgress && currentProgress.tasksCompleted >= currentProgress.totalTasks;

  // 检查是否可以进入下一阶段
  const canAdvanceToNextStage = isAllTasksCompleted && stageData.currentStage !== 'committed';

  // 处理进入下一阶段
  const handleAdvanceToNext = async () => {
    if (!canAdvanceToNextStage || isTransitioning) return;

    setIsTransitioning(true);

    const nextStageIndex = currentStageIndex + 1;
    const nextStage = STAGE_ORDER[nextStageIndex] as RelationshipStage;

    // 记录当前阶段到历史
    const currentStageHistory = {
      stage: stageData.currentStage,
      enteredAt: stageData.stageHistory.find(h => h.stage === stageData.currentStage)?.enteredAt || new Date().toISOString(),
      exitedAt: new Date().toISOString(),
      completedTasks: (stageData.currentTasks || []).filter(t => t.completed).map(t => t.id),
    };

    // 获取下一阶段的任务
    const nextStageTasks = strategyRules.getStageTasks(nextStage).map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      completed: false,
    }));

    // 更新阶段数据
    const updatedStageData: RelationshipStageData = {
      ...stageData,
      currentStage: nextStage,
      stageHistory: [...stageData.stageHistory.filter(h => h.stage !== stageData.currentStage), currentStageHistory],
      currentTasks: nextStageTasks,
      updatedAt: new Date().toISOString(),
    };

    // 保存到存储
    await storage.setRelationshipStage(updatedStageData);
    onStageChange(updatedStageData);

    setIsTransitioning(false);
  };

  // 渲染阶段节点
  const renderStageNode = (stage: RelationshipStage, index: number) => {
    const config = STAGE_CONFIG[stage] || STAGE_CONFIG.meeting;
    const isCurrentStage = stage === stageData.currentStage;
    const isPastStage = index < currentStageIndex;
    const isLocked = index > currentStageIndex;
    const isClickable = isPastStage || isCurrentStage;
    const progress = stageData.stageProgress?.[stage] || { tasksCompleted: 0, totalTasks: 0, percentage: 0 };

    const handleClick = () => {
      if (isClickable) {
        setSelectedStage(stage);
        setDetailTab('overview');
      }
    };

    return (
      <div
        key={stage}
        className={`flex flex-col items-center flex-1 relative ${isClickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
        onClick={handleClick}
      >
        {/* 连接线 */}
        {index < STAGE_ORDER.length - 1 && (
          <div
            className={`absolute top-6 left-1/2 w-full h-1 rounded-full -z-10 ${
              isPastStage ? 'bg-green-400' : 'bg-gray-200'
            }`}
            style={{ width: '100%', maxWidth: '120px', left: '50%' }}
          />
        )}

        {/* 阶段图标/节点 */}
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isPastStage
              ? 'bg-green-500 text-white'
              : isCurrentStage
                ? `${config.bgColor} ${config.color} ring-4 ring-offset-2 ${config.color.replace('text-', 'ring-')}`
                : 'bg-gray-100 text-gray-400'
          }`}
        >
          {isLocked ? (
            <Lock className="h-5 w-5" />
          ) : isPastStage ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : isCurrentStage ? (
            config.icon
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </div>

        {/* 阶段信息 */}
        <div className="mt-3 text-center">
          <div className={`font-semibold text-sm ${isCurrentStage ? config.color : 'text-gray-600'}`}>
            {config.name}
          </div>
          {isPastStage && (
            <Badge variant="outline" className="mt-1 text-xs bg-green-50 border-green-200 text-green-700">
              已完成
            </Badge>
          )}
          {isCurrentStage && (
            <Badge className="mt-1 text-xs bg-pink-500">当前阶段</Badge>
          )}
          {(isPastStage || isCurrentStage) && (
            <div className="flex items-center justify-center gap-1 mt-1 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              点击查看
            </div>
          )}
        </div>

        {/* 进度条（非锁定阶段显示） */}
        {!isLocked && (
          <div className="mt-2 w-full max-w-[100px]">
            <Progress value={progress.percentage} className="h-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {progress.tasksCompleted}/{progress.totalTasks}
            </div>
          </div>
        )}

        {/* 描述 */}
        <div className="text-xs text-muted-foreground mt-1 text-center max-w-[120px]">
          {config.description}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-pink-500" />
          恋爱阶段进度
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 阶段进度图 */}
        <div className="flex items-start justify-between gap-2 mb-6">
          {STAGE_ORDER.map((stage, index) => renderStageNode(stage, index))}
        </div>

        {/* 当前阶段详情 */}
        <div className={`rounded-lg p-4 ${currentStageConfig.bgColor} mb-4`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className={`font-semibold ${currentStageConfig.color}`}>
                {currentStageConfig.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentStageConfig.description}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${currentStageConfig.color}`}>
                {currentProgress?.percentage ?? 0}%
              </div>
              <div className="text-xs text-muted-foreground">
                {currentProgress?.tasksCompleted ?? 0}/{currentProgress?.totalTasks ?? 0} 任务完成
              </div>
            </div>
          </div>
          <Progress value={currentProgress?.percentage ?? 0} className="h-3" />
        </div>

        {/* 进入下一阶段按钮 */}
        {canAdvanceToNextStage && (
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-pink-700">
                  恭喜！当前阶段任务已全部完成
                </h4>
                <p className="text-sm text-muted-foreground">
                  准备好进入 <span className="font-semibold text-pink-600">
                    {getStageConfig(STAGE_ORDER[currentStageIndex + 1]).name}
                  </span> 了吗？
                </p>
              </div>
              <Button
                onClick={handleAdvanceToNext}
                disabled={isTransitioning}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                {isTransitioning ? (
                  '进入中...'
                ) : (
                  <>
                    进入下一阶段
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* 已确认关系 */}
        {stageData.currentStage === 'committed' && isAllTasksCompleted && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center justify-center gap-3">
              <HeartHandshake className="h-6 w-6 text-red-500" />
              <div>
                <h4 className="font-semibold text-red-700">
                  恭喜！已成功确认关系
                </h4>
                <p className="text-sm text-muted-foreground">
                  祝你们幸福美满！
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 切换条件 */}
        {stageData.currentStage !== 'committed' && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h5 className="text-sm font-semibold mb-2">进入下一阶段的条件：</h5>
            <ul className="text-xs text-muted-foreground space-y-1">
              {strategyRules
                .getStageContent(stageData.currentStage)
                ?.transitionConditions.map((condition, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-pink-500">•</span>
                    <span>{condition}</span>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </CardContent>

      {/* 阶段详情对话框 */}
      {selectedStage && (
        <Dialog open={!!selectedStage} onOpenChange={() => setSelectedStage(null)}>
          <DialogContent className="max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${selectedStageConfig.bgColor}`}>
                  {selectedStageConfig.icon}
                </div>
                <div>
                  <div className="text-xl">{selectedStageConfig.name}</div>
                  <div className="text-sm text-muted-foreground font-normal">
                    {selectedStageConfig.description}
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>

            <Tabs value={detailTab} onValueChange={(v) => setDetailTab(v as any)} className="flex-1 overflow-hidden flex flex-col">
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

              <div className="flex-1 overflow-hidden mt-4">
                {/* 任务清单 */}
                <TabsContent value="overview" className="h-full m-0">
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {(strategyRules.getStageTasks(selectedStage) || []).map((task, index) => {
                        const isCompleted = (stageData.stageProgress?.[selectedStage]?.tasksCompleted || 0) > index;
                        return (
                          <div
                            key={task.id}
                            className={`p-4 rounded-lg border ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-card'}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                {isCompleted ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                  <Circle className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className={`font-medium ${isCompleted ? 'text-green-700' : ''}`}>
                                  {index + 1}. {task.title}
                                </p>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* 恋爱技巧 */}
                <TabsContent value="tips" className="h-full m-0">
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {(strategyRules.getStageTips(selectedStage) || []).map((tip, index) => {
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
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* 影视参考 */}
                <TabsContent value="media" className="h-full m-0">
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {(strategyRules.getStageMediaReferences(selectedStage) || []).map((media, index) => {
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
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const videoType = media.videoType || 'other';
                                      if (videoType === 'local') {
                                        // 本地视频使用播放器
                                        // 这里简化处理，实际可以集成 VideoPlayer
                                        window.open(media.videoUrl, '_blank');
                                      } else {
                                        window.open(media.videoUrl, '_blank');
                                      }
                                    }}
                                    className="gap-2"
                                  >
                                    播放视频
                                  </Button>
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
              </div>
            </Tabs>

            {/* 阶段进度信息 */}
            <div className={`mt-4 p-4 rounded-lg ${selectedStageConfig.bgColor}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-semibold ${selectedStageConfig.color}`}>
                    阶段进度
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {(stageData.stageProgress?.[selectedStage]?.tasksCompleted || 0)} / {(stageData.stageProgress?.[selectedStage]?.totalTasks || 0)} 个任务
                  </div>
                </div>
                <div className={`text-2xl font-bold ${selectedStageConfig.color}`}>
                  {stageData.stageProgress?.[selectedStage]?.percentage || 0}%
                </div>
              </div>
              <Progress value={stageData.stageProgress?.[selectedStage]?.percentage || 0} className="h-2 mt-2" />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
