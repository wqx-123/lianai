import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function InteractionListSkeleton() {
  return (
    <div className="space-y-6">
      {/* 日期分组标题 */}
      {[...Array(3)].map((_, groupIndex) => (
        <div key={groupIndex}>
          <div className="flex items-center gap-4 mb-3">
            <Skeleton className="h-6 w-32" />
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* 记录卡片 */}
          <div className="space-y-3">
            {[...Array(2)].map((_, cardIndex) => (
              <Card key={cardIndex}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-8 w-8" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
