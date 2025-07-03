import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import type { DailyChallenge, UserChallengeProgress } from "@shared/schema";

export default function DailyChallenge() {
  const { data: challenges } = useQuery<DailyChallenge[]>({
    queryKey: ["/api/challenges"]
  });

  const { data: progress } = useQuery<(UserChallengeProgress & { challenge: DailyChallenge })[]>({
    queryKey: ["/api/user/1/challenges"]
  });

  const currentChallenge = challenges?.[0];
  const currentProgress = progress?.[0];

  if (!currentChallenge || !currentProgress) {
    return null;
  }

  const progressPercentage = Math.min((currentProgress.progress / 3) * 100, 100); // Assuming requirement is 3

  return (
    <div className="bg-orange-200 p-3 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
      <p className="text-sm font-semibold text-gray-800">
        {currentChallenge.emoji} Daily Quest: {currentChallenge.title} ({currentProgress.progress}/3)
      </p>
      <div className="w-full bg-white bg-opacity-50 rounded-full h-2 mt-1">
        <div 
          className="bg-pink-400 h-2 rounded-full transition-all duration-500" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
}
