import { Badge } from '@/lib/ui';
import { formatDate, type WearTest } from '@/lib/foundation';

export function WearHistory({ tests }: { tests: WearTest[] }) {
  if (tests.length === 0) {
    return <p className="text-small text-muted-foreground">No wear tests logged for this product yet.</p>;
  }
  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {tests.map((t) => (
        <li key={t.id} className="flex flex-wrap items-center gap-2 px-4 py-3">
          <span className="text-small tabular-nums text-foreground">{t.hours_worn}h worn</span>
          {t.oxidized && <Badge variant="warning">Oxidized</Badge>}
          {t.creased && <Badge variant="warning">Creased</Badge>}
          {!t.oxidized && !t.creased && <Badge variant="success">Held up</Badge>}
          {t.verdict && <span className="text-small text-muted-foreground">{t.verdict}</span>}
          <span className="ml-auto text-small tabular-nums text-muted-foreground">{formatDate(t.tested_on)}</span>
        </li>
      ))}
    </ul>
  );
}
