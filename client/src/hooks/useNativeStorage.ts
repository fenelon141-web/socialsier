import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface StoredStory {
  id: string;
  userId: string;
  imageUrl: string;
  caption: string;
  type: 'photo' | 'video';
  createdAt: Date;
  expiresAt: Date;
}

// Native iOS storage for stories without API dependencies
export function useNativeStorage() {
  const { toast } = useToast();

  // Save story locally to device storage
  const saveStoryLocally = async (storyData: Omit<StoredStory, 'id' | 'createdAt' | 'expiresAt'>): Promise<boolean> => {
    try {
      const story: StoredStory = {
        ...storyData,
        id: `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

      // Store in localStorage for iOS compatibility
      const existingStories = getLocalStories();
      const updatedStories = [...existingStories, story];
      
      localStorage.setItem('socialiser_stories', JSON.stringify(updatedStories));
      
      toast({
        title: "Story saved! ✨",
        description: "Your story is stored locally on your device",
      });
      
      return true;
    } catch (error) {
      console.error('Failed to save story locally:', error);
      toast({
        title: "Storage failed",
        description: "Couldn't save story to device storage",
        variant: "destructive",
      });
      return false;
    }
  };

  // Get all local stories
  const getLocalStories = (): StoredStory[] => {
    try {
      const stored = localStorage.getItem('socialiser_stories');
      if (!stored) return [];
      
      const stories: StoredStory[] = JSON.parse(stored);
      const now = new Date();
      
      // Filter out expired stories (older than 24 hours)
      const activeStories = stories.filter(story => new Date(story.expiresAt) > now);
      
      // Update storage with only active stories
      if (activeStories.length !== stories.length) {
        localStorage.setItem('socialiser_stories', JSON.stringify(activeStories));
      }
      
      return activeStories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Failed to get local stories:', error);
      return [];
    }
  };

  // Delete a specific story
  const deleteLocalStory = async (storyId: string): Promise<boolean> => {
    try {
      const existingStories = getLocalStories();
      const updatedStories = existingStories.filter(story => story.id !== storyId);
      
      localStorage.setItem('socialiser_stories', JSON.stringify(updatedStories));
      
      toast({
        title: "Story deleted",
        description: "Story removed from your device",
      });
      
      return true;
    } catch (error) {
      console.error('Failed to delete story:', error);
      return false;
    }
  };

  // Clear all stories
  const clearAllStories = async (): Promise<boolean> => {
    try {
      localStorage.removeItem('socialiser_stories');
      toast({
        title: "All stories cleared",
        description: "Local story storage cleared",
      });
      return true;
    } catch (error) {
      console.error('Failed to clear stories:', error);
      return false;
    }
  };

  return {
    saveStoryLocally,
    getLocalStories,
    deleteLocalStory,
    clearAllStories
  };
}