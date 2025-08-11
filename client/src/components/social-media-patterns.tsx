import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCamera } from "@/hooks/useCamera";
import { apiRequest } from "@/lib/queryClient";
import { Camera, X, Plus } from "lucide-react";

// Simple social media components
export function VerticalFeed({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}

export function ExploreGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}

export function UpdatesFeed({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3">{children}</div>;
}

export function DoubleTapLike({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function PullToRefreshContainer({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

interface StoriesStripProps {
  onCreateStory: () => void;
}

export function StoriesStrip({ onCreateStory }: StoriesStripProps) {
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [storyImage, setStoryImage] = useState<string>("");
  const [storyCaption, setStoryCaption] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { choosePhotoSource } = useCamera();

  // Create story mutation
  const createStoryMutation = useMutation({
    mutationFn: async (storyData: any) => {
      console.log("Attempting to create story:", {
        hasImageUrl: !!storyData.imageUrl,
        imageUrlLength: storyData.imageUrl?.length || 0,
        caption: storyData.caption,
        userId: storyData.userId
      });
      
      try {
        const response = await apiRequest("POST", "/api/stories", storyData);
        console.log("Story creation successful:", response);
        return response;
      } catch (error) {
        console.error("Story creation failed:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      setShowCreateStory(false);
      setStoryImage("");
      setStoryCaption("");
      toast({
        title: "Story posted! ✨",
        description: "Your story is active for 24 hours!",
      });
    },
    onError: (error: any) => {
      console.error("Story mutation error:", error);
      const errorMessage = error.message || "Couldn't post your story. Try again!";
      toast({
        title: "Story failed 😢",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleTakePhoto = async () => {
    console.log('=== PHOTO CAPTURE INITIATED ===');
    
    try {
      const photo = await choosePhotoSource();
      console.log('Photo capture result:', {
        hasPhoto: !!photo,
        photoLength: photo?.length || 0,
        photoPrefix: photo?.substring(0, 50) + '...' || 'No photo'
      });
      
      if (photo) {
        setStoryImage(photo);
        console.log('SUCCESS: Photo set for story');
        toast({
          title: "Photo captured! 📸",
          description: "Add a caption and post your story!",
        });

        // Test the upload endpoint immediately
        console.log('Testing upload endpoint with captured photo...');
        try {
          const testResponse = await apiRequest('POST', '/upload-story-image', { dataUrl: photo });
          console.log('Upload test successful:', testResponse);
        } catch (uploadError) {
          console.error('Upload test failed:', uploadError);
        }
      } else {
        console.log('No photo returned from camera');
      }
    } catch (error) {
      console.error('Photo capture error:', error);
      toast({
        title: "Photo failed 😢",
        description: "Please try taking a photo again!",
        variant: "destructive",
      });
    }
  };

  const handleCreateStory = () => {
    console.log('=== STORY CREATION INITIATED ===');
    
    if (!storyImage) {
      console.log('ERROR: No story image available');
      toast({
        title: "Photo required!",
        description: "Take a photo first to create your story.",
        variant: "destructive",
      });
      return;
    }

    console.log('Story image details:', {
      hasImage: !!storyImage,
      imageLength: storyImage.length,
      imagePrefix: storyImage.substring(0, 50) + '...',
      caption: storyCaption || 'No caption',
      captionLength: storyCaption.length
    });
    
    const storyData = {
      userId: "1",
      imageUrl: storyImage,
      caption: storyCaption || "",
      type: "photo",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    console.log('Calling createStoryMutation with data:', {
      userId: storyData.userId,
      hasImageUrl: !!storyData.imageUrl,
      imageUrlLength: storyData.imageUrl.length,
      caption: storyData.caption,
      type: storyData.type
    });

    createStoryMutation.mutate(storyData);
  };

  return (
    <>
      {/* Stories strip */}
      <div className="flex space-x-3 p-4 overflow-x-auto">
        {/* Add your story button */}
        <div className="flex flex-col items-center space-y-2 min-w-fit">
          <button
            onClick={() => setShowCreateStory(true)}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-lg border-2 border-white"
          >
            <Plus className="w-6 h-6 text-white" />
          </button>
          <span className="text-xs text-gray-600 text-center">Your Story</span>
        </div>

        {/* No placeholder content - stories will be loaded from API */}
      </div>

      {/* Create Story Dialog */}
      <Dialog open={showCreateStory} onOpenChange={setShowCreateStory}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-pink-600">
              Create Story ✨
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Photo Preview */}
            {storyImage ? (
              <div className="relative">
                <img 
                  src={storyImage} 
                  alt="Story preview" 
                  className="w-full h-64 object-cover rounded-lg"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStoryImage("")}
                  className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-pink-200 rounded-lg p-8 text-center">
                <Camera className="w-12 h-12 text-pink-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Take a photo for your story</p>
                <Button
                  onClick={handleTakePhoto}
                  className="bg-gradient-to-r from-pink-500 to-purple-500"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            )}

            {/* Caption */}
            <div>
              <Textarea
                placeholder="Add a caption to your story..."
                value={storyCaption}
                onChange={(e) => setStoryCaption(e.target.value)}
                className="border-pink-200 focus:border-pink-400"
                rows={3}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateStory(false)}
                className="flex-1"
                disabled={createStoryMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateStory}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500"
                disabled={createStoryMutation.isPending || !storyImage}
              >
                {createStoryMutation.isPending ? "Posting..." : "Share Story"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}