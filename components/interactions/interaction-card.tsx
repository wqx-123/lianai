'use client';

import { Interaction, InteractionType } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageSquare,
  Phone,
  Calendar,
  Gift,
  MoreHorizontal,
  Trash2,
  Edit,
  Image as ImageIcon,
  File,
  Video,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatRelativeTime } from '@/lib/storage';

interface InteractionCardProps {
  interaction: Interaction;
  onEdit?: (interaction: Interaction) => void;
  onDelete?: (id: string) => void;
}

const TYPE_CONFIG: Record<InteractionType, { icon: React.ReactNode; label: string; color: string }> = {
  chat: {
    icon: <MessageSquare className="h-4 w-4" />,
    label: '聊天',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  call: {
    icon: <Phone className="h-4 w-4" />,
    label: '通话',
    color: 'bg-green-100 text-green-700 border-green-200',
  },
  date: {
    icon: <Calendar className="h-4 w-4" />,
    label: '约会',
    color: 'bg-pink-100 text-pink-700 border-pink-200',
  },
  gift: {
    icon: <Gift className="h-4 w-4" />,
    label: '礼物',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  other: {
    icon: <MoreHorizontal className="h-4 w-4" />,
    label: '其他',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
  },
};

const MOOD_EMOJIS: Record<string, string> = {
  positive: '😊',
  neutral: '😐',
  negative: '😞',
};

export function InteractionCard({ interaction, onEdit, onDelete }: InteractionCardProps) {
  const typeConfig = TYPE_CONFIG[interaction.type];
  const hasAttachments = interaction.attachments && interaction.attachments.length > 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            {/* 类型图标 */}
            <div className={`p-2 rounded-lg ${typeConfig.color}`}>
              {typeConfig.icon}
            </div>

            <div className="flex-1 min-w-0">
              {/* 标题或描述 */}
              <h4 className="font-semibold text-base truncate">
                {interaction.title || typeConfig.label}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(interaction.timestamp)}
                </span>
                {interaction.mood && (
                  <span className="text-lg" role="img" aria-label="mood">
                    {MOOD_EMOJIS[interaction.mood]}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 操作菜单 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(interaction)}>
                  <Edit className="h-4 w-4 mr-2" />
                  编辑
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(interaction.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 描述 */}
        {interaction.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {interaction.description}
          </p>
        )}

        {/* 富文本内容预览 */}
        {interaction.content && (
          <div
            className="text-sm text-muted-foreground mb-3 prose prose-sm max-w-none line-clamp-3"
            dangerouslySetInnerHTML={{ __html: interaction.content }}
          />
        )}

        {/* 附件预览 */}
        {hasAttachments && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {interaction.attachments!.slice(0, 4).map((attachment) => {
                const isImage = attachment.type === 'image';
                const Icon = isImage ? ImageIcon : attachment.type === 'video' ? Video : File;

                return (
                  <div
                    key={attachment.id}
                    className="relative group flex items-center gap-2 px-2 py-1 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Icon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs truncate max-w-[100px]">{attachment.name}</span>
                  </div>
                );
              })}
              {interaction.attachments!.length > 4 && (
                <div className="px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground">
                  +{interaction.attachments!.length - 4} 更多
                </div>
              )}
            </div>
          </div>
        )}

        {/* 备注 */}
        {interaction.notes && (
          <>
            <Separator className="my-3" />
            <p className="text-xs text-muted-foreground italic">"{interaction.notes}"</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
