import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCamera } from "@/hooks/use-camera";
import { apiRequest } from "@/lib/queryClient";
import { Camera, ImageIcon } from "lucide-react";
import type { User } from "@shared/schema";

interface EditProfileDialogProps {
  user: User;
  children: React.ReactNode;
}

export default function EditProfileDialog({ user, children }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    avatar: user.avatar || "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { choosePhotoSource, isLoading: cameraLoading } = useCamera();

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<User>) => {
      return apiRequest("PATCH", `/api/user/${user.id}`, updates);
    },
    onSuccess: () => {
      toast({
        title: "Profile updated! ✨",
        description: "Your changes have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update failed 😢",
        description: error.message || "Something went wrong. Try again!",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTakePhoto = async () => {
    try {
      const photo = await choosePhotoSource();
      if (photo) {
        handleChange('avatar', photo);
        toast({
          title: "Photo captured! 📸",
          description: "Your new profile picture looks amazing!",
        });
      }
    } catch (error) {
      toast({
        title: "Photo failed 😢",
        description: "Couldn't capture photo. Try again!",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">Edit Profile ✨</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center">
            <div className="relative inline-block">
              <img 
                src={formData.avatar || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"} 
                alt="Profile"
                className="w-20 h-20 rounded-full mx-auto border-4 border-pink-200"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleTakePhoto}
                disabled={cameraLoading}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-pink-400 hover:bg-pink-500 p-0"
              >
                {cameraLoading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Tap camera to take a new photo</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => handleChange("username", e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="avatar">Avatar URL</Label>
            <Input
              id="avatar"
              value={formData.avatar}
              onChange={(e) => handleChange("avatar", e.target.value)}
              placeholder="Enter image URL"
            />
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateMutation.isPending}
              className="flex-1 bg-pink-400 hover:bg-pink-500"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}