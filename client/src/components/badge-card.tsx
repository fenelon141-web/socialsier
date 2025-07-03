import { formatDistanceToNow } from "date-fns";
import type { UserBadge, Badge } from "@shared/schema";

interface BadgeCardProps {
  userBadge: UserBadge & { badge: Badge };
}

export default function BadgeCard({ userBadge }: BadgeCardProps) {
  const timeAgo = formatDistanceToNow(new Date(userBadge.earnedAt), { addSuffix: false });

  return (
    <div className="flex-shrink-0 bg-white rounded-xl p-3 text-center shadow-md min-w-[80px] border border-green-200">
      <div className="text-2xl mb-1">{userBadge.badge.emoji}</div>
      <p className="text-xs font-semibold text-gray-800">{userBadge.badge.name}</p>
      <p className="text-xs text-gray-500">{timeAgo} ago</p>
    </div>
  );
}
