import { Coffee, Utensils, Dumbbell, Apple, Croissant, Leaf, Sparkles } from "lucide-react";
import type { Spot } from "@shared/schema";

export function getSpotIcon(spot: Spot, size = "w-8 h-8") {
  const description = spot.description.toLowerCase();
  const name = spot.name.toLowerCase();
  const category = spot.category.toLowerCase();

  // Fitness & wellness
  if (category.includes('fitness') || description.includes('yoga') || description.includes('pilates') || 
      description.includes('barre') || description.includes('workout') || name.includes('gym') ||
      category.includes('sports')) {
    return <Dumbbell className={`${size} text-purple-600`} />;
  }
  
  // Juice bars & healthy drinks
  if (description.includes('juice') || description.includes('smoothie') || description.includes('açaí') ||
      category.includes('juice') || name.includes('juice')) {
    return <Apple className={`${size} text-green-600`} />;
  }
  
  // Coffee & tea places
  if (description.includes('coffee') || description.includes('latte') || description.includes('espresso') ||
      description.includes('matcha') || description.includes('tea') || description.includes('café') ||
      category.includes('cafe') || name.includes('coffee') || name.includes('café')) {
    return <Coffee className={`${size} text-amber-600`} />;
  }
  
  // Bakeries & pastries
  if (description.includes('pastry') || description.includes('croissant') || description.includes('bread') ||
      category.includes('bakery') || name.includes('bakery') || name.includes('patisserie')) {
    return <Croissant className={`${size} text-orange-600`} />;
  }
  
  // Healthy/trendy food
  if (description.includes('avocado') || description.includes('quinoa') || description.includes('poke') ||
      description.includes('superfood') || description.includes('organic') || description.includes('vegan')) {
    return <Leaf className={`${size} text-green-600`} />;
  }
  
  // Trendy/aesthetic spots
  if (description.includes('aesthetic') || description.includes('instagram') || description.includes('trendy') ||
      description.includes('boba') || description.includes('bubble tea')) {
    return <Sparkles className={`${size} text-pink-600`} />;
  }
  
  // Default restaurant/food
  return <Utensils className={`${size} text-blue-600`} />;
}

// Function to get a string representation for non-React contexts
export function getSpotIconEmoji(spot: Spot): string {
  const description = spot.description.toLowerCase();
  const name = spot.name.toLowerCase();
  const category = spot.category.toLowerCase();

  // Fitness & wellness
  if (category.includes('fitness') || description.includes('yoga') || description.includes('pilates') || 
      description.includes('barre') || description.includes('workout') || name.includes('gym') ||
      category.includes('sports')) {
    return '💪';
  }
  
  // Juice bars & healthy drinks
  if (description.includes('juice') || description.includes('smoothie') || description.includes('açaí') ||
      category.includes('juice') || name.includes('juice')) {
    return '🍎';
  }
  
  // Coffee & tea places
  if (description.includes('coffee') || description.includes('latte') || description.includes('espresso') ||
      description.includes('matcha') || description.includes('tea') || description.includes('café') ||
      category.includes('cafe') || name.includes('coffee') || name.includes('café')) {
    return '☕';
  }
  
  // Bakeries & pastries
  if (description.includes('pastry') || description.includes('croissant') || description.includes('bread') ||
      category.includes('bakery') || name.includes('bakery') || name.includes('patisserie')) {
    return '🥐';
  }
  
  // Healthy/trendy food
  if (description.includes('avocado') || description.includes('quinoa') || description.includes('poke') ||
      description.includes('superfood') || description.includes('organic') || description.includes('vegan')) {
    return '🥗';
  }
  
  // Trendy/aesthetic spots
  if (description.includes('aesthetic') || description.includes('instagram') || description.includes('trendy') ||
      description.includes('boba') || description.includes('bubble tea')) {
    return '✨';
  }
  
  // Default restaurant/food
  return '🍽️';
}