import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function SpotCardSkeleton() {
  return (
    <Card className="bg-white rounded-xl p-3 shadow-md border border-purple-100">
      <div className="flex items-center space-x-3">
        <Skeleton className="w-16 h-16 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <div className="flex space-x-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        </div>
        <div className="flex space-x-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </div>
    </Card>
  );
}

export function BadgeCardSkeleton() {
  return (
    <Card className="w-24 h-32">
      <CardContent className="p-3 text-center">
        <Skeleton className="w-12 h-12 rounded-full mx-auto mb-2" />
        <Skeleton className="h-3 w-full mb-1" />
        <Skeleton className="h-2 w-3/4 mx-auto" />
      </CardContent>
    </Card>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="flex items-center space-x-3 p-3 border-b">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-3/4 mb-1" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}