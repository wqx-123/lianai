'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Strategy } from '@/types';
import { Sparkles, Target, Calendar, AlertTriangle, TrendingUp } from 'lucide-react';

interface StrategyPanelProps {
  strategy: Strategy;
  onRefresh?: () => void;
}

export function StrategyPanel({ strategy, onRefresh }: StrategyPanelProps) {
  const priorityColors: Record<string, string> = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const priorityLabels: Record<string, string> = {
    high: '重要',
    medium: '中等',
    low: '一般',
  };

  return (
    <div className="space-y-6">
      {/* 成功概率 */}
      <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              成功概率
            </CardTitle>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                刷新方案
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-5xl font-bold text-green-600">
              {strategy.successProbability}%
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                {strategy.successProbability >= 80 && '前景非常乐观！继续保持！'}
                {strategy.successProbability >= 60 && strategy.successProbability < 80 && '进展顺利，需要耐心和努力'}
                {strategy.successProbability >= 40 && strategy.successProbability < 60 && '需要更多了解和沟通'}
                {strategy.successProbability < 40 && '建议重新评估当前策略'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 每日行动建议 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            每日行动建议
          </CardTitle>
          <CardDescription>基于对方特点的个性化建议</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3 pr-4">
              {strategy.dailyActions.map((action, index) => (
                <div key={index} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{action.action}</span>
                        {action.priority && (
                          <Badge className={priorityColors[action.priority]} variant="outline">
                            {priorityLabels[action.priority]}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{action.reason}</p>
                      {action.timing && (
                        <p className="text-xs text-muted-foreground mt-2">
                          时机：{action.timing}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 每周计划 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            本周计划
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">本周目标</h4>
              <p className="text-sm text-muted-foreground">{strategy.weeklyPlan.goal}</p>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-3">推荐活动</h4>
              <div className="space-y-4">
                {strategy.weeklyPlan.activities.map((activity, index) => (
                  <div key={index} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <h5 className="font-semibold text-base">{activity.name}</h5>
                    </div>
                    {activity.actionSteps && activity.actionSteps.length > 0 && (
                      <div className="space-y-2 ml-8">
                        {activity.actionSteps.map((step, stepIndex) => (
                          <div key={stepIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">预期成果</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {strategy.weeklyPlan.expectedOutcomes.map((outcome, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 关键节点 */}
      {strategy.keyMilestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-500" />
              关键节点
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {strategy.keyMilestones.map((milestone, index) => {
                const readinessColor =
                  milestone.readiness >= 80 ? 'text-green-600' :
                  milestone.readiness >= 50 ? 'text-yellow-600' :
                  'text-red-600';

                return (
                  <div key={index} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{milestone.event}</h4>
                      <Badge variant="outline" className={readinessColor}>
                        {milestone.readiness}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{milestone.suggestion}</p>
                    {milestone.timeframe && (
                      <p className="text-xs text-muted-foreground">⏱ {milestone.timeframe}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 注意事项 */}
      {strategy.warnings.length > 0 && (
        <Card className="border-orange-100 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              注意事项
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {strategy.warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-orange-500 mt-0.5">⚠</span>
                  <span className="text-orange-800">{warning}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
