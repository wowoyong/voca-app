"use client";

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export default function ProgressBar({ current, total, className = "" }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>{current} / {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-foreground rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
