import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Story, InsertStory } from "@shared/schema";

interface StoryWithUser extends Story {
  user: {
    id: number;
    username: string;
    profileImageUrl?: string;
  };
}

export function useStories() {
  return useQuery<StoryWithUser[]>({
    queryKey: ["/api/stories"],
    refetchInterval: 30000, // Refresh every 30 seconds for fresh stories
  });
}

export function useCreateStory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (storyData: InsertStory) => {
      return apiRequest("/api/stories", "POST", storyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
    },
  });
}