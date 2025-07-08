import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Star, Trophy, Zap } from "lucide-react";

interface ProgressHintProps {
  current: number;
  target: number;
  label: string;
  icon: React.ReactNode;
  nextReward: string;
}

export function ProgressHint({ current, target, label, icon, nextReward }: ProgressHintProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const isComplete = current >= target;

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {icon}
            <span className="text-sm font-medium text-gray-800">{label}</span>
          </div>
          <Badge variant={isComplete ? "default" : "secondary"} className="text-xs">
            {current}/{target}
          </Badge>
        </div>
        <Progress value={percentage} className="h-2 mb-2" />
        <p className="text-xs text-gray-600">
          {isComplete ? "🎉 Complete!" : `Next: ${nextReward}`}
        </p>
      </CardContent>
    </Card>
  );
}

export function NextBadgeHint({ spotsHunted }: { spotsHunted: number }) {
  const hints = [
    { spots: 1, badge: "First Hunt Cutie", description: "Check into your first spot" },
    { spots: 5, badge: "Explorer Babe", description: "Discover 5 different spots" },
    { spots: 10, badge: "Local Legend", description: "Hunt 10 spots like a pro" },
    { spots: 25, badge: "Trendsetter", description: "Find 25 amazing places" },
    { spots: 50, badge: "Ultimate Hunter", description: "Master of spot discovery" }
  ];

  const nextHint = hints.find(h => spotsHunted < h.spots);
  if (!nextHint) return null;

  return (
    <ProgressHint
      current={spotsHunted}
      target={nextHint.spots}
      label="Spots Progress"
      icon={<Target className="w-4 h-4 text-purple-500" />}
      nextReward={`${nextHint.badge} badge`}
    />
  );
}

export function StreakProgress({ currentStreak }: { currentStreak: number }) {
  const nextMilestone = currentStreak < 3 ? 3 : currentStreak < 7 ? 7 : currentStreak < 30 ? 30 : null;
  
  if (!nextMilestone) return null;

  return (
    <ProgressHint
      current={currentStreak}
      target={nextMilestone}
      label="Daily Streak"
      icon={<Zap className="w-4 h-4 text-yellow-500" />}
      nextReward={`${nextMilestone} day streak reward`}
    />
  );
}