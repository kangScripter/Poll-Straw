import React, { useEffect, useRef, useState } from 'react';
import { Text, TextProps } from 'react-native';

type AnimatedNumberProps = {
  value: number;
  durationMs?: number;
} & Omit<TextProps, 'children'>;

/** Counts from previous to next value over a short ease (vote totals, live updates). */
export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  durationMs = 400,
  ...textProps
}) => {
  const [display, setDisplay] = useState(() => Math.round(value));
  const fromRef = useRef(Math.round(value));
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const target = Math.round(value);
    const start = fromRef.current;
    if (start === target) return;

    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const t0 = Date.now();
    const step = () => {
      const t = Math.min(1, (Date.now() - t0) / durationMs);
      const eased = t * t * (3 - 2 * t);
      const next = Math.round(start + (target - start) * eased);
      fromRef.current = next;
      setDisplay(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [value, durationMs]);

  return <Text {...textProps}>{display}</Text>;
};
