import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FlaskConical } from 'lucide-react';
import { Input, Button, Alert, AlertTitle, AlertDescription } from '@/lib/ui';
import { logWearTest } from '@/lib/shelfApi';
import { Chip } from '@/components/Chip';

interface Props {
  code: string;
  name: string;
}

export function WearTestForm({ code, name }: Props) {
  const qc = useQueryClient();
  const [hours, setHours] = useState('');
  const [oxidized, setOxidized] = useState(false);
  const [creased, setCreased] = useState(false);
  const [verdict, setVerdict] = useState('');

  const log = useMutation({
    mutationFn: () =>
      logWearTest({
        product_code: code,
        product_name: name,
        hours_worn: Math.max(0, Math.round(Number(hours) || 0)),
        oxidized,
        creased,
        verdict: verdict.trim() || null,
      }),
    onSuccess: () => {
      setHours('');
      setVerdict('');
      setOxidized(false);
      setCreased(false);
      qc.invalidateQueries({ queryKey: ['wear-tests'] });
    },
  });

  return (
    <form
      className="space-y-3 rounded-lg border border-border bg-surface p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (hours.trim()) log.mutate();
      }}
    >
      <div className="text-small font-medium text-foreground">Log a wear test</div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Input type="number" min={0} max={24} inputMode="numeric" placeholder="Hours worn" aria-label="Hours worn" value={hours} onChange={(e) => setHours(e.target.value)} />
        <Input placeholder="Verdict, e.g. repurchase" aria-label="Verdict" value={verdict} onChange={(e) => setVerdict(e.target.value)} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Chip label="Oxidized" active={oxidized} onClick={() => setOxidized(!oxidized)} />
        <Chip label="Creased" active={creased} onClick={() => setCreased(!creased)} />
      </div>
      {log.error && (
        <Alert variant="destructive">
          <AlertTitle>Couldn't log test</AlertTitle>
          <AlertDescription>{(log.error as Error).message}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" size="sm" disabled={log.isPending || !hours.trim()}>
        <FlaskConical size={16} />{log.isPending ? 'Logging' : 'Log test'}
      </Button>
    </form>
  );
}
