
import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { evaluateSafetyStatus, formatNumber } from '@/utils/calculations';

interface CalculationCardProps {
  title: string;
  value: number;
  unit?: string;
  description?: string;
  isSafetyFactor?: boolean;
  withStatus?: boolean;
  delay?: number;
}

const CalculationCard: React.FC<CalculationCardProps> = ({
  title,
  value,
  unit,
  description,
  isSafetyFactor = false,
  withStatus = false,
  delay = 0,
}) => {
  let status: 'safe' | 'warning' | 'danger' = 'safe';
  let animationDelay = `animate-delay-${delay}00`;
  
  if (isSafetyFactor) {
    status = evaluateSafetyStatus(value);
  }
  
  const statusColors = {
    safe: "bg-green-500/20 border-green-500/30 text-green-400",
    warning: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
    danger: "bg-red-500/20 border-red-500/30 text-red-400"
  };
  
  const statusIcons = {
    safe: <CheckCircle className="w-5 h-5 text-green-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    danger: <AlertCircle className="w-5 h-5 text-red-400" />
  };

  return (
    <div 
      className={cn(
        "bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-4",
        "transition-all duration-300 hover:bg-white/10",
        "animate-fade-up",
        animationDelay
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-white/80 text-sm font-medium">{title}</h3>
        {withStatus && isSafetyFactor && (
          <div 
            className={cn(
              "rounded-full flex items-center justify-center",
              statusColors[status]
            )}
          >
            {statusIcons[status]}
          </div>
        )}
      </div>
      
      <div className="flex items-baseline">
        <span className="text-2xl font-semibold text-white">{formatNumber(value)}</span>
        {unit && <span className="ml-1 text-white/70 text-sm">{unit}</span>}
      </div>
      
      {description && (
        <p className="mt-1 text-xs text-white/60">{description}</p>
      )}
      
      {isSafetyFactor && (
        <div 
          className={cn(
            "mt-3 py-1 px-3 rounded-md text-xs font-medium",
            statusColors[status]
          )}
        >
          {status === 'safe' && 'Safe (≥ 1.5)'}
          {status === 'warning' && 'Marginal (1.0-1.5)'}
          {status === 'danger' && 'Unsafe (< 1.0)'}
        </div>
      )}
    </div>
  );
};

export default CalculationCard;
