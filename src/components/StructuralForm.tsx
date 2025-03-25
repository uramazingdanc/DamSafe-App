
import React from 'react';
import { Square, Triangle, Hexagon } from 'lucide-react';
import { StructureType } from '@/utils/types';
import { cn } from '@/lib/utils';

interface StructuralFormProps {
  selected: StructureType;
  onChange: (type: StructureType) => void;
}

const StructuralForm: React.FC<StructuralFormProps> = ({ selected, onChange }) => {
  const structures = [
    {
      type: 'rectangle' as StructureType,
      label: 'Rectangle',
      icon: Square,
      description: 'Uniform thickness'
    },
    {
      type: 'triangle' as StructureType,
      label: 'Triangle',
      icon: Triangle,
      description: 'Triangular profile'
    },
    {
      type: 'trapezoid' as StructureType,
      label: 'Trapezoid',
      icon: Hexagon,
      description: 'With crest width'
    }
  ];

  return (
    <div className="animate-fade-up animate-delay-200">
      <p className="text-white/80 mb-3 text-sm">Select Dam Structure</p>
      <div className="grid grid-cols-3 gap-3">
        {structures.map((structure) => (
          <div
            key={structure.type}
            className={cn(
              "cursor-pointer h-full transition-all duration-300 backdrop-blur-sm rounded-xl border border-white/20",
              "flex flex-col items-center justify-center p-4 relative",
              selected === structure.type
                ? "bg-dam-blue/20 border-dam-blue ring-2 ring-dam-blue/50 transform scale-[1.02]"
                : "bg-white/5 hover:bg-white/10"
            )}
            onClick={() => onChange(structure.type)}
          >
            <structure.icon
              className={cn(
                "w-10 h-10 mb-2",
                selected === structure.type
                  ? "text-dam-blue"
                  : "text-white/80"
              )}
            />
            <h3 className="text-white font-medium text-sm">{structure.label}</h3>
            <p className="text-white/60 text-xs text-center mt-1">{structure.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StructuralForm;
