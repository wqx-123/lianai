'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, MessageSquare, Calendar, Phone, Gift } from 'lucide-react';
import { Profile, Interaction } from '@/types';
import { formatRelativeTime } from '@/lib/storage';

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

const INTERACTION_ICONS: Record<string, React.ReactNode> = {
  chat: <MessageSquare className="h-4 w-4" />,
  call: <Phone className="h-4 w-4" />,
  date: <Calendar className="h-4 w-4" />,
  gift: <Gift className="h-4 w-4" />,
  other: <MessageSquare className="h-4 w-4" />,
};

interface GlobalSearchProps {
  profiles: Profile[];
  interactions: Interaction[];
  onProfileClick?: (profileId: string) => void;
  onInteractionClick?: (profileId: string, interactionId: string) => void;
}

export function GlobalSearch({ profiles, interactions, onProfileClick, onInteractionClick }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleProfileSelect = (profileId: string) => {
    setOpen(false);
    onProfileClick?.(profileId);
  };

  const handleInteractionSelect = (profileId: string, interactionId: string) => {
    setOpen(false);
    onInteractionClick?.(profileId, interactionId);
  };

  // 生成搜索关键词 - 让 cmdk 自动过滤
  const profileItems = useMemo(() => {
    return profiles.map((profile) => {
      const searchKeywords = [
        profile.name,
        profile.occupation,
        profile.location,
        profile.notes,
        ...(profile.interests || []),
        ...(profile.personalityTags || []),
      ].filter(Boolean).join(' ');

      return (
        <CommandItem
          key={profile.id}
          onSelect={() => handleProfileSelect(profile.id)}
          className="cursor-pointer"
          value={searchKeywords.toLowerCase()}
        >
          <Avatar className="h-8 w-8 mr-2">
            <AvatarFallback className="text-xs bg-gradient-to-br from-pink-400 to-purple-400 text-white">
              {profile.name?.[0] || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium">{profile.name}</span>
              <span className="text-xs text-gray-500">{profile.age}岁</span>
              {profile.zodiac && (
                <span className="text-xs">{ZODIAC_EMOJIS[profile.zodiac]}</span>
              )}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {profile.occupation || profile.location || '无详细信息'}
            </div>
          </div>
        </CommandItem>
      );
    });
  }, [profiles]);

  const interactionItems = useMemo(() => {
    return interactions.map((interaction) => {
      const profile = profiles.find((p) => p.id === interaction.personId);
      const searchKeywords = [
        interaction.title,
        interaction.description,
        interaction.notes,
        profile?.name,
      ].filter(Boolean).join(' ');

      return (
        <CommandItem
          key={interaction.id}
          onSelect={() => handleInteractionSelect(interaction.personId, interaction.id)}
          className="cursor-pointer"
          value={searchKeywords.toLowerCase()}
        >
          <div className="mr-2 text-gray-400">
            {INTERACTION_ICONS[interaction.type] || INTERACTION_ICONS.other}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">
                {interaction.title || '无标题'}
              </span>
              <Badge variant="outline" className="text-xs">
                {profile?.name || '未知'}
              </Badge>
            </div>
            <div className="text-xs text-gray-500 truncate">
              {interaction.description || '无描述'}
            </div>
          </div>
          <div className="text-xs text-gray-400 ml-2">
            {formatRelativeTime(interaction.timestamp)}
          </div>
        </CommandItem>
      );
    });
  }, [interactions, profiles]);

  return (
    <>
      {/* 搜索触发按钮 */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-64"
      >
        <Search className="h-4 w-4 text-gray-400" />
        <span className="text-gray-500">搜索...</span>
        <kbd className="ml-auto flex items-center gap-1 text-xs text-gray-400">
          <span>⌘</span>K
        </kbd>
      </button>

      {/* 搜索对话框 */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="搜索对象、记录、标签..." />
        <CommandList>
          <CommandEmpty>没有找到相关结果</CommandEmpty>

          {/* 对象结果 */}
          {profiles.length > 0 && (
            <CommandGroup heading="对象">
              {profileItems}
            </CommandGroup>
          )}

          {/* 互动记录结果 */}
          {interactions.length > 0 && (
            <CommandGroup heading="互动记录">
              {interactionItems}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
