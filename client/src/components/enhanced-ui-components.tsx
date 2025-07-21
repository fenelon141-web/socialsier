import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Zap, Sparkles, TrendingUp, Award } from 'lucide-react';

// Success feedback with celebration animation
export function SuccessFeedback({ message, onClose, autoClose = true }: {
  message: string;
  onClose: () => void;
  autoClose?: boolean;
}) {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <Card className="success-gradient rounded-3xl shadow-2xl border-0 max-w-sm mx-4 overflow-hidden">
        <CardContent className="p-6 text-center text-white">
          <div className="relative">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 animate-bounce" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
            <div className="absolute -top-4 -left-2 w-4 h-4 bg-pink-400 rounded-full animate-ping delay-100"></div>
          </div>
          <h3 className="text-lg font-bold mb-2">Success!</h3>
          <p className="text-sm opacity-90 mb-4">{message}</p>
          <Button
            onClick={onClose}
            variant="outline"
            className="text-white border-white/30 hover:bg-white/20"
            size="sm"
          >
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Trending indicator with pulse effect
export function TrendingBadge({ count }: { count: number }) {
  return (
    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white animate-pulse shadow-lg">
      <TrendingUp className="w-3 h-3 mr-1" />
      {count} trending
    </Badge>
  );
}

// Enhanced level progress with visual feedback
export function LevelProgress({ currentXP, nextLevelXP, level }: {
  currentXP: number;
  nextLevelXP: number;
  level: number;
}) {
  const progress = (currentXP / nextLevelXP) * 100;
  
  return (
    <Card className="glass-morphism border-white/20 rounded-2xl overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-gray-800">Level {level}</span>
          </div>
          <span className="text-sm text-gray-600">{currentXP}/{nextLevelXP} XP</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
          </div>
        </div>
        <p className="text-xs text-gray-600 text-center">
          {nextLevelXP - currentXP} XP until next level
        </p>
      </CardContent>
    </Card>
  );
}

// Interactive achievement celebration
export function AchievementToast({ badge, onClose }: {
  badge: { name: string; emoji: string; description: string };
  onClose: () => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl shadow-2xl border-0 max-w-sm overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl animate-bounce">{badge.emoji}</div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">New Badge Earned!</h4>
              <p className="text-xs opacity-90">{badge.name}</p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 p-1"
            >
              ×
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Enhanced floating action button
export function FloatingActionButton({ 
  onClick, 
  icon: Icon, 
  label, 
  variant = 'primary' 
}: {
  onClick: () => void;
  icon: any;
  label: string;
  variant?: 'primary' | 'secondary';
}) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Button
      onClick={() => {
        setIsPressed(true);
        onClick();
        setTimeout(() => setIsPressed(false), 150);
      }}
      className={`fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-2xl transition-all duration-200 z-40 ${
        variant === 'primary'
          ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600'
          : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
      } ${isPressed ? 'scale-90' : 'hover:scale-110'} group`}
    >
      <Icon className="w-6 h-6 text-white group-hover:animate-pulse" />
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {label}
      </div>
    </Button>
  );
}

// Pulse loading indicator
export function PulseLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${sizeClasses[size]} bg-pink-500 rounded-full animate-pulse`}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

// Interactive counter with animation
export function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = count;
    const endValue = value;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const currentValue = Math.floor(startValue + (endValue - startValue) * progress);
      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span className="font-bold tabular-nums">{count.toLocaleString()}</span>;
}