import type { TooltipProps } from 'recharts';

/** تلميح مخصّص للمخططات يتماشى مع ألوان السمة ويدعم RTL. */
export function ChartTooltip({
  active,
  payload,
  label,
  unit = '',
}: TooltipProps<number, string> & { unit?: string }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-card-hover">
      {label !== undefined && (
        <p className="mb-1 font-semibold text-popover-foreground">{label}</p>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: entry.color ?? entry.payload?.fill }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold text-popover-foreground">
              {typeof entry.value === 'number'
                ? entry.value.toLocaleString('ar-SA-u-nu-latn')
                : entry.value}
              {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
