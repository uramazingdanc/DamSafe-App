
import React from 'react';
import { DamInputs, StructureType } from '@/utils/types';

interface DamVisualizationProps {
  inputs: DamInputs;
  locationOfRy?: number;
}

const DamVisualization: React.FC<DamVisualizationProps> = ({ inputs, locationOfRy }) => {
  const { structureType, baseWidth, height, waterLevel, crestWidth, unitSystem } = inputs;
  
  // Calculate canvas dimensions and scaling
  const canvasWidth = 320;
  const canvasHeight = 240;
  const maxDimension = Math.max(baseWidth, height);
  const scaleFactor = Math.min(200 / maxDimension, 15); // Limit scale for very large dams
  
  // Scale dimensions for drawing
  const scaledBaseWidth = baseWidth * scaleFactor;
  const scaledHeight = height * scaleFactor;
  const scaledWaterLevel = waterLevel * scaleFactor;
  const scaledCrestWidth = crestWidth ? crestWidth * scaleFactor : 0;
  
  // Calculate x-offset to center the dam horizontally
  const xOffset = (canvasWidth - scaledBaseWidth) / 2;
  
  // Y-position of ground level
  const groundY = canvasHeight - 40;
  
  // Draw dam shape based on structure type
  const renderDamShape = () => {
    // Points array for the dam shape
    let points: { x: number; y: number }[] = [];
    
    switch (structureType) {
      case 'rectangle':
        points = [
          { x: xOffset, y: groundY },
          { x: xOffset, y: groundY - scaledHeight },
          { x: xOffset + scaledBaseWidth, y: groundY - scaledHeight },
          { x: xOffset + scaledBaseWidth, y: groundY }
        ];
        break;
        
      case 'triangle':
        points = [
          { x: xOffset, y: groundY },
          { x: xOffset + scaledBaseWidth, y: groundY - scaledHeight },
          { x: xOffset + scaledBaseWidth, y: groundY }
        ];
        break;
        
      case 'trapezoid':
        const topWidth = scaledCrestWidth;
        const topOffset = (scaledBaseWidth - topWidth) / 2;
        
        points = [
          { x: xOffset, y: groundY },
          { x: xOffset + topOffset, y: groundY - scaledHeight },
          { x: xOffset + topOffset + topWidth, y: groundY - scaledHeight },
          { x: xOffset + scaledBaseWidth, y: groundY }
        ];
        break;
    }
    
    // Create SVG path string from points
    const pathD = points.map((point, i) => 
      `${i === 0 ? 'M' : 'L'}${point.x},${point.y}`
    ).join(' ') + ' Z';
    
    return (
      <g>
        {/* Ground */}
        <line 
          x1={0} 
          y1={groundY} 
          x2={canvasWidth} 
          y2={groundY} 
          stroke="#8b5e3c" 
          strokeWidth={4} 
        />
        
        {/* Dam structure */}
        <path
          d={pathD}
          fill="#94a3b8"
          stroke="#64748b"
          strokeWidth={2}
        />
        
        {/* Water */}
        {waterLevel > 0 && (
          <rect
            x={0}
            y={groundY - scaledWaterLevel}
            width={xOffset}
            height={scaledWaterLevel}
            fill="rgba(59, 130, 246, 0.5)"
          />
        )}
        
        {/* Center of pressure indicator for Ry location */}
        {locationOfRy && (
          <circle
            cx={xOffset + (locationOfRy * scaleFactor)}
            cy={groundY}
            r={4}
            fill="#ef4444"
          />
        )}
      </g>
    );
  };
  
  // Render dimension lines and labels
  const renderDimensions = () => {
    const unitSuffix = unitSystem === 'metric' ? 'm' : 'ft';
    
    return (
      <g>
        {/* Base width dimension */}
        <line 
          x1={xOffset} 
          y1={groundY + 15} 
          x2={xOffset + scaledBaseWidth} 
          y2={groundY + 15} 
          stroke="#475569" 
          strokeWidth={1} 
          strokeDasharray="4,2"
        />
        <line 
          x1={xOffset} 
          y1={groundY + 10} 
          x2={xOffset} 
          y2={groundY + 20} 
          stroke="#475569" 
          strokeWidth={1} 
        />
        <line 
          x1={xOffset + scaledBaseWidth} 
          y1={groundY + 10} 
          x2={xOffset + scaledBaseWidth} 
          y2={groundY + 20} 
          stroke="#475569" 
          strokeWidth={1} 
        />
        <text 
          x={xOffset + (scaledBaseWidth / 2)} 
          y={groundY + 30} 
          textAnchor="middle" 
          fill="#475569" 
          fontSize="10"
          className="font-medium"
        >
          {baseWidth} {unitSuffix}
        </text>
        
        {/* Height dimension */}
        <line 
          x1={xOffset - 15} 
          y1={groundY} 
          x2={xOffset - 15} 
          y2={groundY - scaledHeight} 
          stroke="#475569" 
          strokeWidth={1} 
          strokeDasharray="4,2"
        />
        <line 
          x1={xOffset - 10} 
          y1={groundY} 
          x2={xOffset - 20} 
          y2={groundY} 
          stroke="#475569" 
          strokeWidth={1} 
        />
        <line 
          x1={xOffset - 10} 
          y1={groundY - scaledHeight} 
          x2={xOffset - 20} 
          y2={groundY - scaledHeight} 
          stroke="#475569" 
          strokeWidth={1} 
        />
        <text 
          x={xOffset - 25} 
          y={groundY - (scaledHeight / 2)} 
          textAnchor="middle" 
          fill="#475569" 
          fontSize="10"
          className="font-medium"
          transform={`rotate(-90, ${xOffset - 25}, ${groundY - (scaledHeight / 2)})`}
        >
          {height} {unitSuffix}
        </text>
        
        {/* Water level dimension */}
        {waterLevel > 0 && (
          <>
            <line 
              x1={xOffset - 35} 
              y1={groundY} 
              x2={xOffset - 35} 
              y2={groundY - scaledWaterLevel} 
              stroke="#3b82f6" 
              strokeWidth={1} 
              strokeDasharray="4,2"
            />
            <line 
              x1={xOffset - 30} 
              y1={groundY} 
              x2={xOffset - 40} 
              y2={groundY} 
              stroke="#3b82f6" 
              strokeWidth={1} 
            />
            <line 
              x1={xOffset - 30} 
              y1={groundY - scaledWaterLevel} 
              x2={xOffset - 40} 
              y2={groundY - scaledWaterLevel} 
              stroke="#3b82f6" 
              strokeWidth={1} 
            />
            <text 
              x={xOffset - 45} 
              y={groundY - (scaledWaterLevel / 2)} 
              textAnchor="middle" 
              fill="#3b82f6" 
              fontSize="10"
              className="font-medium"
              transform={`rotate(-90, ${xOffset - 45}, ${groundY - (scaledWaterLevel / 2)})`}
            >
              {waterLevel} {unitSuffix}
            </text>
          </>
        )}
        
        {/* Crest width dimension (for trapezoid only) */}
        {structureType === 'trapezoid' && crestWidth && (
          <>
            <line 
              x1={xOffset + ((baseWidth - crestWidth) / 2) * scaleFactor} 
              y1={groundY - scaledHeight - 15} 
              x2={xOffset + ((baseWidth - crestWidth) / 2 + crestWidth) * scaleFactor} 
              y2={groundY - scaledHeight - 15} 
              stroke="#475569" 
              strokeWidth={1} 
              strokeDasharray="4,2"
            />
            <line 
              x1={xOffset + ((baseWidth - crestWidth) / 2) * scaleFactor} 
              y1={groundY - scaledHeight - 10} 
              x2={xOffset + ((baseWidth - crestWidth) / 2) * scaleFactor} 
              y2={groundY - scaledHeight - 20} 
              stroke="#475569" 
              strokeWidth={1} 
            />
            <line 
              x1={xOffset + ((baseWidth - crestWidth) / 2 + crestWidth) * scaleFactor} 
              y1={groundY - scaledHeight - 10} 
              x2={xOffset + ((baseWidth - crestWidth) / 2 + crestWidth) * scaleFactor} 
              y2={groundY - scaledHeight - 20} 
              stroke="#475569" 
              strokeWidth={1} 
            />
            <text 
              x={xOffset + ((baseWidth - crestWidth) / 2 + crestWidth/2) * scaleFactor} 
              y={groundY - scaledHeight - 25} 
              textAnchor="middle" 
              fill="#475569" 
              fontSize="10"
              className="font-medium"
            >
              {crestWidth} {unitSuffix}
            </text>
          </>
        )}
      </g>
    );
  };
  
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
      <h3 className="text-white font-medium mb-3 text-center">Dam Visualization</h3>
      <svg 
        width={canvasWidth} 
        height={canvasHeight} 
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        className="mx-auto"
      >
        {renderDamShape()}
        {renderDimensions()}
      </svg>
    </div>
  );
};

export default DamVisualization;
