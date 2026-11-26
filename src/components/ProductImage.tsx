import { Droplet } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props {
  src: string | null;
  alt: string;
  className?: string;
}

export function ProductImage({ src, alt, className }: Props) {
  return (
    <div className={cn('flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted', className)}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" className="h-full w-full object-contain" />
      ) : (
        <Droplet size={24} className="text-muted-foreground" aria-label="No image on record" />
      )}
    </div>
  );
}
