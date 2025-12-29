'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Briefcase, Trash2, Edit, Star } from 'lucide-react';
import { Profile, RelationshipStage } from '@/types';
import { formatRelativeTime } from '@/lib/storage';

const STAGE_INFO: Record<RelationshipStage, { name: string; color: string }> = {
  meeting: { name: '认识阶段', color: 'bg-blue-500' },
  knowing: { name: '了解阶段', color: 'bg-green-500' },
  escalating: { name: '关系升级', color: 'bg-yellow-500' },
  intimate: { name: '亲密关系', color: 'bg-pink-500' },
  committed: { name: '确认关系', color: 'bg-red-500' },
};

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

interface ProfileListProps {
  profiles: Profile[];
  currentStages?: Record<string, RelationshipStage>;
  onDelete?: (id: string) => void;
  onEdit?: (profile: Profile) => void;
  onToggleFavorite?: (id: string) => void;
}

export function ProfileList({ profiles, currentStages, onDelete, onEdit, onToggleFavorite }: ProfileListProps) {
  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Heart className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">还没有添加对象</h3>
        <p className="text-sm text-muted-foreground mb-4">
          点击下方按钮添加第一个心动对象
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {profiles.map((profile) => {
        const stage = currentStages?.[profile.id];
        const stageInfo = stage ? STAGE_INFO[stage] : null;

        return (
          <Card key={profile.id} className={`overflow-hidden hover:shadow-lg transition-shadow ${profile.isFavorite ? 'ring-2 ring-pink-400' : ''}`}>
            <Link href={`/profile/${profile.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-pink-400 to-purple-400 text-white">
                        {profile.name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    {profile.isFavorite && (
                      <div className="absolute -top-1 -right-1 bg-pink-500 rounded-full p-1">
                        <Star className="h-3 w-3 text-white fill-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg truncate">{profile.name}</h3>
                      {profile.isFavorite && (
                        <Star className="h-4 w-4 text-pink-500 fill-pink-500" />
                      )}
                      {stageInfo && (
                        <Badge className={`${stageInfo.color} text-white text-xs`}>
                          {stageInfo.name}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{profile.age}岁</span>
                      <span>·</span>
                      <span>{profile.gender === 'male' ? '男' : profile.gender === 'female' ? '女' : '其他'}</span>
                      {profile.zodiac && (
                        <>
                          <span>·</span>
                          <span title={profile.zodiac}>
                            {ZODIAC_EMOJIS[profile.zodiac] || '⭐'}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="mt-3 space-y-1">
                      {profile.occupation && (
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate">{profile.occupation}</span>
                        </div>
                      )}
                      {profile.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate">{profile.location}</span>
                        </div>
                      )}
                    </div>

                    {Array.isArray(profile.interests) && profile.interests.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {profile.interests.slice(0, 3).map((interest) => (
                          <Badge key={interest} variant="outline" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                        {profile.interests.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{profile.interests.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {profile.notes && (
                  <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                    {profile.notes}
                  </p>
                )}
              </CardContent>
            </Link>

            {(onDelete || onEdit || onToggleFavorite) && (
              <CardFooter className="px-6 pb-6 pt-0 flex gap-2">
                {onToggleFavorite && (
                  <Button
                    variant={profile.isFavorite ? "default" : "outline"}
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      onToggleFavorite(profile.id);
                    }}
                    className={profile.isFavorite ? "bg-pink-500 hover:bg-pink-600" : ""}
                  >
                    <Star className={`h-4 w-4 ${profile.isFavorite ? 'fill-white' : ''}`} />
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      onEdit(profile);
                    }}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    编辑
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      if (confirm('确定要删除这个对象吗？')) {
                        onDelete(profile.id);
                      }
                    }}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            )}
          </Card>
        );
      })}
    </div>
  );
}
