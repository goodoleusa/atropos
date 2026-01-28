import React from 'react';
import { cn } from '@/lib/utils';

interface GlitchTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'p' | 'div';
}

export const GlitchText = ({ text, className, as: Component = 'span', ...props }: GlitchTextProps) => {
  return (
    <Component 
      className={cn("text-glitch relative inline-block", className)} 
      data-text={text}
      {...props}
    >
      {text}
    </Component>
  );
};
