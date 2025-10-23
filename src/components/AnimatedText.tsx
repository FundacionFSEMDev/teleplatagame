import { useMemo } from 'react';

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  initialDelay?: number;
  style?: React.CSSProperties;
}

const AnimatedText = ({ text, className = '', delay = 50, initialDelay = 0, style = {} }: AnimatedTextProps) => {
  const letters = useMemo(() => text.split(''), [text]);

  return (
    <span className={className} style={{ display: 'inline-block', ...style }}>
      {letters.map((char, index) => (
        <span
          key={index}
          style={{
            display: 'inline-block',
            opacity: 0,
            animation: `fadeInUp 0.5s ease forwards`,
            animationDelay: `${initialDelay + (index * delay)}ms`,
            whiteSpace: char === ' ' ? 'pre' : 'normal'
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
};

export default AnimatedText;

