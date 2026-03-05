'use client';

interface ReferenceIndicatorProps {
  value: number | string;
  unit?: string;
  label: string;
  color: string;
}

export default function ReferenceIndicator({ value, unit, label, color }: ReferenceIndicatorProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="font-medium">{value}{unit}</span>
      <span
        className="text-xs font-medium px-1.5 py-0.5 rounded-full"
        style={{ backgroundColor: color + '18', color }}
      >
        {label}
      </span>
    </span>
  );
}
