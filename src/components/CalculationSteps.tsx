
import React from 'react';
import { CalculationStep } from '@/utils/types';
import { formatNumber } from '@/utils/calculations';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CalculationStepsProps {
  steps: CalculationStep[];
}

const CalculationSteps: React.FC<CalculationStepsProps> = ({ steps }) => {
  const [expandedSteps, setExpandedSteps] = React.useState<Record<number, boolean>>({});
  
  const toggleStep = (index: number) => {
    setExpandedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium border-b border-white/10 pb-2 mb-4 animate-fade-up animate-delay-200">
        Step-by-Step Solution
      </h2>
      
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={index}
            className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 animate-fade-up"
            style={{ animationDelay: `${(index + 3) * 100}ms` }}
          >
            <div 
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => toggleStep(index)}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-dam-blue/20 text-dam-blue flex items-center justify-center mr-3 font-medium">
                  {index + 1}
                </div>
                <h3 className="font-medium">{step.title}</h3>
              </div>
              
              <div className="flex items-center">
                <div className="mr-3 text-white/90 text-right">
                  <span className="font-medium">{formatNumber(step.value)}</span>
                  {step.unit && <span className="ml-1 text-white/70">{step.unit}</span>}
                </div>
                {expandedSteps[index] ? (
                  <ChevronUp className="h-5 w-5 text-white/70" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-white/70" />
                )}
              </div>
            </div>
            
            {expandedSteps[index] && (
              <div className="border-t border-white/10 p-4 bg-white/[0.03]">
                <div className="mb-3">
                  <div className="text-white/70 mb-1 text-sm">Formula:</div>
                  <div className="bg-white/10 rounded-lg p-3 font-mono text-sm">
                    {step.formula}
                  </div>
                </div>
                <div>
                  <div className="text-white/70 mb-1 text-sm">Explanation:</div>
                  <div className="text-sm">{step.explanation}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalculationSteps;
