import { useMemo, useState } from 'react';
import { SearchX, RotateCcw } from 'lucide-react';
import { Button, EmptyState, CenteredSpinner, Alert, AlertTitle, AlertDescription } from '@/lib/ui';
import { useAppData } from '@/lib/data';
import { useDebounced } from '@/lib/router';
import { CATALOG, EMPTY_FILTERS, activeFilterNames, rankProducts, type Filters, type Match } from '@/lib/foundation';
import { FilterRail } from '@/components/FilterRail';
import { MatchRow } from '@/components/MatchRow';

export function Matcher() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const debounced = useDebounced(filters, 350);
  const settling = debounced !== filters;
  const names = activeFilterNames(debounced);

  const results = useAppData<Match[]>({
    key: ['matches', JSON.stringify(debounced)],
    mock: rankProducts(CATALOG, debounced),
    fetchLive: async () => {
      throw new Error('not wired yet');
    },
  });

  const shelf = useAppData<string[]>({
    key: ['shelved-codes'],
    mock: ['5060123456782', '4005900112233'],
    fetchLive: async () => {
      throw new Error('not wired yet');
    },
  });

  const shelved = useMemo(() => new Set(shelf.data ?? []), [shelf.data]);
  const list = results.data ?? [];
  const loading = results.isLoading || settling;

  return (
    <div className="space-y-8 animate-in">
      <section className="space-y-3">
        <h1 className="text-h1 text-foreground">Find a foundation that fits your skin</h1>
        <p className="max-w-2xl text-body text-muted-foreground">
          Describe your depth, undertone and skin type. We search the open product catalog and rank real records, with a plain reason for every match.
        </p>
      </section>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <aside className="md:col-span-4 md:sticky md:top-20 md:self-start">
          <FilterRail filters={filters} onChange={setFilters} />
        </aside>
        <section className="space-y-4 md:col-span-8" aria-live="polite">
          <div className="flex items-center justify-between">
            <h2 className="text-h3 text-foreground">Ranked matches</h2>
            {!loading && !results.error && <span className="text-small tabular-nums text-muted-foreground">{list.length} found</span>}
          </div>
          {loading ? (
            <CenteredSpinner label="Searching the catalog" />
          ) : results.error ? (
            <Alert variant="destructive">
              <AlertTitle>Couldn't search the catalog</AlertTitle>
              <AlertDescription>
                <div className="space-y-3">
                  <p>{(results.error as Error).message}</p>
                  <Button size="sm" variant="secondary" onClick={() => results.refetch()}>
                    <RotateCcw size={16} />Retry
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : list.length === 0 ? (
            <EmptyState
              icon={<SearchX size={40} />}
              title="No foundations match all of that"
              description={names.length ? 'Nothing in the catalog fits ' + names.join(' + ') + '. Try dropping one of these.' : 'The catalog returned no foundation records.'}
              action={
                <Button size="sm" onClick={() => setFilters(EMPTY_FILTERS)}>
                  <RotateCcw size={16} />Reset filters
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {list.map((m) => (
                <MatchRow key={m.product.code} match={m} shelved={shelved.has(m.product.code)} hasPrefs={names.length > 0} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
