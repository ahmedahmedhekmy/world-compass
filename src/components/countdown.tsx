import { useEffect, useState } from "react";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

/** Countdown to a real expiry date. Renders nothing when there is no genuine deadline. */
export function Countdown({ endsAt }: { endsAt: string | null | undefined }) {
  const target = endsAt ? new Date(endsAt).getTime() : null;
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!target) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!target || now === null) return null;
  const left = target - now;
  if (left <= 0) {
    return <p className="text-xs font-semibold text-muted-foreground">انتهى هذا العرض</p>;
  }

  const { d, h, m, s } = parts(left);
  const cell = (v: number, label: string) => (
    <span className="grid min-w-11 place-items-center rounded-xl bg-secondary px-2 py-1">
      <span className="font-mono text-sm font-bold tabular-nums">{String(v).padStart(2, "0")}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </span>
  );

  return (
    <div className="flex items-center gap-1.5" aria-label="الوقت المتبقي على العرض">
      {cell(d, "يوم")}
      {cell(h, "ساعة")}
      {cell(m, "دقيقة")}
      {cell(s, "ثانية")}
    </div>
  );
}
