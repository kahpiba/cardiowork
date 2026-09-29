'use client';

import React, { useEffect, useState } from 'react';
import { useMotionValue, useSpring, useTransform, motion } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  decimals = 0,
  duration = 1.2,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, {
    damping: 24,
    stiffness: 90,
  });

  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  useEffect(() => {
    const unsubscribe = springVal.on('change', (latest) => {
      setDisplayValue(latest.toFixed(decimals));
    });
    return () => unsubscribe();
  }, [springVal, decimals]);

  return (
    <span className={`inline-block tabular-nums font-inherit ${className}`}>
      {prefix}{displayValue}{suffix}
    </span>
  );
};
