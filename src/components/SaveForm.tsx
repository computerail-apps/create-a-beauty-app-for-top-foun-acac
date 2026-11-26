import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BookmarkPlus, Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Button, Alert, AlertTitle, AlertDescription } from '@/lib/ui';
import { cn } from '@/lib/cn';
import { saveFoundation } from '@/lib/shelfApi';
import { COVERAGES, FINISHES, type Product } from '@/lib/foundation';
import { Chip } from '@/components/Chip';

export function SaveForm({ product }: { product: Product }) {
  const qc = useQueryClient();
  const [shade, setShade] = useState('');
  const [note, setNote] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [finish, setFinish] = useState<string | null>(null);
  const [coverage, setCoverage] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () =>
      saveFoundation({
        product_code: product.code,
        product_name: product.name,
        brand: product.brand,
        image_url: product.image_url,
        shade_note: shade.trim() || null,
        coverage,
        finish,
        rating,
        ingredients_text: product.ingredients.join(', '),
        notes: note.trim() || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saved-foundations'] });
      qc.invalidateQueries({ queryKey: ['shelved-codes'] });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Save to your shelf</CardTitle>
        <CardDescription>Keep your shade and a note so you never re-buy the wrong bottle.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <div className="space-y-2">
            <label htmlFor="shade" className="text-small text-muted-foreground">Your shade</label>
            <Input id="shade" placeholder="e.g. 230 Warm Sand" value={shade} onChange={(e) => setShade(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label htmlFor="note" className="text-small text-muted-foreground">Note</label>
            <Input id="note" placeholder="Slightly orange at the jaw" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div className="space-y-2">
            <div className="text-small text-muted-foreground">Finish</div>
            <div className="flex flex-wrap gap-2">
              {FINISHES.map((f) => <Chip key={f} label={f} active={finish === f} onClick={() => setFinish(finish === f ? null : f)} />)}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-small text-muted-foreground">Coverage</div>
            <div className="flex flex-wrap gap-2">
              {COVERAGES.map((c) => <Chip key={c} label={c} active={coverage === c} onClick={() => setCoverage(coverage === c ? null : c)} />)}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-small text-muted-foreground">Rating</div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Button key={n} type="button" variant="ghost" size="sm" aria-label={n + ' stars'} onClick={() => setRating(rating === n ? null : n)} className="px-1">
                  <Star size={20} className={cn(rating !== null && n <= rating ? 'fill-warning text-warning' : 'text-muted-foreground')} />
                </Button>
              ))}
            </div>
          </div>
          {save.error && (
            <Alert variant="destructive">
              <AlertTitle>Couldn't save</AlertTitle>
              <AlertDescription>{(save.error as Error).message}</AlertDescription>
            </Alert>
          )}
          {save.isSuccess && (
            <Alert variant="success">
              <AlertTitle>Saved</AlertTitle>
              <AlertDescription>This foundation is now on your shelf.</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={save.isPending} className="w-full sm:w-auto">
            <BookmarkPlus size={16} />{save.isPending ? 'Saving' : 'Save foundation'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
