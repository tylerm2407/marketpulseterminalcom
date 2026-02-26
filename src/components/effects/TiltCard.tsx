import React, { useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxTilt?: number;
}

export function TiltCard({ children, className, maxTilt = 8, ...props }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const card = cardRef.current;
    const highlight = highlightRef.current;
    if (!card || !highlight) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    highlight.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.08), transparent 60%)`;
  }, [maxTilt]);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    const highlight = highlightRef.current;
    if (card) card.style.transform = '';
    if (highlight) highlight.style.background = 'transparent';
  }, []);

  return (
    <div
      ref={cardRef}
      className={cn('tilt-card relative overflow-hidden', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <div ref={highlightRef} className="absolute inset-0 pointer-events-none z-10 rounded-[inherit]" />
      {children}
    </div>
  );
}
