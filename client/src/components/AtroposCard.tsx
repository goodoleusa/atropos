import Atropos from 'atropos/react';
import 'atropos/css';
import { ReactNode } from 'react';

interface AtroposCardProps {
  children: ReactNode;
  className?: string;
  rotateXMax?: number;
  rotateYMax?: number;
  shadow?: boolean;
  highlight?: boolean;
  onClick?: () => void;
}

export default function AtroposCard({
  children,
  className = "",
  rotateXMax = 12,
  rotateYMax = 12,
  shadow = true,
  highlight = true,
  onClick,
}: AtroposCardProps) {
  return (
    <Atropos
      className={`atropos-card ${className}`}
      rotateXMax={rotateXMax}
      rotateYMax={rotateYMax}
      shadow={shadow}
      highlight={highlight}
      onClick={onClick}
    >
      {children}
    </Atropos>
  );
}

interface AtroposLayerProps {
  children: ReactNode;
  offset?: number;
  opacity?: string;
  className?: string;
}

export function AtroposLayer({ 
  children, 
  offset = 0, 
  opacity,
  className = "" 
}: AtroposLayerProps) {
  return (
    <div 
      data-atropos-offset={offset}
      data-atropos-opacity={opacity}
      className={className}
    >
      {children}
    </div>
  );
}
