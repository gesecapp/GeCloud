import { ImagePlus } from 'lucide-react';
import { useRef } from 'react';
import { ItemDescription, ItemMedia } from '@/components/ui/item';
import { cn } from '@/lib/utils';

export default function UploadImage({ value, onAddFile, maxSize, className, height }: UploadImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (maxSize && file.size > maxSize) {
        // toast.error('file.more.size');
        return;
      }
      onAddFile(file);
    }
  };

  return (
    <button
      type="button"
      className={cn(
        'group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors hover:bg-secondary',
        className,
      )}
      style={{ height: height || 192 }}
      onClick={() => fileInputRef.current?.click()}
    >
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      {value ? (
        <>
          <ItemMedia variant="image" className="h-full w-full">
            <img src={value} alt="prévia" className="h-full w-full object-contain" />
          </ItemMedia>
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex size-10 items-center justify-center rounded-md text-white hover:bg-white/20">
              <ImagePlus className="size-6" />
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 p-4">
          <ItemMedia variant="icon" className="text-muted-foreground">
            <ImagePlus className="size-8" />
          </ItemMedia>
          <ItemDescription className="text-center text-xs">{'arraste e solte'}</ItemDescription>
        </div>
      )}
    </button>
  );
}

interface UploadImageProps {
  value?: string;
  onAddFile: (file: File) => void;
  maxSize?: number;
  className?: string;
  height?: number | string;
}
