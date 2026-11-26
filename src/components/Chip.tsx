import { Button } from '@/lib/ui';
import { cn } from '@/lib/cn';

interface ChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  className?: string;
}

export function Chip({ label, active, onClick, className }: ChipProps) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? 'default' : 'secondary'}
      aria-pressed={active}
      onClick={onClick}
      className={cn('h-8 px-3 text-small', className)}
    >
      {label}
    </Button>
  );
}
