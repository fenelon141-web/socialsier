import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

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
  return useQuery<Story[]>({
    queryKey: ['/api/stories'],
    retry: false,
  });
}

export function useCreateStory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyData: {
      userId: string;
      imageUrl: string;
      caption: string;
      type: 'photo' | 'video';
      expiresAt: Date;
    }) => {
      
      console.log('Story data being sent:', {
        ...storyData,
        imageUrlLength: storyData.imageUrl.length,
        imageUrlType: storyData.imageUrl.startsWith('data:') ? 'base64' : 'url'
      });
      
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stories'] });
      toast({
        title: "Story posted! ✨",
        description: "Your story is active for 24 hours!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Story failed 😢",
        description: error.message || "Couldn't post your story. Try again!",
        variant: "destructive",
      });
    },
  });
}