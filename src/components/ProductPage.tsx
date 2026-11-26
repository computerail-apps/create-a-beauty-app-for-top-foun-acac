import { ArrowLeft, PackageX, RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button, EmptyState, CenteredSpinner, Alert, AlertTitle, AlertDescription } from '@/lib/ui';
import { useAppData } from '@/lib/data';
import { CATALOG, type Product, type WearTest } from '@/lib/foundation';
import { navigate } from '@/lib/router';
import { ProductImage } from '@/components/ProductImage';
import { SaveForm } from '@/components/SaveForm';
import { WearHistory } from '@/components/WearHistory';

const MOCK_TESTS: WearTest[] = [
  { id: 'w1', product_code: '5060123456782', product_name: 'Mineral Veil Tinted Foundation, sensitive skin, neutral medium', hours_worn: 9, oxidized: false, creased: false, verdict: 'Comfortable all day', tested_on: '2025-03-14' },
  { id: 'w2', product_code: '5060123456782', product_name: 'Mineral Veil Tinted Foundation, sensitive skin, neutral medium', hours_worn: 6, oxidized: false, creased: true, verdict: 'Settled into smile lines', tested_on: '2025-03-02' },
  { id: 'w3', product_code: '4005900112233', product_name: 'Glow Drops Dewy Foundation, hydrating, golden tan', hours_worn: 5, oxidized: true, creased: false, verdict: 'Went orange by afternoon', tested_on: '2025-02-20' },
];

export function ProductPage({ code }: { code: string }) {
  const rec = useAppData<Product | null>({
    key: ['product', code],
    mock: CATALOG.find((p) => p.code === code) ?? null,
    fetchLive: async () => {
      throw new Error('not wired yet');
    },
  });
  const tests = useAppData<WearTest[]>({
    key: ['wear-tests', code],
    mock: MOCK_TESTS.filter((t) => t.product_code === code),
    fetchLive: async () => {
      throw new Error('not wired yet');
    },
  });

  const back = (
    <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="-ml-2">
      <ArrowLeft size={16} />Back to matcher
    </Button>
  );

  if (rec.isLoading) return <CenteredSpinner label="Loading product record" />;
  if (rec.error) {
    return (
      <div className="space-y-4">
        {back}
        <Alert variant="destructive">
          <AlertTitle>Couldn't load this record</AlertTitle>
          <AlertDescription>
            <div className="space-y-3">
              <p>{(rec.error as Error).message}</p>
              <Button size="sm" variant="secondary" onClick={() => rec.refetch()}><RotateCcw size={16} />Retry</Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  const p = rec.data;
  if (!p) {
    return (
      <div className="space-y-4">
        {back}
        <EmptyState icon={<PackageX size={40} />} title="No record for this barcode" description={'Nothing was found for ' + code + ' in the catalog.'} action={<Button size="sm" onClick={() => navigate('/')}>Back to matcher</Button>} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {back}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="space-y-6 md:col-span-7">
          <Card>
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row">
              <ProductImage src={p.image_url} alt={p.name} className="h-40 w-full sm:w-40" />
              <div className="min-w-0 space-y-2">
                <div className="text-micro uppercase tracking-wide text-muted-foreground">{p.brand ?? 'Unknown brand'}</div>
                <h1 className="text-h2 text-foreground">{p.name}</h1>
                <p className="text-small text-muted-foreground">{p.categories}</p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {p.quantity && <Badge variant="outline">{p.quantity}</Badge>}
                  {p.labels.map((l) => <Badge key={l} variant="success">{l}</Badge>)}
                  <code className="font-mono text-small tabular-nums text-muted-foreground">{p.code}</code>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
              <CardDescription>{p.ingredients.length} listed on the product record.</CardDescription>
            </CardHeader>
            <CardContent>
              {p.ingredients.length === 0 ? (
                <p className="text-small text-muted-foreground">This record has no ingredient list.</p>
              ) : (
                <ul className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
                  {p.ingredients.map((i, idx) => (
                    <li key={i + idx} className="flex gap-2 text-small text-foreground">
                      <span className="w-5 shrink-0 tabular-nums text-muted-foreground">{idx + 1}</span>{i}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6 md:col-span-5">
          <SaveForm product={p} />
          <Card>
            <CardHeader>
              <CardTitle>Wear-test history</CardTitle>
              <CardDescription>Your logged tests for this product.</CardDescription>
            </CardHeader>
            <CardContent>
              {tests.isLoading ? <CenteredSpinner label="Loading tests" /> : tests.error ? (
                <Alert variant="destructive"><AlertTitle>Couldn't load tests</AlertTitle><AlertDescription>{(tests.error as Error).message}</AlertDescription></Alert>
              ) : <WearHistory tests={tests.data ?? []} />}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
