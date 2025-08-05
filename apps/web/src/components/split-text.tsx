import { useEffect, useState } from 'react';

interface SplitTextProps {
  text: string;
  delay?: number;
  className?: string;
  charDelay?: number;
}

export function SplitText({ 
  text, 
  delay = 0, 
  className = '', 
  charDelay = 50 
}: SplitTextProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Trigger animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const chars = text.split('').map((char, index) => (
    <span
      key={`split-${text.length}-${index}-${char.charCodeAt(0)}`}
      className={`inline-block transition-all duration-500 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4'
      }`}
      style={{
        transitionDelay: isVisible ? `${index * charDelay}ms` : '0ms',
      }}
    >
      {char === ' ' ? '\u00A0' : char}
    </span>
  ));

  return (
    <span className={className}>
      {chars}
    </span>
  );
}

// Hook-based version for more control
export function useSplitText(text: string, options?: { charDelay?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const charDelay = options?.charDelay || 50;

  const trigger = () => setIsVisible(true);
  const reset = () => setIsVisible(false);

  const chars = text.split('').map((char, index) => ({
    char: char === ' ' ? '\u00A0' : char,
    style: {
      transitionDelay: isVisible ? `${index * charDelay}ms` : '0ms',
    },
    className: `inline-block transition-all duration-500 ${
      isVisible 
        ? 'opacity-100 translate-y-0' 
        : 'opacity-0 translate-y-4'
    }`,
  }));

  return { chars, trigger, reset, isVisible };
}
