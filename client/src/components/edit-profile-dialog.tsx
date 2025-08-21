import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Camera, Image, User } from "lucide-react";
import type { User as UserType } from "@shared/schema";

interface EditProfileDialogProps {
  user: UserType;
  children: React.ReactNode;
}

export default function EditProfileDialog({ user, children }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: user.username || "",
    email: user.email || "",
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    avatar: user.avatar || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<UserType>) => {
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

  // iOS-compatible photo capture using Capacitor Camera
  const handleTakePhoto = async () => {
    try {
      setIsLoading(true);
      
      // Check if we're in Capacitor (iOS app)
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        const { Camera } = await import('@capacitor/camera');
        const { CameraResultType, CameraSource } = await import('@capacitor/camera');
        
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: true,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
        });
        
        if (image.dataUrl) {
          handleChange('avatar', image.dataUrl);
          toast({
            title: "Photo captured! 📸",
            description: "Your new profile picture looks amazing!",
          });
        }
      } else {
        // Web fallback - file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const dataUrl = e.target?.result as string;
              if (dataUrl) {
                handleChange('avatar', dataUrl);
                toast({
                  title: "Photo captured! 📸",
                  description: "Your new profile picture looks amazing!",
                });
              }
            };
            reader.readAsDataURL(file);
          }
        };
        
        input.click();
      }
    } catch (error) {
      
      toast({
        title: "Photo capture failed 😢",
        description: "Couldn't capture photo. Try again!",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // iOS-compatible gallery selection
  const handleSelectFromGallery = async () => {
    try {
      setIsLoading(true);
      
      // Check if we're in Capacitor (iOS app)
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        const { Camera } = await import('@capacitor/camera');
        const { CameraResultType, CameraSource } = await import('@capacitor/camera');
        
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: true,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Photos,
        });
        
        if (image.dataUrl) {
          handleChange('avatar', image.dataUrl);
          toast({
            title: "Photo selected! 📸",
            description: "Your new profile picture looks amazing!",
          });
        }
      } else {
        // Web fallback - file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const dataUrl = e.target?.result as string;
              if (dataUrl) {
                handleChange('avatar', dataUrl);
                toast({
                  title: "Photo selected! 📸",
                  description: "Your new profile picture looks amazing!",
                });
              }
            };
            reader.readAsDataURL(file);
          }
        };
        
        input.click();
      }
    } catch (error) {
      
      toast({
        title: "Photo selection failed 😢",
        description: "Couldn't select photo. Try again!",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-pink-600">
            Edit Profile ✨
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={formData.avatar} alt={formData.username} />
              <AvatarFallback className="bg-pink-100 text-pink-600 text-2xl">
                {formData.firstName?.charAt(0)}{formData.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTakePhoto}
                disabled={isLoading}
                className="flex items-center space-x-1"
              >
                <Camera className="w-4 h-4" />
                <span>Camera</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectFromGallery}
                disabled={isLoading}
                className="flex items-center space-x-1"
              >
                <Image className="w-4 h-4" />
                <span>Gallery</span>
              </Button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Enter your first name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Enter your last name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                placeholder="Enter your username"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Enter your email"
                className="mt-1"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}