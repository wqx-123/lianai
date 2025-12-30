'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Interaction, RelationshipStageData } from '@/types';
import {
  calculateInteractionStats,
  calculateStageDurations,
  getStageName,
  getMoodLabel,
  getInteractionTypeLabel,
} from '@/lib/utils/statistics';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Calendar, Heart, MessageCircle } from 'lucide-react';

const CHART_COLORS = {
  chat: '#3b82f6',
  call: '#22c55e',
  date: '#ec4899',
  gift: '#a855f7',
  other: '#6b7280',
  positive: '#22c55e',
  neutral: '#eab308',
  negative: '#ef4444',
  none: '#d1d5db',
};

interface StatisticsPanelProps {
  interactions: Interaction[];
  stageData: RelationshipStageData | null;
}

export function StatisticsPanel({ interactions, stageData }: StatisticsPanelProps) {
  const stats = useMemo(() => calculateInteractionStats(interactions), [interactions]);
  const stageDurations = useMemo(() => (stageData ? calculateStageDurations(stageData) : []), [stageData]);

  // 准备饼图数据 - 互动类型
  const typePieData = Object.entries(stats.byType)
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => ({
      name: getInteractionTypeLabel(type),
      value: count,
      type,
    }));

  // 准备饼图数据 - 情绪分布
  const moodPieData = Object.entries(stats.byMood)
    .filter(([_, count]) => count > 0)
    .map(([mood, count]) => ({
      name: getMoodLabel(mood),
      value: count,
      mood,
    }));

  // 准备柱状图数据 - 阶段时长
  const stageBarData = stageDurations.map((d) => ({
    name: getStageName(d.stage),
    days: d.duration,
  }));

  // 准备折线图数据（最近7天）
  const recentTimeline = stats.frequencyTimeline.slice(-7);

  return (
    <div className="space-y-6">
      {/* 总览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              总互动次数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">累计记录</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              每周频率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.averageFrequency}</div>
            <p className="text-xs text-muted-foreground mt-1">次/周（近30天）</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Heart className="h-4 w-4" />
              主要情绪
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.entries(stats.byMood)
                .filter(([mood]) => mood !== 'none')
                .sort((a, b) => b[1] - a[1])[0]?.[0]
                ? getMoodLabel(
                    Object.entries(stats.byMood)
                      .filter(([mood]) => mood !== 'none')
                      .sort((a, b) => b[1] - a[1])[0][0]
                  )
                : '暂无'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">最常出现</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              当前阶段
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{stageData ? getStageName(stageData.currentStage) : '未知'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stageDurations.find((d) => d.stage === stageData?.currentStage)?.duration || 0} 天
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 互动频率趋势 */}
        <Card>
          <CardHeader>
            <CardTitle>互动频率趋势</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTimeline.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={recentTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString('zh-CN')}
                    formatter={(value) => [`${value} 次`, '互动']}
                  />
                  <Line type="monotone" dataKey="count" stroke="#ec4899" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">暂无数据</div>
            )}
          </CardContent>
        </Card>

        {/* 互动类型分布 */}
        <Card>
          <CardHeader>
            <CardTitle>互动类型分布</CardTitle>
          </CardHeader>
          <CardContent>
            {typePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={typePieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {typePieData.map((entry) => (
                      <Cell key={`type-${entry.type}`} fill={CHART_COLORS[entry.type as keyof typeof CHART_COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} 次`, '数量']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">暂无数据</div>
            )}
          </CardContent>
        </Card>

        {/* 情绪分布 */}
        <Card>
          <CardHeader>
            <CardTitle>情绪分布</CardTitle>
          </CardHeader>
          <CardContent>
            {moodPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={moodPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {moodPieData.map((entry) => (
                      <Cell key={`mood-${entry.mood}`} fill={CHART_COLORS[entry.mood as keyof typeof CHART_COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} 次`, '数量']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">暂无数据</div>
            )}
          </CardContent>
        </Card>

        {/* 阶段停留时长 */}
        <Card>
          <CardHeader>
            <CardTitle>各阶段停留时长</CardTitle>
          </CardHeader>
          <CardContent>
            {stageBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stageBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis label={{ value: '天', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => [`${value} 天`, '时长']} />
                  <Bar dataKey="days" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">暂无数据</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 详细统计 */}
      <Card>
        <CardHeader>
          <CardTitle>详细统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">聊天</p>
              <Badge variant="outline" className="text-base">
                {stats.byType.chat} 次
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">通话</p>
              <Badge variant="outline" className="text-base">
                {stats.byType.call} 次
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">约会</p>
              <Badge variant="outline" className="text-base">
                {stats.byType.date} 次
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">礼物</p>
              <Badge variant="outline" className="text-base">
                {stats.byType.gift} 次
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
