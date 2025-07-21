import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Navigation, Heart, Share2 } from 'lucide-react';
import type { Spot } from '@shared/schema';

interface EnhancedSpotCardProps {
  spot: Spot;
  distance?: number;
  onHunt?: (spotId: number) => void;
  onNavigate?: (spot: Spot) => void;
  isHunting?: boolean;
  isInRange?: boolean;
}

export default function EnhancedSpotCard({ 
  spot, 
  distance, 
  onHunt, 
  onNavigate, 
  isHunting = false,
  isInRange = true 
}: EnhancedSpotCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'cafe': return 'bg-amber-100 text-amber-800';
      case 'restaurant': return 'bg-green-100 text-green-800';
      case 'bar': return 'bg-purple-100 text-purple-800';
      case 'fitness': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriceColor = (price: string) => {
    switch (price) {
      case '$': return 'text-green-600';
      case '$$': return 'text-yellow-600';
      case '$$$': return 'text-orange-600';
      case '$$$$': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="floating-card bg-white border-0 shadow-lg overflow-hidden group">
      <div className="relative">
        {/* Image with overlay */}
        <div className="relative h-40 bg-gradient-to-br from-pink-200 to-purple-200 overflow-hidden">
          <img 
            src={spot.imageUrl} 
            alt={spot.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          
          {/* Top badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            <Badge className={`text-xs ${getCategoryColor(spot.category)}`}>
              {spot.category}
            </Badge>
            {spot.trending && (
              <Badge className="text-xs bg-gradient-to-r from-pink-500 to-red-500 text-white animate-pulse">
                🔥 Trending
              </Badge>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="w-8 h-8 p-0 bg-white/80 backdrop-blur-sm hover:bg-white/90"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="w-8 h-8 p-0 bg-white/80 backdrop-blur-sm hover:bg-white/90"
            >
              <Share2 className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
          
          {/* Distance badge */}
          {distance && (
            <div className="absolute bottom-3 right-3">
              <Badge className={`text-xs ${isInRange ? 'bg-green-500' : 'bg-orange-500'} text-white`}>
                <MapPin className="w-3 h-3 mr-1" />
                {distance}m
              </Badge>
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-pink-600 transition-colors">
                {spot.name}
              </h3>
              <p className="text-sm text-gray-600 truncate">{spot.address}</p>
            </div>
            <div className="flex items-center space-x-1 ml-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-gray-700">{spot.rating.toFixed(1)}</span>
            </div>
          </div>
          
          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {spot.description}
          </p>
          
          {/* Tags and Price */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-wrap gap-1">
              {spot.dietaryOptions && spot.dietaryOptions.slice(0, 2).map((option) => (
                <Badge key={option} variant="outline" className="text-xs">
                  {option}
                </Badge>
              ))}
            </div>
            <div className={`text-sm font-bold ${getPriceColor(spot.priceRange || '$$')}`}>
              {spot.priceRange || '$$'}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => onNavigate?.(spot)}
              variant="outline"
              size="sm"
              className="flex-1 text-xs hover:bg-blue-50 hover:border-blue-300"
            >
              <Navigation className="w-4 h-4 mr-1" />
              Directions
            </Button>
            <Button
              onClick={() => onHunt?.(spot.id)}
              disabled={!isInRange || isHunting}
              size="sm"
              className={`flex-1 text-xs font-semibold ${
                isInRange 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isHunting ? (
                <div className="flex items-center">
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                  Hunting...
                </div>
              ) : isInRange ? (
                'Hunt Spot!'
              ) : (
                'Too Far'
              )}
            </Button>
          </div>
          
          {/* Hunt count */}
          <div className="flex items-center justify-center mt-2 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              🏃‍♀️ {spot.huntCount} hunters visited
            </span>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}