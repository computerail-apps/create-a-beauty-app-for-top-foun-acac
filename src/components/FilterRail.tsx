import { RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/lib/ui';
import { Chip } from '@/components/Chip';
import { COVERAGES, DEPTHS, FINISHES, SKIN_TYPES, UNDERTONES, VALUES, EMPTY_FILTERS, type Filters } from '@/lib/foundation';

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
}

type SingleKey = 'depth' | 'undertone' | 'skin' | 'finish' | 'coverage';

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-micro uppercase tracking-wide text-muted-foreground">{title}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function FilterRail({ filters, onChange }: Props) {
  const single = (key: SingleKey, options: readonly string[], title: string) => (
    <Group title={title}>
      {options.map((o) => (
        <Chip key={o} label={o} active={filters[key] === o} onClick={() => onChange({ ...filters, [key]: filters[key] === o ? null : o })} />
      ))}
    </Group>
  );
  const dirty = JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>Your skin</CardTitle>
            <CardDescription>Results update as you change these.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" disabled={!dirty} onClick={() => onChange(EMPTY_FILTERS)} aria-label="Reset filters">
            <RotateCcw size={16} />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {single('depth', DEPTHS, 'Depth')}
        {single('undertone', UNDERTONES, 'Undertone')}
        {single('skin', SKIN_TYPES, 'Skin type')}
        {single('finish', FINISHES, 'Finish')}
        {single('coverage', COVERAGES, 'Coverage')}
        <Group title="Must have">
          {VALUES.map((v) => (
            <Chip
              key={v}
              label={v}
              active={filters.values.includes(v)}
              onClick={() => onChange({ ...filters, values: filters.values.includes(v) ? filters.values.filter((x) => x !== v) : [...filters.values, v] })}
            />
          ))}
        </Group>
        <p className="text-small text-muted-foreground">
          Depth and undertone are matched against the wording in each real product record. Price is not shown because no public source exposes it.
        </p>
      </CardContent>
    </Card>
  );
}
