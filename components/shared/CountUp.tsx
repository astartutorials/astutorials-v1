'use client';

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

interface CountUpProps {
  value: string;
  className?: string;
}

export default function CountUp({ value, className = "" }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 20, 
    stiffness: 100, 
    duration: 2 
  });
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const match = value.match(/(\D*)(\d+)(\D*)/);
  const prefix = match ? match[1] : "";
  const number = match ? parseInt(match[2]) : 0;
  const suffix = match ? match[3] : "";
  const isNumber = match !== null;

  useEffect(() => {
    if (isInView && isNumber) {
      motionValue.set(number);
    }
  }, [isInView, motionValue, number, isNumber]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current && isNumber) {
        ref.current.textContent = `${prefix}${Math.round(latest)}${suffix}`;
      }
    });
  }, [springValue, prefix, suffix, isNumber]);
return (
    <span ref={ref} className={className}>
  
      {isNumber ? `${prefix}0${suffix}` : value}
    </span>
  );
}
