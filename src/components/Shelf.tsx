import { Bookmark, RotateCcw, Star, AlertTriangle } from 'lucide-react';
import { Card, CardContent, Badge, Button, EmptyState, CenteredSpinner, Alert, AlertTitle, AlertDescription } from '@/lib/ui';
import { useAppData } from '@/lib/data';
import { navigate } from '@/lib/router';
import { cn } from '@/lib/cn';
import type { SavedFoundation, WearTest } from '@/lib/foundation';
import { ProductImage } from '@/components/ProductImage';
import { WearHistory } from '@/components/WearHistory';
import { WearTestForm } from '@/components/WearTestForm';

const MOCK_SAVED: SavedFoundation[] = [
  { id: 's1', product_code: '5060123456782', product_name: 'Mineral Veil Tinted Foundation, sensitive skin, neutral medium', brand: 'Terra Folk', image_url: null, shade_note: 'N30 Neutral Medium', coverage: 'Medium', finish: 'Natural', rating: 5, ingredients_text: 'Mica, Zinc Oxide, Titanium Dioxide', notes: 'Best match so far, no sting.' },
  { id: 's2', product_code: '4005900112233', product_name: 'Glow Drops Dewy Foundation, hydrating, golden tan', brand: 'Solenne', image_url: null, shade_note: '05 Golden Tan', coverage: 'Sheer', finish: 'Dewy', rating: 2, ingredients_text: 'Aqua, Glycerin, Squalane', notes: 'Lovely texture but oxidizes.' },
];

const MOCK_TESTS: WearTest[] = [
  { id: 'w1', product_code: '5060123456782', product_name: 'Mineral Veil', hours_worn: 9, oxidized: false, creased: false, verdict: 'Comfortable all day', tested_on: '2025-03-14' },
  { id: 'w2', product_code: '5060123456782', product_name: 'Mineral Veil', hours_worn: 6, oxidized: false, creased: true, verdict: 'Settled into smile lines', tested_on: '2025-03-02' },
  { id: 'w3', product_code: '4005900112233', product_name: 'Glow Drops', hours_worn: 5, oxidized: true, creased: false, verdict: 'Went orange by afternoon', tested_on: '2025-02-20' },
  { id: 'w4', product_code: '4005900112233', product_name: 'Glow Drops', hours_worn: 7, oxidized: true, creased: true, verdict: 'Do not repurchase', tested_on: '2025-03-08' },
];

export function Shelf() {
  const saved = useAppData<SavedFoundation[]>({
    key: ['saved-foundations'],
    mock: MOCK_SAVED,
    fetchLive: async () => {
      throw new Error('not wired yet');
    },
  });
  const tests = useAppData<WearTest[]>({
    key: ['wear-tests'],
    mock: MOCK_TESTS,
    fetchLive: async () => {
      throw new Error('not wired yet');
    },
  });

  return (
    <div className="space-y-6 animate-in">
      <section className="space-y-2">
        <h1 className="text-h1 text-foreground">Your shelf</h1>
        <p className="max-w-2xl text-body text-muted-foreground">Saved foundations with your shade, rating and every wear test you have logged.</p>
      </section>
      {saved.isLoading ? (
        <CenteredSpinner label="Loading your shelf" />
      ) : saved.error ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn't load your shelf</AlertTitle>
          <AlertDescription>
            <div className="space-y-3">
              <p>{(saved.error as Error).message}</p>
              <Button size="sm" variant="secondary" onClick={() => saved.refetch()}><RotateCcw size={16} />Retry</Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : !saved.data || saved.data.length === 0 ? (
        <EmptyState
          icon={<Bookmark size={40} />}
          title="Your shelf is empty"
          description="Find a foundation in the matcher and save it with your shade."
          action={<Button size="sm" onClick={() => navigate('/')}>Open matcher</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {saved.data.map((s) => {
            const mine = (tests.data ?? []).filter((t) => t.product_code === s.product_code);
            const fails = mine.filter((t) => t.oxidized || t.creased).length;
            const flagged = fails >= 2;
            return (
              <Card key={s.id} className={cn(flagged && 'border-destructive/50')}>
                <CardContent className="space-y-4 p-6">
                  <div className="flex gap-4">
                    <ProductImage src={s.image_url} alt={s.product_name} className="h-20 w-20" />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="text-micro uppercase tracking-wide text-muted-foreground">{s.brand ?? 'Unknown brand'}</div>
                      <button type="button" onClick={() => navigate('/product/' + s.product_code)} className="text-left text-body font-medium text-foreground transition-colors duration-150 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                        {s.product_name}
                      </button>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {s.shade_note && <Badge variant="outline">{s.shade_note}</Badge>}
                        {s.finish && <Badge variant="outline">{s.finish}</Badge>}
                        {s.coverage && <Badge variant="outline">{s.coverage}</Badge>}
                      </div>
                      {s.rating !== null && (
                        <div className="flex gap-0.5 pt-1" aria-label={s.rating + ' out of 5'}>
                          {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={14} className={n <= (s.rating ?? 0) ? 'fill-warning text-warning' : 'text-muted-foreground'} />)}
                        </div>
                      )}
                    </div>
                  </div>
                  {s.notes && <p className="text-small text-muted-foreground">{s.notes}</p>}
                  {flagged && (
                    <Alert variant="destructive">
                      <AlertTitle><AlertTriangle size={14} className="mr-1 inline" />Keeps failing</AlertTitle>
                      <AlertDescription>{fails} of {mine.length} wear tests oxidized or creased.</AlertDescription>
                    </Alert>
                  )}
                  <WearHistory tests={mine} />
                  <WearTestForm code={s.product_code} name={s.product_name} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
