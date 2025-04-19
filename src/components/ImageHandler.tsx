
import React, { useState, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ImageHandlerProps {
  imageUrl: string | undefined;
  onImageChange: (imageData: string | undefined) => void;
  maxSize?: number; // in KB
}

const ImageHandler: React.FC<ImageHandlerProps> = ({ 
  imageUrl, 
  onImageChange,
  maxSize = 1000 // Default max size 1000 KB (1MB)
}) => {
  const [showFullImage, setShowFullImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    if (imageUrl) {
      setShowFullImage(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    const fileSizeKB = file.size / 1024;
    if (fileSizeKB > maxSize) {
      alert(`Размер изображения превышает ${maxSize} КБ`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onImageChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    onImageChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mt-2">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="image-upload"
      />

      <div className="flex flex-col items-center">
        {imageUrl ? (
          <div className="relative w-full max-w-xs mb-2">
            <img
              src={imageUrl}
              alt="Uploaded"
              className="w-full h-auto object-contain rounded-md cursor-pointer"
              onClick={handleImageClick}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={handleRemoveImage}
              className="absolute top-1 right-1 h-6 w-6"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        ) : (
          <label
            htmlFor="image-upload"
            className="cursor-pointer bg-muted hover:bg-muted/80 text-muted-foreground py-2 px-4 rounded-md transition-colors w-full text-center"
          >
            Загрузить изображение
          </label>
        )}
      </div>

      <Dialog open={showFullImage} onOpenChange={setShowFullImage}>
        <DialogContent className="sm:max-w-4xl p-0 bg-transparent border-none">
          <div className="relative w-full h-full">
            <img
              src={imageUrl}
              alt="Full size preview"
              className="w-full h-auto"
              onClick={() => setShowFullImage(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageHandler;
