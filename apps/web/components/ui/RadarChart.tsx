'use client';

const CATEGORIES = [
  'LINGUISTIC', 'LOGICAL', 'MORAL', 'VALUES',
  'ASPIRATIONS', 'PREFERENCES', 'AUTOBIOGRAPHICAL', 'EMOTIONAL',
];

interface RadarChartProps {
  data: Record<string, { count: number; minRequired: number; covered: boolean }>;
  size?: number;
}

export function RadarChart({ data, size = 250 }: RadarChartProps) {
  const center = size / 2;
  const radius = (size / 2) - 30;
  const n = CATEGORIES.length;

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    return {
      x: center + radius * value * Math.cos(angle),
      y: center + radius * value * Math.sin(angle),
    };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1];

  const dataPoints = CATEGORIES.map((cat, i) => {
    const entry = data[cat];
    if (!entry) return getPoint(i, 0);
    const value = Math.min(entry.count / entry.minRequired, 1);
    return getPoint(i, value);
  });

  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gridLevels.map((level) => {
        const points = CATEGORIES.map((_, i) => {
          const p = getPoint(i, level);
          return `${p.x},${p.y}`;
        }).join(' ');
        return <polygon key={level} points={points} fill="none" stroke="#2a2a3a" strokeWidth="1" />;
      })}

      {CATEGORIES.map((_, i) => {
        const p = getPoint(i, 1);
        return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#2a2a3a" strokeWidth="1" />;
      })}

      <path d={dataPath} fill="rgba(124, 58, 237, 0.2)" stroke="#7c3aed" strokeWidth="2" />

      {CATEGORIES.map((cat, i) => {
        const p = getPoint(i, 1.15);
        const label = cat.slice(0, 4);
        return (
          <text
            key={cat}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-cloned-muted"
            fontSize="10"
          >
            {label}
          </text>
        );
      })}

      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={data[CATEGORIES[i]]?.covered ? '#5A8A5E' : '#C08552'} />
      ))}
    </svg>
  );
}
