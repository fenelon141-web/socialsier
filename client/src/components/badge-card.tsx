import { formatDistanceToNow } from "date-fns";
import type { UserBadge, Badge } from "@shared/schema";

interface BadgeCardProps {
  userBadge: UserBadge & { badge: Badge };
}

export default function BadgeCard({ userBadge }: BadgeCardProps) {
  const timeAgo = formatDistanceToNow(new Date(userBadge.earnedAt || new Date()), { addSuffix: false });

  return (
    <button 
      className="flex-shrink-0 bg-white rounded-xl p-3 text-center shadow-md min-w-[80px] border border-green-200 transition-transform active:scale-95 cursor-pointer min-h-[44px]"
      style={{
        WebkitTapHighlightColor: 'rgba(34, 197, 94, 0.2)',
        touchAction: 'manipulation',
        WebkitUserSelect: 'none'
      }}
      aria-label={`Badge: ${userBadge.badge.name}, earned ${timeAgo} ago`}
    >
      <div className="text-2xl mb-1 pointer-events-none">{userBadge.badge.emoji}</div>
      <p className="text-xs font-semibold text-gray-800 pointer-events-none">{userBadge.badge.name}</p>
      <p className="text-xs text-gray-500 pointer-events-none">{timeAgo} ago</p>
    </button>
  );
}
