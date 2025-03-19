import React from 'react';

type GlassMorphismProps = {
  children: React.ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';
};

const GlassMorphism: React.FC<GlassMorphismProps> = ({
  children,
  className = '',
  intensity = 'medium',
}) => {
  const intensityStyles = {
    light: 'bg-white/50 backdrop-blur-sm',
    medium: 'bg-white/80 backdrop-blur-md',
    heavy: 'bg-white/90 backdrop-blur-lg',
  };

  return (
    <div className={`rounded-2xl border border-white/20 shadow-xl ${intensityStyles[intensity]} ${className}`}>
      {children}
    </div>
  );
};

export default GlassMorphism;
