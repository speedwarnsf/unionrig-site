'use client';

import React, { useRef, useEffect } from 'react';
import { typeset } from '@/lib/typeset';

interface TypesetProps {
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  [key: string]: any;
}

/**
 * <Typeset> — Wraps content and applies typographic refinement rules.
 * 
 * Usage:
 *   <Typeset as="p" className="body-text">
 *     Your paragraph text here...
 *   </Typeset>
 * 
 *   <Typeset as="h1">Big headline here</Typeset>
 */
export default function Typeset({ children, as: Tag = 'div', className, ...props }: TypesetProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current) {
      typeset(ref.current);
    }
  }, [children]);

  return React.createElement(Tag, { ref, className, ...props }, children);
}
