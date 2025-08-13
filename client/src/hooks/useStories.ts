import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useNativeStorage } from './useNativeStorage';

// Check if we're in iOS native app
const isIOSNative = typeof window !== 'undefined' && (window as any).Capacitor;

export interface Story {
  id: number;
  userId: string;
  imageUrl: string;
  caption: string;
  type: 'photo' | 'video';
  createdAt: string;
  expiresAt: string;
  views: number;
  user: {
    id: string;
    username: string;
    avatar: string;
  };
}

export function useStories() {
  const { getLocalStories } = useNativeStorage();
  
  return useQuery<Story[]>({
    queryKey: ['/api/stories'],
    queryFn: async () => {
      if (isIOSNative) {
        // Use local storage for iOS to avoid network issues
        const localStories = getLocalStories();
        return localStories.map(story => ({
          ...story,
          id: story.id as any, // Convert string to number for compatibility
          views: 0,
          user: {
            id: story.userId,
            username: 'You',
            avatar: '/placeholder-avatar.png'
          }
        }));
      } else {
        // Use API for web
        const response = await apiRequest('GET', '/api/stories');
        return response;
      }
    },
    retry: false,
  });
}

export function useCreateStory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { saveStoryLocally } = useNativeStorage();

  return useMutation({
    mutationFn: async (storyData: {
      userId: string;
      imageUrl: string;
      caption: string;
      type: 'photo' | 'video';
      expiresAt: Date;
    }) => {
      
      if (isIOSNative) {
        // Native iOS: Store locally without API calls
        console.log('iOS Native: Saving story locally');
        const success = await saveStoryLocally({
          userId: storyData.userId,
          imageUrl: storyData.imageUrl, // Keep base64 data URL as-is
          caption: storyData.caption,
          type: storyData.type
        });
        
        if (!success) {
          throw new Error('Failed to save story locally');
        }
        
        return { success: true, message: 'Story saved locally' };
      } else {
        // Web: Use API with image upload
        console.log('Web: Using API for story upload');
        
        // If imageUrl is base64, upload to object storage first
        let finalImageUrl = storyData.imageUrl;
        
        if (storyData.imageUrl.startsWith('data:')) {
          const uploadResponse = await apiRequest('POST', '/upload-story-image', {
            dataUrl: storyData.imageUrl,
            userId: storyData.userId
          });
          
          if (uploadResponse.success && uploadResponse.imageUrl) {
            finalImageUrl = uploadResponse.imageUrl;
          } else {
            throw new Error('Failed to upload image to object storage');
          }
        }
        
        const finalStoryData = {
          ...storyData,
          imageUrl: finalImageUrl
        };
        
        const response = await apiRequest('POST', '/api/stories', finalStoryData);
        return response;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stories'] });
      if (isIOSNative) {
        toast({
          title: "Story saved! ✨",
          description: "Your story is stored locally on your device",
        });
      } else {
        toast({
          title: "Story posted! ✨",
          description: "Your story is active for 24 hours!",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Story failed",
        description: error.message || "Couldn't save your story. Try again!",
        variant: "destructive",
      });
    },
  });
}