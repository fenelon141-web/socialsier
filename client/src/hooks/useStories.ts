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
      return apiRequest('POST', '/api/stories', storyData);
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