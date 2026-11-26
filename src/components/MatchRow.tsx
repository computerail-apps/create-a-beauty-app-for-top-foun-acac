import { Bookmark, ChevronRight } from 'lucide-react';
import { Card, Badge } from '@/lib/ui';
import { ProductImage } from '@/components/ProductImage';
import { navigate } from '@/lib/router';
import type { Match } from '@/lib/foundation';

interface Props {
  match: Match;
  shelved: boolean;
  hasPrefs: boolean;
}

export function MatchRow({ match, shelved, hasPrefs }: Props) {
  const { product, score, reason } = match;
  const variant = score >= 75 ? 'success' : score >= 40 ? 'warning' : 'outline';
  return (
    <Card className="transition-colors duration-150 ease-out hover:bg-surface-elevated">
      <button
        type="button"
        onClick={() => navigate('/product/' + product.code)}
        className="flex w-full items-center gap-4 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
      >
        <ProductImage src={product.image_url} alt={product.name} className="h-20 w-20" />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="text-micro uppercase tracking-wide text-muted-foreground">{product.brand ?? 'Unknown brand'}</div>
          <div className="text-body font-medium text-foreground">{product.name}</div>
          <p className="text-small text-muted-foreground">{reason}</p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {hasPrefs && <Badge variant={variant}>{score}% match</Badge>}
            {shelved && (
              <Badge variant="outline">
                <Bookmark size={12} className="mr-1" />On your shelf
              </Badge>
            )}
            {product.labels.slice(0, 2).map((l) => (
              <Badge key={l} variant="outline">{l}</Badge>
            ))}
          </div>
        </div>
        <ChevronRight size={20} className="hidden shrink-0 text-muted-foreground sm:block" />
      </button>
    </Card>
  );
}
