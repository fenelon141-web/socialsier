import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useCapacitor } from './use-capacitor';

interface CameraOptions {
  source?: CameraSource;
  quality?: number;
  allowEditing?: boolean;
  resultType?: CameraResultType;
}

export function useCamera() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isNative } = useCapacitor();

  const takePicture = async (options: CameraOptions = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const defaultOptions = {
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt, // This allows choosing camera or gallery
        ...options
      };

      if (isNative) {
        // Use native camera on mobile
        const image = await Camera.getPhoto(defaultOptions);
        setIsLoading(false);
        return image.dataUrl;
      } else {
        // Use web file input as fallback
        return new Promise<string>((resolve, reject) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.capture = 'environment'; // Use rear camera by default
          
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const result = e.target?.result as string;
                setIsLoading(false);
                resolve(result);
              };
              reader.onerror = () => {
                setIsLoading(false);
                reject(new Error('Failed to read image'));
              };
              reader.readAsDataURL(file);
            } else {
              setIsLoading(false);
              reject(new Error('No file selected'));
            }
          };
          
          input.click();
        });
      }
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Failed to capture image';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const selectFromGallery = async () => {
    return takePicture({ source: CameraSource.Photos });
  };

  const takePhoto = async () => {
    return takePicture({ source: CameraSource.Camera });
  };

  const choosePhotoSource = async () => {
    return takePicture({ source: CameraSource.Prompt });
  };

  return {
    takePicture,
    selectFromGallery,
    takePhoto,
    choosePhotoSource,
    isLoading,
    error,
    isNative
  };
}