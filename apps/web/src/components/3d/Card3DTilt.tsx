'use client';

import React, { useRef, useState, useCallback } from 'react';

interface Card3DTiltProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // derajat kemiringan maksimum (default: 10)
  glare?: boolean; // aktifkan pantulan kilau cahaya (default: true)
  scale?: number; // pembesaran saat hover (default: 1.02)
  perspective?: number; // kedalaman perspektif px (default: 1000)
}

export const Card3DTilt: React.FC<Card3DTiltProps> = ({
  children,
  className = '',
  maxTilt = 10,
  glare = true,
  scale = 1.02,
  perspective = 1000,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Hitung derajat rotasi berbasis jarak dari tengah (-1 s.d. 1)
      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      // Hitung koordinat kilau cahaya (%)
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;

      setTilt({ x: rotateX, y: rotateY });
      setGlarePosition({ x: glareX, y: glareY, opacity: 0.18 });
    },
    [maxTilt]
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Kembalikan ke posisi datar dengan transisi pegas
    setTilt({ x: 0, y: 0 });
    setGlarePosition(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      style={{ perspective: `${perspective}px` }}
      className="inline-block w-full transition-perspective"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isHovered
            ? `rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`
            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transformStyle: 'preserve-3d',
          transition: isHovered
            ? 'transform 0.08s ease-out'
            : 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
        }}
        className={`relative will-change-transform ${className}`}
      >
        {children}

        {/* Dynamic Specular Sheen / Glare Layer */}
        {glare && (
          <div
            aria-hidden="true"
            style={{
              opacity: glarePosition.opacity,
              background: `radial-gradient(circle 320px at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.7), transparent 70%)`,
              transition: 'opacity 0.3s ease-out',
            }}
            className="absolute inset-0 pointer-events-none rounded-[inherit] z-20 mix-blend-overlay"
          />
        )}
      </div>
    </div>
  );
};
