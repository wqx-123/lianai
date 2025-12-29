'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Interaction, InteractionType } from '@/types';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { zhCN } from 'date-fns/locale';

const interactionSchema = z.object({
  type: z.enum(['chat', 'call', 'date', 'gift', 'other']),
  title: z.string().min(1, '请输入标题'),
  timestamp: z.string().min(1, '请选择日期时间'),
  description: z.string().min(1, '请输入描述'),
  mood: z.enum(['positive', 'neutral', 'negative']).optional(),
  notes: z.string().optional(),
});

type InteractionFormData = z.infer<typeof interactionSchema>;

interface InteractionFormProps {
  personId: string;
  initialData?: Interaction;
  onSubmit: (data: Omit<Interaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  submitLabel?: string;
}

const TYPE_OPTIONS: Array<{ value: InteractionType; label: string; emoji: string }> = [
  { value: 'chat', label: '聊天', emoji: '💬' },
  { value: 'call', label: '通话', emoji: '📞' },
  { value: 'date', label: '约会', emoji: '💑' },
  { value: 'gift', label: '礼物', emoji: '🎁' },
  { value: 'other', label: '其他', emoji: '📝' },
];

const MOOD_OPTIONS: Array<{ value: 'positive' | 'neutral' | 'negative'; label: string; emoji: string }> = [
  { value: 'positive', label: '积极', emoji: '😊' },
  { value: 'neutral', label: '中性', emoji: '😐' },
  { value: 'negative', label: '消极', emoji: '😞' },
];

export function InteractionForm({
  personId,
  initialData,
  onSubmit,
  onCancel,
  submitLabel = '保存',
}: InteractionFormProps) {
  const form = useForm<InteractionFormData>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      type: initialData?.type || 'chat',
      title: initialData?.title || '',
      timestamp: initialData?.timestamp || new Date().toISOString(),
      description: initialData?.description || '',
      mood: initialData?.mood,
      notes: initialData?.notes,
    },
  });

  const handleSubmit = (data: InteractionFormData) => {
    onSubmit({
      personId,
      type: data.type,
      title: data.title,
      timestamp: data.timestamp,
      description: data.description,
      mood: data.mood,
      notes: data.notes,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* 记录类型 */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>记录类型</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <span>{option.emoji}</span>
                        <span>{option.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 标题 */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>标题</FormLabel>
              <FormControl>
                <Input placeholder="给这条记录起个标题..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 日期时间 */}
        <FormField
          control={form.control}
          name="timestamp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>日期时间</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), 'yyyy年MM月dd日 HH:mm')
                      ) : (
                        <span>选择日期和时间</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={new Date(field.value)}
                    onSelect={(date) => {
                      if (date) {
                        // 保持时间不变，只改日期
                        const originalTime = new Date(field.value);
                        date.setHours(originalTime.getHours());
                        date.setMinutes(originalTime.getMinutes());
                        field.onChange(date.toISOString());
                      }
                    }}
                    locale={zhCN}
                    initialFocus
                  />
                  <div className="p-3 border-t">
                    <Input
                      type="time"
                      value={format(new Date(field.value), 'HH:mm')}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':');
                        const date = new Date(field.value);
                        date.setHours(parseInt(hours));
                        date.setMinutes(parseInt(minutes));
                        field.onChange(date.toISOString());
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 描述 */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>描述</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="详细描述这次互动..."
                  className="min-h-[100px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 情绪 */}
        <FormField
          control={form.control}
          name="mood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>当时的心情（可选）</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择心情" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="undefined">不选择</SelectItem>
                  {MOOD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <span>{option.emoji}</span>
                        <span>{option.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 备注 */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>个人备注（可选）</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="写点什么给自己看..."
                  className="min-h-[80px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 按钮组 */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button type="submit">{submitLabel}</Button>
        </div>
      </form>
    </Form>
  );
}
