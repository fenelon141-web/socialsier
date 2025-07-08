import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  pullProgress: number;
  isRefreshing: boolean;
}

export function PullToRefreshIndicator({ 
  pullDistance, 
  pullProgress, 
  isRefreshing 
}: PullToRefreshIndicatorProps) {
  if (pullDistance === 0 && !isRefreshing) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-safe"
      initial={{ y: -60 }}
      animate={{ y: pullDistance > 0 || isRefreshing ? 0 : -60 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div 
        className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg p-3 flex items-center space-x-2"
        style={{
          transform: `scale(${0.7 + pullProgress * 0.3})`,
          opacity: pullProgress
        }}
      >
        <RefreshCw 
          className={`w-5 h-5 text-purple-500 ${isRefreshing ? 'animate-spin' : ''}`}
          style={{
            transform: `rotate(${pullProgress * 180}deg)`
          }}
        />
        <span className="text-sm font-medium text-purple-600">
          {isRefreshing ? 'Refreshing...' : pullProgress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
        </span>
      </div>
    </motion.div>
  );
}