import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCamera } from "@/hooks/useCamera";
import { useCreateStory } from "@/hooks/useStories";
import { Camera, X, Plus } from "lucide-react";

// Check if we're in iOS native app
const isIOSNative = typeof window !== 'undefined' && (window as any).Capacitor;

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
  const { choosePhotoSource } = useCamera();

  // Use the new native-compatible story creation hook
  const createStoryMutation = useCreateStory();

  const handleTakePhoto = async () => {
    try {
      const imageDataUrl = await choosePhotoSource();
      
      if (imageDataUrl) {
        setStoryImage(imageDataUrl);
        
        toast({
          title: "Photo captured! 📸",
          description: isIOSNative ? "Add a caption to save your story locally" : "Add a caption and post your story.",
        });
      }
    } catch (error) {
      toast({
        title: "Photo failed",
        description: "Please try taking a photo again!",
        variant: "destructive",
      });
    }
  };

  const handleCreateStory = () => {
    if (!storyImage) {
      toast({
        title: "Photo required!",
        description: "Take a photo first to create your story.",
        variant: "destructive",
      });
      return;
    }

    const storyData = {
      userId: "1",
      imageUrl: storyImage,
      caption: storyCaption || "",
      type: "photo" as const,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    createStoryMutation.mutate(storyData, {
      onSuccess: () => {
        // Reset the form
        setStoryImage("");
        setStoryCaption("");
        setShowCreateStory(false);
      }
    });
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
      </div>

      {/* Create Story Dialog */}
      <Dialog open={showCreateStory} onOpenChange={setShowCreateStory}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-pink-600">
              {isIOSNative ? "Save Story Locally ✨" : "Create Story ✨"}
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
                <button
                  onClick={() => setStoryImage("")}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No photo selected</p>
                </div>
              </div>
            )}

            {/* Photo Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleTakePhoto}
                variant="outline"
                className="flex-1"
                disabled={createStoryMutation.isPending}
              >
                <Camera className="w-4 h-4 mr-2" />
                {storyImage ? "Retake Photo" : "Take Photo"}
              </Button>
            </div>

            {/* Caption Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Caption (optional)
              </label>
              <Textarea
                placeholder={isIOSNative ? "Add a caption for your local story..." : "What's happening?"}
                value={storyCaption}
                onChange={(e) => setStoryCaption(e.target.value)}
                className="min-h-20"
                maxLength={280}
              />
              <p className="text-xs text-gray-500 text-right">
                {storyCaption.length}/280 characters
              </p>
            </div>

            {/* Post Button */}
            <Button
              onClick={handleCreateStory}
              disabled={!storyImage || createStoryMutation.isPending}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              {createStoryMutation.isPending ? (
                "Saving..."
              ) : isIOSNative ? (
                "Save Story Locally"
              ) : (
                "Post Story"
              )}
            </Button>

            {isIOSNative && (
              <p className="text-xs text-gray-500 text-center">
                Stories are saved locally on your device for 24 hours
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}