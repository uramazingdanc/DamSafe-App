
import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  isAnimated?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', isAnimated = false }) => {
  const sizeClasses = {
    small: 'h-8',
    medium: 'h-12',
    large: 'h-16 md:h-20'
  };

  return (
    <div className={`flex items-center ${isAnimated ? 'animate-fade-in' : ''}`}>
      <div className="relative mr-3">
        <div className={`${sizeClasses[size]} flex items-end`}>
          {/* Dam wall icon */}
          <div className="relative">
            <svg 
              width="42" 
              height="42" 
              viewBox="0 0 42 42" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className={`${sizeClasses[size]}`}
            >
              <path 
                d="M8 8V34H30" 
                stroke="white" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
              />
              {/* Water waves */}
              <path 
                className={`${isAnimated ? 'animate-water-wave' : ''}`}
                d="M18 20H25" 
                stroke="white" 
                strokeWidth="2" 
                strokeLinecap="round" 
              />
              <path 
                className={`${isAnimated ? 'animate-water-wave animate-delay-200' : ''}`}
                d="M15 24H28" 
                stroke="white" 
                strokeWidth="2" 
                strokeLinecap="round" 
              />
              <path 
                className={`${isAnimated ? 'animate-water-wave animate-delay-400' : ''}`}
                d="M12 28H31" 
                stroke="white" 
                strokeWidth="2" 
                strokeLinecap="round" 
              />
            </svg>
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <span className={`font-bold tracking-wider ${
          size === 'small' ? 'text-xl' : 
          size === 'medium' ? 'text-2xl' : 
          'text-3xl md:text-4xl'
        }`}>
          <span className="text-white">DAM</span>
          <span className="text-dam-blue">SAFE</span>
        </span>
      </div>
    </div>
  );
};

export default Logo;
