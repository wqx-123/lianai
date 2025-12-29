'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Loader2 } from 'lucide-react';
import { Profile, Gender, ZodiacSign, MBTIType, AttachmentStyle, LoveLanguage } from '@/types';
import { calculateZodiac, calculateAge } from '@/lib/storage';
import { personaRules } from '@/lib/rules/persona';

const profileSchema = z.object({
  name: z.string().min(1, '请输入姓名'),
  age: z.number().min(1, '请输入有效年龄').max(120, '请输入有效年龄'),
  gender: z.enum(['male', 'female', 'other']),
  birthday: z.string().min(1, '请选择生日'),
  zodiac: z.enum(['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']).optional(),
  occupation: z.string().min(1, '请输入职业'),
  contact: z.string().optional(),
  location: z.string().optional(),
  mbti: z.enum(['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ']).optional(),
  attachmentStyle: z.enum(['secure', 'anxious', 'avoidant', 'disorganized']).optional(),
  loveLanguages: z.array(z.enum(['words_of_affirmation', 'quality_time', 'receiving_gifts', 'acts_of_service', 'physical_touch'])).optional(),
  notes: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'other', label: '其他' },
];

const ZODIAC_OPTIONS: { value: ZodiacSign; label: string }[] = [
  { value: 'aries', label: '白羊座' },
  { value: 'taurus', label: '金牛座' },
  { value: 'gemini', label: '双子座' },
  { value: 'cancer', label: '巨蟹座' },
  { value: 'leo', label: '狮子座' },
  { value: 'virgo', label: '处女座' },
  { value: 'libra', label: '天秤座' },
  { value: 'scorpio', label: '天蝎座' },
  { value: 'sagittarius', label: '射手座' },
  { value: 'capricorn', label: '摩羯座' },
  { value: 'aquarius', label: '水瓶座' },
  { value: 'pisces', label: '双鱼座' },
];

const INTEREST_TAGS = [
  '旅行', '美食', '电影', '音乐', '阅读', '运动', '游戏',
  '摄影', '烹饪', '健身', '画画', '唱歌', '舞蹈', '写作',
  '露营', '徒步', '瑜伽', '游泳', '骑行', '咖啡', '茶道',
];

const PERSONALITY_TAGS = [
  '温柔', '活泼', '内向', '外向', '幽默', '细心', '体贴',
  '独立', '浪漫', '现实', '感性', '理性', '随和', '真诚',
];

const MBTI_OPTIONS: { value: MBTIType; label: string }[] = [
  { value: 'ISTJ', label: 'ISTJ - 物流师' },
  { value: 'ISFJ', label: 'ISFJ - 守卫者' },
  { value: 'INFJ', label: 'INFJ - 提倡者' },
  { value: 'INTJ', label: 'INTJ - 建筑师' },
  { value: 'ISTP', label: 'ISTP - 鉴赏家' },
  { value: 'ISFP', label: 'ISFP - 探险家' },
  { value: 'INFP', label: 'INFP - 调停者' },
  { value: 'INTP', label: 'INTP - 逻辑学家' },
  { value: 'ESTP', label: 'ESTP - 企业家' },
  { value: 'ESFP', label: 'ESFP - 表演者' },
  { value: 'ENFP', label: 'ENFP - 竞选者' },
  { value: 'ENTP', label: 'ENTP - 辩论家' },
  { value: 'ESTJ', label: 'ESTJ - 总经理' },
  { value: 'ESFJ', label: 'ESFJ - 执政官' },
  { value: 'ENFJ', label: 'ENFJ - 主人公' },
  { value: 'ENTJ', label: 'ENTJ - 指挥官' },
];

const ATTACHMENT_STYLE_OPTIONS: { value: AttachmentStyle; label: string }[] = [
  { value: 'secure', label: '安全型 - 容易信任他人，情绪稳定' },
  { value: 'anxious', label: '焦虑型 - 渴望亲密，需要持续确认' },
  { value: 'avoidant', label: '回避型 - 重视独立，回避亲密' },
  { value: 'disorganized', label: '混乱型 - 既渴望又害怕亲密' },
];

