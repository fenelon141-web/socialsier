import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface CameraOptions {
  quality?: number;
  allowEditing?: boolean;
  resultType?: 'uri' | 'base64' | 'dataUrl';
  source?: 'camera' | 'photos' | 'prompt';
}

export function useCamera() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Take photo using Capacitor Camera (iOS) or web fallback
  const takePhoto = async (options: CameraOptions = {}): Promise<string | null> => {
    setIsLoading(true);
    
    try {
      // Check if we're in Capacitor (iOS app)
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        const { Camera } = await import('@capacitor/camera');
        const { CameraResultType, CameraSource } = await import('@capacitor/camera');
        
        const image = await Camera.getPhoto({
          quality: options.quality || 90,
          allowEditing: options.allowEditing ?? true,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
        });
        
        return image.dataUrl || null;
      } else {
        // Web fallback
        return new Promise((resolve) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.capture = 'environment'; // Use back camera
          
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                resolve(e.target?.result as string || null);
              };
              reader.readAsDataURL(file);
            } else {
              resolve(null);
            }
          };
          
          input.click();
        });
      }
    } catch (error) {
      console.error('Camera error:', error);
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

  // Select from photo library
  const selectFromGallery = async (options: CameraOptions = {}): Promise<string | null> => {
    setIsLoading(true);
    
    try {
      // Check if we're in Capacitor (iOS app)
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        const { Camera } = await import('@capacitor/camera');
        const { CameraResultType, CameraSource } = await import('@capacitor/camera');
        
        const image = await Camera.getPhoto({
          quality: options.quality || 90,
          allowEditing: options.allowEditing ?? true,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Photos,
        });
        
        return image.dataUrl || null;
      } else {
        // Web fallback
        return new Promise((resolve) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                resolve(e.target?.result as string || null);
              };
              reader.readAsDataURL(file);
            } else {
              resolve(null);
            }
          };
          
          input.click();
        });
      }
    } catch (error) {
      console.error('Gallery error:', error);
      toast({
        title: "Gallery Error",
        description: "Unable to access photo library. Please check permissions.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Show photo source selection (camera vs gallery)
  const choosePhotoSource = async (): Promise<string | null> => {
    setIsLoading(true);
    
    try {
      // First check and request permissions for iOS
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        const hasPermission = await checkCameraPermission();
        if (!hasPermission) {
          const granted = await requestCameraPermission();
          if (!granted) {
            toast({
              title: "Camera Permission Needed",
              description: "Please enable camera access in Settings to add photos to your stories",
              variant: "destructive",
            });
            return null;
          }
        }
      }
      
      return new Promise((resolve) => {
        // Create a simple selection dialog
        const result = confirm("Choose photo source:\nOK = Camera\nCancel = Gallery");
        
        if (result) {
          takePhoto().then(resolve);
        } else {
          selectFromGallery().then(resolve);
        }
      });
    } catch (error) {
      console.error('Photo source selection error:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera or photo library",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Check camera permissions (iOS specific)
  const checkCameraPermission = async (): Promise<boolean> => {
    try {
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        const { Camera } = await import('@capacitor/camera');
        const permissions = await Camera.checkPermissions();
        return permissions.camera === 'granted';
      }
      return true; // Web assumes permission is handled by browser
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  };

  // Request camera permissions
  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        const { Camera } = await import('@capacitor/camera');
        const permissions = await Camera.requestPermissions();
        return permissions.camera === 'granted';
      }
      return true; // Web assumes permission is handled by browser
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  };

  return {
    isLoading,
    takePhoto,
    selectFromGallery,
    choosePhotoSource,
    checkCameraPermission,
    requestCameraPermission,
  };
}