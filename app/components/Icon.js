import Svg, { Circle, Path, Rect } from 'react-native-svg';

/**
 * The icon set drawn on the design canvas — Lucide-style strokes at 2.75, taken
 * path-for-path from the canvas markup so the app carries the same glyphs rather
 * than a lookalike font.
 */
const ICONS = {
  home: [['path', 'M3 10.5 12 3l9 7.5V21h-6v-7H9v7H3z']],
  trail: [['path', 'M6 20c6 0 4-8 9-8s3-8-3-8']],
  map: [['path', 'M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z']],
  journal: [['path', 'M6 3h12v18H8a2 2 0 0 1-2-2z']],
  profile: [['path', 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21a8 8 0 0 1 16 0']],
  flame: [['path', 'M12 3c3 4 5 6 5 9a5 5 0 0 1-10 0c0-1.5.7-2.7 1.6-3.8']],
  trophy: [
    ['path', 'M4 4h16v5a8 8 0 0 1-16 0z'],
    ['path', 'M9 20h6'],
  ],
  search: [
    ['circle', 11, 11, 7],
    ['path', 'm20 20-4.3-4.3'],
  ],
  pin: [
    ['path', 'M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12z'],
    ['circle', 12, 9, 2.4],
  ],
  warning: [
    ['path', 'M12 3 2 20h20z'],
    ['path', 'M12 10v4'],
    ['path', 'M12 17h.01'],
  ],
  image: [
    ['rect', 3, 3, 18, 18, 2],
    ['circle', 8.5, 8.5, 1.5],
    ['path', 'm21 15-5-5L5 21'],
  ],
  plus: [['path', 'M12 5v14M5 12h14']],
};

export default function Icon({ name, size = 22, color = '#000', strokeWidth = 2.75 }) {
  const parts = ICONS[name] ?? [];
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {parts.map((part, i) => {
        const [kind, ...a] = part;
        if (kind === 'circle') return <Circle key={i} cx={a[0]} cy={a[1]} r={a[2]} />;
        if (kind === 'rect') {
          return <Rect key={i} x={a[0]} y={a[1]} width={a[2]} height={a[3]} rx={a[4]} />;
        }
        return <Path key={i} d={a[0]} />;
      })}
    </Svg>
  );
}

export const ICON_NAMES = Object.keys(ICONS);