const LOVE_LANGUAGE_OPTIONS: { value: LoveLanguage; label: string; emoji: string }[] = [
  { value: 'words_of_affirmation', label: '肯定言辞', emoji: '💬' },
  { value: 'quality_time', label: '精心时刻', emoji: '⏰' },
  { value: 'receiving_gifts', label: '接受礼物', emoji: '🎁' },
  { value: 'acts_of_service', label: '服务行动', emoji: '🤝' },
  { value: 'physical_touch', label: '身体接触', emoji: '🤗' },
];

interface ProfileFormProps {
  initialData?: Profile;
  onSubmit: (data: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function ProfileForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = '保存',
}: ProfileFormProps) {
  const [interests, setInterests] = useState<string[]>(initialData?.interests || []);
  const [personalityTags, setPersonalityTags] = useState<string[]>(initialData?.personalityTags || []);
  const [loveLanguages, setLoveLanguages] = useState<LoveLanguage[]>(initialData?.loveLanguages || []);
  const [newInterest, setNewInterest] = useState('');
  const [newPersonality, setNewPersonality] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      age: initialData.age,
      gender: initialData.gender,
      birthday: initialData.birthday,
      zodiac: initialData.zodiac,
      occupation: initialData.occupation,
      contact: initialData.contact,
      location: initialData.location,
      mbti: initialData.mbti,
      attachmentStyle: initialData.attachmentStyle,
      loveLanguages: initialData.loveLanguages,
      notes: initialData.notes,
    } : {
      gender: 'female' as Gender,
      birthday: '',
    },
  });

  const birthday = watch('birthday');

  // 当生日改变时，自动计算星座和年龄
  const handleBirthdayChange = (date: string) => {
    setValue('birthday', date);
    if (date) {
      const zodiac = calculateZodiac(date);
      setValue('zodiac', zodiac);
      const age = calculateAge(date);
      setValue('age', age);
    }
  };

  const addInterest = (tag: string) => {
    if (tag && !interests.includes(tag)) {
      setInterests([...interests, tag]);
    }
    setNewInterest('');
  };

  const removeInterest = (tag: string) => {
    setInterests(interests.filter((t) => t !== tag));
  };

  const addPersonality = (tag: string) => {
    if (tag && !personalityTags.includes(tag)) {
      setPersonalityTags([...personalityTags, tag]);
    }
    setNewPersonality('');
  };

  const removePersonality = (tag: string) => {
    setPersonalityTags(personalityTags.filter((t) => t !== tag));
  };

  const onFormSubmit = async (data: ProfileFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        interests,
        personalityTags,
        loveLanguages,
        zodiac: data.zodiac || calculateZodiac(data.birthday),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLoveLanguage = (lang: LoveLanguage) => {
    if (loveLanguages.includes(lang)) {
      setLoveLanguages(loveLanguages.filter(l => l !== lang));
    } else {
      setLoveLanguages([...loveLanguages, lang]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* 基本信息 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">基本信息</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">姓名 *</Label>
            <Input id="name" placeholder="输入姓名" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">年龄 *</Label>
            <Input
              id="age"
              type="number"
              placeholder="年龄"
              {...register('age', { valueAsNumber: true })}
            />
            {errors.age && <p className="text-sm text-destructive">{errors.age.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">性别 *</Label>
            <Select
              value={watch('gender')}
              onValueChange={(value) => setValue('gender', value as Gender)}
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="选择性别" />
              </SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthday">生日 *</Label>
            <Input
              id="birthday"
              type="date"
              {...register('birthday')}
              onChange={(e) => handleBirthdayChange(e.target.value)}
            />
            {errors.birthday && <p className="text-sm text-destructive">{errors.birthday.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="zodiac">星座</Label>
            <Select
              value={watch('zodiac')}
              onValueChange={(value) => setValue('zodiac', value as ZodiacSign)}
            >
              <SelectTrigger id="zodiac">
                <SelectValue placeholder="根据生日自动计算" />
              </SelectTrigger>
              <SelectContent>
                {ZODIAC_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation">职业 *</Label>
            <Input id="occupation" placeholder="输入职业" {...register('occupation')} />
            {errors.occupation && <p className="text-sm text-destructive">{errors.occupation.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">居住地</Label>
            <Input id="location" placeholder="城市/区域" {...register('location')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">联系方式</Label>
            <Input id="contact" placeholder="电话/微信等" {...register('contact')} />
          </div>
        </div>
      </div>

      {/* 兴趣爱好 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">兴趣爱好</h3>
        <div className="flex flex-wrap gap-2">
          {interests.map((interest) => (
            <Badge key={interest} variant="secondary" className="px-3 py-1">
              {interest}
              <button
                type="button"
                onClick={() => removeInterest(interest)}
                className="ml-2 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="添加兴趣或选择下方标签"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest(newInterest))}
          />
          <Button type="button" onClick={() => addInterest(newInterest)} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {INTEREST_TAGS.map((tag) => (
            <Badge
              key={tag}
              variant={interests.includes(tag) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => {
                if (interests.includes(tag)) {
                  removeInterest(tag);
                } else {
                  addInterest(tag);
                }
              }}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* 性格标签 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">性格标签</h3>
        <div className="flex flex-wrap gap-2">
          {personalityTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="px-3 py-1">
              {tag}
              <button
                type="button"
                onClick={() => removePersonality(tag)}
                className="ml-2 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="添加性格或选择下方标签"
            value={newPersonality}
            onChange={(e) => setNewPersonality(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPersonality(newPersonality))}
          />
          <Button type="button" onClick={() => addPersonality(newPersonality)} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {PERSONALITY_TAGS.map((tag) => (
            <Badge
              key={tag}
              variant={personalityTags.includes(tag) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => {
                if (personalityTags.includes(tag)) {
                  removePersonality(tag);
                } else {
                  addPersonality(tag);
                }
              }}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* 人物画像 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">人物画像</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* MBTI */}
          <div className="space-y-2">
            <Label htmlFor="mbti">MBTI 类型</Label>
            <Select
              value={watch('mbti')}
              onValueChange={(value) => setValue('mbti', value as MBTIType)}
            >
              <SelectTrigger id="mbti">
                <SelectValue placeholder="选择 MBTI" />
              </SelectTrigger>
              <SelectContent>
                {MBTI_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 依恋类型 */}
          <div className="space-y-2">
            <Label htmlFor="attachmentStyle">依恋类型</Label>
            <Select
              value={watch('attachmentStyle')}
              onValueChange={(value) => setValue('attachmentStyle', value as AttachmentStyle)}
            >
              <SelectTrigger id="attachmentStyle">
                <SelectValue placeholder="选择依恋类型" />
              </SelectTrigger>
              <SelectContent>
                {ATTACHMENT_STYLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 爱的语言 */}
          <div className="space-y-2">
            <Label>爱的语言</Label>
            <div className="flex flex-wrap gap-2">
              {LOVE_LANGUAGE_OPTIONS.map((option) => (
                <Badge
                  key={option.value}
                  variant={loveLanguages.includes(option.value) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleLoveLanguage(option.value)}
                >
                  {option.emoji} {option.label}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">可多选，选择对方最能感受到爱的方式</p>
          </div>
        </div>
      </div>

      {/* 备注 */}
      <div className="space-y-2">
        <Label htmlFor="notes">备注</Label>
        <Textarea
          id="notes"
          placeholder="记录关于TA的任何信息..."
          rows={4}
          {...register('notes')}
        />
      </div>

      {/* 按钮 */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" /> : submitLabel}
        </Button>
      </div>
    </form>
  );
}
