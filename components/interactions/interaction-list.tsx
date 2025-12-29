'use client';

import { useState } from 'react';
import { Interaction } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { InteractionCard } from './interaction-card';
import { Plus, Filter, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InteractionType } from '@/types';
import { InteractionForm } from './interaction-form';

interface InteractionListProps {
  personId: string;
  interactions: Interaction[];
  onEdit?: (interaction: Interaction) => void;
  onDelete?: (id: string) => void;
  onCreate?: (data: Omit<Interaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function InteractionList({
  personId,
  interactions,
  onEdit,
  onDelete,
  onCreate,
}: InteractionListProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [moodFilter, setMoodFilter] = useState<string>('all');

  // 按日期分组
  const groupedInteractions = interactions.reduce((groups, interaction) => {
    const date = new Date(interaction.timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(interaction);
    return groups;
  }, {} as Record<string, Interaction[]>);

  // 过滤和搜索
  const filteredGroups = Object.entries(groupedInteractions)
    .map(([date, items]) => {
      const filteredItems = items.filter((item) => {
        const matchesSearch =
          !searchQuery ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.notes?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = typeFilter === 'all' || item.type === typeFilter;
        const matchesMood = moodFilter === 'all' || item.mood === moodFilter;

        return matchesSearch && matchesType && matchesMood;
      });

      return [date, filteredItems] as [string, Interaction[]];
    })
    .filter(([_, items]) => items.length > 0)
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime());

  const handleCreate = (data: Omit<Interaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    onCreate?.(data);
    setIsCreateDialogOpen(false);
  };

  const handleEditClick = (interaction: Interaction) => {
    setEditingInteraction(interaction);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (data: Omit<Interaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingInteraction) {
      onEdit?.({
        ...editingInteraction,
        ...data,
        id: editingInteraction.id,
        createdAt: editingInteraction.createdAt,
        updatedAt: new Date().toISOString(),
      });
    }
    setIsEditDialogOpen(false);
    setEditingInteraction(null);
  };

  const handleEditCancel = () => {
    setIsEditDialogOpen(false);
    setEditingInteraction(null);
  };

  return (
    <div className="space-y-4">
      {/* 操作栏 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex gap-2">
          {/* 搜索 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索记录..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* 类型筛选 */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="chat">聊天</SelectItem>
              <SelectItem value="call">通话</SelectItem>
              <SelectItem value="date">约会</SelectItem>
              <SelectItem value="gift">礼物</SelectItem>
              <SelectItem value="other">其他</SelectItem>
            </SelectContent>
          </Select>

          {/* 情绪筛选 */}
          <Select value={moodFilter} onValueChange={setMoodFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="情绪" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="positive">😊 积极</SelectItem>
              <SelectItem value="neutral">😐 中性</SelectItem>
              <SelectItem value="negative">😞 消极</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 新建按钮 */}
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          新建记录
        </Button>
      </div>

      {/* 记录列表 */}
      {filteredGroups.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground mb-4">
              {searchQuery || typeFilter !== 'all' || moodFilter !== 'all'
                ? '没有找到匹配的记录'
                : '还没有互动记录'}
            </div>
            {!searchQuery && typeFilter === 'all' && moodFilter === 'all' && (
              <Button onClick={() => setIsCreateDialogOpen(true)} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                创建第一条记录
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="space-y-6 pr-4">
            {filteredGroups.map(([date, items]) => (
              <div key={date}>
                {/* 日期分组标题 */}
                <div className="flex items-center gap-4 mb-3">
                  <h3 className="text-sm font-semibold text-muted-foreground sticky top-0 bg-background py-2">
                    {date}
                  </h3>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* 该日期的记录 */}
                <div className="space-y-3">
                  {items.map((interaction) => (
                    <InteractionCard
                      key={interaction.id}
                      interaction={interaction}
                      onEdit={handleEditClick}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* 创建记录对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新建互动记录</DialogTitle>
          </DialogHeader>
          <InteractionForm
            personId={personId}
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* 编辑记录对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑互动记录</DialogTitle>
          </DialogHeader>
          {editingInteraction && (
            <InteractionForm
              personId={personId}
              initialData={editingInteraction}
              onSubmit={handleUpdate}
              onCancel={handleEditCancel}
              submitLabel="保存修改"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
