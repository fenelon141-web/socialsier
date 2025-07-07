import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CelebrationAnimationProps {
  show: boolean;
  onComplete: () => void;
  pointsEarned: number;
  newBadges?: any[];
  spotName: string;
}

export function CelebrationAnimation({ 
  show, 
  onComplete, 
  pointsEarned, 
  newBadges = [], 
  spotName 
}: CelebrationAnimationProps) {
  const [showFireworks, setShowFireworks] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    if (show) {
      // Stagger the animations for maximum impact
      setShowFireworks(true);
      setShowConfetti(true);
      
      setTimeout(() => setShowText(true), 200);
      
      // Auto complete after animation
      setTimeout(() => {
        setShowFireworks(false);
        setShowConfetti(false);
        setShowText(false);
        onComplete();
      }, 4000);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Fireworks Effects */}
        {showFireworks && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"
                initial={{ 
                  x: typeof window !== 'undefined' ? window.innerWidth / 2 : 400, 
                  y: typeof window !== 'undefined' ? window.innerHeight / 2 : 300,
                  scale: 0 
                }}
                animate={{ 
                  x: (typeof window !== 'undefined' ? window.innerWidth / 2 : 400) + (Math.cos(i * 45 * Math.PI / 180) * 200),
                  y: (typeof window !== 'undefined' ? window.innerHeight / 2 : 300) + (Math.sin(i * 45 * Math.PI / 180) * 200),
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 1.5, 
                  delay: i * 0.1,
                  repeat: 2,
                  repeatDelay: 0.5
                }}
              />
            ))}
            
            {/* Additional sparkles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                initial={{ 
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800), 
                  y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 600),
                  scale: 0 
                }}
                animate={{ 
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                  rotate: 360
                }}
                transition={{ 
                  duration: 2, 
                  delay: Math.random() * 2,
                  repeat: 1
                }}
              />
            ))}
          </div>
        )}

        {/* Confetti Effects */}
        {showConfetti && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(25)].map((_, i) => (
              <motion.div
                key={`confetti-${i}`}
                className={`absolute w-3 h-3 ${
                  i % 4 === 0 ? 'bg-pink-400' :
                  i % 4 === 1 ? 'bg-purple-400' :
                  i % 4 === 2 ? 'bg-yellow-400' : 'bg-blue-400'
                } rounded-sm`}
                initial={{ 
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800), 
                  y: -50,
                  rotate: 0 
                }}
                animate={{ 
                  y: (typeof window !== 'undefined' ? window.innerHeight : 600) + 50,
                  rotate: 360 * 3,
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800)
                }}
                transition={{ 
                  duration: 3 + Math.random() * 2, 
                  delay: Math.random() * 1,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        )}

        {/* Main Celebration Content */}
        <AnimatePresence>
          {showText && (
            <motion.div 
              className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl max-w-sm mx-4 text-center"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 10 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 20 
              }}
            >
              {/* Success Icon */}
              <motion.div
                className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              >
                ✨
              </motion.div>

              {/* Title */}
              <motion.h2 
                className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Checked In!
              </motion.h2>

              {/* Spot Name */}
              <motion.p 
                className="text-gray-700 mb-4 font-medium"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {spotName}
              </motion.p>

              {/* Points */}
              <motion.div 
                className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl p-4 mb-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="text-3xl font-bold text-yellow-700">
                  +{pointsEarned}
                </div>
                <div className="text-yellow-600 text-sm">Points Earned!</div>
              </motion.div>

              {/* New Badges */}
              {newBadges && newBadges.length > 0 && (
                <motion.div 
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h3 className="text-lg font-semibold text-gray-800">New Badge{newBadges.length > 1 ? 's' : ''}!</h3>
                  {newBadges.map((badge, index) => (
                    <motion.div
                      key={badge.id}
                      className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3 flex items-center space-x-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                    >
                      <div className="text-2xl">{badge.icon}</div>
                      <div>
                        <div className="font-semibold text-purple-800">{badge.name}</div>
                        <div className="text-sm text-purple-600">{badge.description}</div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Encouraging Messages */}
              <motion.div 
                className="mt-6 text-sm text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                Keep exploring! ✨
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}