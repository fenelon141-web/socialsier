import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MapPin, Calendar, Users, Zap } from 'lucide-react';

// Enhanced search with smart suggestions
export function SmartSearchBar({ onSearch, suggestions = [] }: {
  onSearch: (query: string) => void;
  suggestions?: string[];
}) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (query.length > 1) {
      const filtered = suggestions.filter(s => 
        s.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [query, suggestions]);

  return (
    <div className="relative">
      <Card className="glass-morphism border-white/20 rounded-2xl overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-center space-x-3">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch(query)}
              placeholder="Search trendy spots, cafes, workouts..."
              className="border-0 bg-transparent focus:ring-0 placeholder:text-gray-400"
            />
            <Button
              size="sm"
              onClick={() => onSearch(query)}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4"
            >
              Go
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 bg-white shadow-xl border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-2">
            {filteredSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start text-left p-2 hover:bg-pink-50"
                onClick={() => {
                  setQuery(suggestion);
                  onSearch(suggestion);
                  setShowSuggestions(false);
                }}
              >
                <Search className="w-4 h-4 mr-2 text-gray-400" />
                {suggestion}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Quick action buttons with haptic feedback simulation
export function QuickActionGrid() {
  const [pressedAction, setPressedAction] = useState<string | null>(null);

  const actions = [
    { id: 'nearby', icon: MapPin, label: 'Nearby', color: 'from-blue-400 to-blue-600' },
    { id: 'trending', icon: Zap, label: 'Trending', color: 'from-orange-400 to-red-500' },
    { id: 'events', icon: Calendar, label: 'Events', color: 'from-green-400 to-green-600' },
    { id: 'friends', icon: Users, label: 'Friends', color: 'from-purple-400 to-purple-600' },
  ];

  const handleAction = (actionId: string) => {
    setPressedAction(actionId);
    
    // Simulate haptic feedback with visual and timing
    setTimeout(() => setPressedAction(null), 150);
    
    // Route to appropriate action
    switch (actionId) {
      case 'nearby':
        window.location.href = '/map';
        break;
      case 'trending':
        // Scroll to trending section or filter
        break;
      case 'events':
        // Show events
        break;
      case 'friends':
        window.location.href = '/social';
        break;
    }
  };

  return (
    <Card className="card-gradient rounded-2xl shadow-lg border-0 floating-card">
      <CardContent className="p-4">
        <h3 className="font-bold text-gray-800 mb-3 text-center">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            const isPressed = pressedAction === action.id;
            
            return (
              <Button
                key={action.id}
                onClick={() => handleAction(action.id)}
                className={`p-3 h-auto flex flex-col items-center space-y-1 transition-all duration-150 ${
                  isPressed ? 'scale-90' : 'hover:scale-105'
                } bg-gradient-to-br ${action.color} text-white border-0 shadow-lg hover:shadow-xl`}
              >
                <Icon className={`w-5 h-5 ${isPressed ? 'animate-pulse' : ''}`} />
                <span className="text-xs font-medium">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced filter interface
export function AdvancedFilters({ 
  onFilterChange,
  currentFilters = {}
}: {
  onFilterChange: (filters: any) => void;
  currentFilters?: any;
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState(currentFilters);

  const filterCategories = [
    {
      title: 'Category',
      options: ['All', 'Cafe', 'Restaurant', 'Bar', 'Fitness', 'Dessert']
    },
    {
      title: 'Price Range',
      options: ['Any', '$', '$$', '$$$', '$$$$']
    },
    {
      title: 'Dietary',
      options: ['Any', 'Vegan', 'Vegetarian', 'Gluten-Free', 'Keto', 'Healthy']
    },
    {
      title: 'Vibe',
      options: ['Any', 'Trendy', 'Cozy', 'Minimalist', 'Vibrant', 'Aesthetic']
    }
  ];

  return (
    <div className="space-y-3">
      <Button
        onClick={() => setShowFilters(!showFilters)}
        variant="outline"
        className="w-full bg-white/50 backdrop-blur-sm border-pink-200 hover:bg-pink-50"
      >
        <Filter className="w-4 h-4 mr-2" />
        Filters
        {Object.keys(activeFilters).length > 0 && (
          <Badge className="ml-2 bg-pink-500 text-white">
            {Object.keys(activeFilters).length}
          </Badge>
        )}
      </Button>

      {showFilters && (
        <Card className="glass-morphism border-white/20 rounded-2xl">
          <CardContent className="p-4 space-y-4">
            {filterCategories.map((category) => (
              <div key={category.title}>
                <h4 className="font-semibold text-gray-800 mb-2">{category.title}</h4>
                <div className="flex flex-wrap gap-2">
                  {category.options.map((option) => (
                    <Button
                      key={option}
                      size="sm"
                      variant={activeFilters[category.title.toLowerCase()] === option ? 'default' : 'outline'}
                      onClick={() => {
                        const newFilters = {
                          ...activeFilters,
                          [category.title.toLowerCase()]: option === 'All' || option === 'Any' ? undefined : option
                        };
                        setActiveFilters(newFilters);
                        onFilterChange(newFilters);
                      }}
                      className={`text-xs ${
                        activeFilters[category.title.toLowerCase()] === option
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                          : 'hover:bg-pink-50'
                      }`}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setActiveFilters({});
                  onFilterChange({});
                }}
                className="flex-1"
              >
                Clear All
              </Button>
              <Button
                size="sm"
                onClick={() => setShowFilters(false)}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white"
              >
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Real-time activity feed
export function LiveActivityFeed({ activities = [] }: { activities?: any[] }) {
  const [newActivity, setNewActivity] = useState<any>(null);

  useEffect(() => {
    if (activities.length > 0) {
      const latest = activities[0];
      setNewActivity(latest);
      const timer = setTimeout(() => setNewActivity(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [activities]);

  return (
    <div className="space-y-3">
      {newActivity && (
        <Card className="bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-2xl shadow-lg animate-slide-in-up">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live Update</span>
            </div>
            <p className="text-xs mt-1 opacity-90">{newActivity.description}</p>
          </CardContent>
        </Card>
      )}
      
      <Card className="glass-morphism border-white/20 rounded-2xl">
        <CardContent className="p-4">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Live Activity
          </h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {activities.slice(0, 5).map((activity, index) => (
              <div key={index} className="text-sm text-gray-600 py-1">
                <span className="font-medium">{activity.user}</span> {activity.action}
                <span className="text-xs text-gray-400 ml-1">
                  {activity.timestamp}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}