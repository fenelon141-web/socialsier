import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useToast } from '@/hooks/use-toast';

export function useCamera() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const choosePhotoSource = async (): Promise<string | null> => {
    setIsLoading(true);
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt, // This will show options: Camera, Photos, etc.
      });

      return image.dataUrl || null;
    } catch (error: any) {
      console.error('Camera error:', error);
      
      if (error.message?.includes('User cancelled')) {
        // User cancelled, don't show error
        return null;
      }
      
      toast({
        title: "Camera Error",
        description: "Unable to access camera or photos. Please check permissions.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async (): Promise<string | null> => {
    setIsLoading(true);
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      return image.dataUrl || null;
    } catch (error: any) {
      console.error('Camera error:', error);
      
      if (error.message?.includes('User cancelled')) {
        return null;
      }
      
      toast({
        title: "Camera Error", 
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const selectFromLibrary = async (): Promise<string | null> => {
    setIsLoading(true);
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      return image.dataUrl || null;
    } catch (error: any) {
      console.error('Photo library error:', error);
      
      if (error.message?.includes('User cancelled')) {
        return null;
      }
      
      toast({
        title: "Photo Library Error",
        description: "Unable to access photo library. Please check permissions.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    choosePhotoSource,
    takePhoto,
    selectFromLibrary,
    isLoading,
  };
}