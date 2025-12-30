'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Profile, ZodiacAnalysis, PersonaAnalysis } from '@/types';
import { zodiacRules } from '@/lib/rules/zodiac';
import { personaRules } from '@/lib/rules/persona';
import { Star, Heart, Brain, Sparkles } from 'lucide-react';

interface AnalysisCardProps {
  profile: Profile;
  zodiacAnalysis?: ZodiacAnalysis;
  personaAnalysis?: PersonaAnalysis;
}

export function AnalysisCard({ profile, zodiacAnalysis, personaAnalysis }: AnalysisCardProps) {
  const zodiacInfo = zodiacRules.getZodiacInfo(profile.zodiac);

  return (
    <div className="space-y-6">
      {/* 星座分析 */}
      <Card className="border-purple-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-purple-500" />
            星座分析
          </CardTitle>
          <CardDescription>
            {profile.zodiac && zodiacInfo ? `${zodiacInfo.name} (${zodiacInfo.nameEn})` : '暂无星座信息'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {zodiacInfo && (
            <Tabs defaultValue="traits">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="traits">特质</TabsTrigger>
                <TabsTrigger value="love">爱情</TabsTrigger>
                <TabsTrigger value="communication">沟通</TabsTrigger>
                <TabsTrigger value="luck">幸运</TabsTrigger>
              </TabsList>

              <TabsContent value="traits" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-green-500" />
                      积极特质
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(zodiacInfo.traits?.positive) && zodiacInfo.traits.positive.map((trait) => (
                        <Badge key={trait} variant="secondary" className="bg-green-100 text-green-700">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-orange-500" />
                      需要注意
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(zodiacInfo.traits?.negative) && zodiacInfo.traits.negative.map((trait) => (
                        <Badge key={trait} variant="outline" className="text-orange-700 border-orange-200">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">元素：</span>
                      <Badge variant="outline">
                        {zodiacInfo.element === 'fire' && '火象'}
                        {zodiacInfo.element === 'earth' && '土象'}
                        {zodiacInfo.element === 'air' && '风象'}
                        {zodiacInfo.element === 'water' && '水象'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">守护星：</span>
                      <span className="font-medium">{zodiacInfo.ruler}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="love" className="mt-4">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4 pr-4">
                    <div>
                      <h4 className="font-semibold mb-2">恋爱风格</h4>
                      <p className="text-sm text-muted-foreground">{zodiacInfo.love.style}</p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">情感需求</h4>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(zodiacInfo.love?.needs) && zodiacInfo.love.needs.map((need) => (
                          <Badge key={need} variant="secondary">
                            {need}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">喜欢</h4>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(zodiacInfo.love?.turnOns) && zodiacInfo.love.turnOns.map((item) => (
                          <Badge key={item} className="bg-pink-100 text-pink-700">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">不喜欢</h4>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(zodiacInfo.love?.turnOffs) && zodiacInfo.love.turnOffs.map((item) => (
                          <Badge key={item} variant="outline" className="text-red-700 border-red-200">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="communication" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">沟通风格</h4>
                    <p className="text-sm text-muted-foreground">{zodiacInfo.communication.style}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">最佳方式</h4>
                    <p className="text-sm text-muted-foreground">{zodiacInfo.communication.bestApproach}</p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">避免行为</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(zodiacInfo.communication?.avoid) && zodiacInfo.communication.avoid.map((item) => (
                        <Badge key={item} variant="destructive">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="luck" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">幸运色</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(zodiacInfo.luck?.colors) && zodiacInfo.luck.colors.map((color) => (
                        <Badge key={color} variant="outline">
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">幸运数字</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(zodiacInfo.luck?.numbers) && zodiacInfo.luck.numbers.map((num) => (
                        <Badge key={num} variant="secondary">
                          {num}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">幸运日期</h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(zodiacInfo.luck?.days) && zodiacInfo.luck.days.map((day) => (
                        <Badge key={day} variant="outline">
                          每月{day}号
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* 人物画像分析 */}
      <Card className="border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            人物画像
          </CardTitle>
          <CardDescription>基于性格标签和行为模式的分析</CardDescription>
        </CardHeader>
        <CardContent>
          {personaAnalysis ? (
            <div className="space-y-4">
              {personaAnalysis.mbti && (
                <div>
                  <h4 className="font-semibold mb-2">MBTI 类型</h4>
                  <Badge className="text-sm px-3 py-1">{personaAnalysis.mbti}</Badge>
                  {(() => {
                    const mbtiInfo = personaRules.getMBTIInfo(personaAnalysis.mbti);
                    return mbtiInfo ? (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">特质：</span>{mbtiInfo.traits.join('、')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">恋爱风格：</span>{mbtiInfo.loveStyle}
                        </p>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              {personaAnalysis.attachmentStyle && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">依恋类型</h4>
                    <Badge variant="secondary">{personaRules.getAttachmentStyleInfo(personaAnalysis.attachmentStyle)?.name}</Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      {personaRules.getAttachmentStyleInfo(personaAnalysis.attachmentStyle)?.description}
                    </p>
                  </div>
                </>
              )}

              {personaAnalysis.loveLanguages && personaAnalysis.loveLanguages.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Heart className="h-4 w-4 text-pink-500" />
                      爱的语言
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(personaAnalysis.loveLanguages) && personaAnalysis.loveLanguages.map((lang) => (
                        <Badge key={lang} className="bg-pink-100 text-pink-700">
                          {personaRules.getLoveLanguageInfo(lang)?.name}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      通过这些方式表达爱意，对方更容易感受到你的心意
                    </p>
                  </div>
                </>
              )}

              {personaAnalysis.communicationStyle && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">沟通建议</h4>
                    <p className="text-sm text-muted-foreground">{personaAnalysis.communicationStyle}</p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              暂无画像分析，需要设置 MBTI、依恋类型等信息
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
