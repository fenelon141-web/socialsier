import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";

interface SearchFiltersProps {
  onFiltersChange: (filters: {
    priceRange?: string;
    dietary?: string;
    ambiance?: string;
    category?: string;
  }) => void;
}

export default function SearchFilters({ onFiltersChange }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: '',
    dietary: '',
    ambiance: '',
    category: ''
  });

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Remove empty filters before sending
    const cleanFilters = Object.fromEntries(
      Object.entries(newFilters).filter(([_, v]) => v !== '')
    );
    onFiltersChange(cleanFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      priceRange: '',
      dietary: '',
      ambiance: '',
      category: ''
    };
    setFilters(emptyFilters);
    onFiltersChange({});
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <div className="w-full">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between mb-3"
      >
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="bg-pink-100 text-pink-600">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
      </Button>

      {isOpen && (
        <Card className="mb-4">
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Search Filters</h3>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Price Range</label>
                <Select 
                  value={filters.priceRange} 
                  onValueChange={(value) => updateFilter('priceRange', value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    <SelectItem value="$">$ - Budget friendly</SelectItem>
                    <SelectItem value="$$">$$ - Moderate</SelectItem>
                    <SelectItem value="$$$">$$$ - Upscale</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-gray-600 mb-1 block">Dietary</label>
                <Select 
                  value={filters.dietary} 
                  onValueChange={(value) => updateFilter('dietary', value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    <SelectItem value="vegan">🌱 Vegan</SelectItem>
                    <SelectItem value="vegetarian">🥗 Vegetarian</SelectItem>
                    <SelectItem value="gluten_free">🌾 Gluten Free</SelectItem>
                    <SelectItem value="keto">🥑 Keto</SelectItem>
                    <SelectItem value="healthy">💚 Healthy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-gray-600 mb-1 block">Ambiance</label>
                <Select 
                  value={filters.ambiance} 
                  onValueChange={(value) => updateFilter('ambiance', value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    <SelectItem value="trendy">✨ Trendy</SelectItem>
                    <SelectItem value="cozy">🏠 Cozy</SelectItem>
                    <SelectItem value="minimalist">⚪ Minimalist</SelectItem>
                    <SelectItem value="vibrant">🌈 Vibrant</SelectItem>
                    <SelectItem value="upscale">👑 Upscale</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-gray-600 mb-1 block">Category</label>
                <Select 
                  value={filters.category} 
                  onValueChange={(value) => updateFilter('category', value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    <SelectItem value="cafe">☕ Cafes</SelectItem>
                    <SelectItem value="restaurant">🍽️ Restaurants</SelectItem>
                    <SelectItem value="fitness">💪 Fitness</SelectItem>
                    <SelectItem value="juice_bar">🥤 Juice Bars</SelectItem>
                    <SelectItem value="bakery">🥐 Bakeries</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">Active filters:</p>
                <div className="flex flex-wrap gap-2">
                  {filters.priceRange && (
                    <Badge variant="outline" className="text-xs">
                      {filters.priceRange}
                    </Badge>
                  )}
                  {filters.dietary && (
                    <Badge variant="outline" className="text-xs">
                      {filters.dietary.replace('_', ' ')}
                    </Badge>
                  )}
                  {filters.ambiance && (
                    <Badge variant="outline" className="text-xs">
                      {filters.ambiance}
                    </Badge>
                  )}
                  {filters.category && (
                    <Badge variant="outline" className="text-xs">
                      {filters.category}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}