
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import CalculationCard from '@/components/CalculationCard';
import DamVisualization from '@/components/DamVisualization';
import CalculationSteps from '@/components/CalculationSteps';
import { DamInputs, CalculationResults } from '@/utils/types';
import { Square, Triangle, Hexagon, Download, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { formatNumber } from '@/utils/calculations';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if state exists before destructuring
  const hasValidState = location.state && 
    location.state.results && 
    location.state.inputs;
  
  // Use useEffect to redirect if state is missing
  useEffect(() => {
    if (!hasValidState) {
      toast.error('No calculation data found. Redirecting to calculator.');
      navigate('/calculator');
    }
  }, [hasValidState, navigate]);
  
  // Return early if state is missing to prevent errors during the redirect
  if (!hasValidState) {
    return null;
  }
  
  // Now it's safe to destructure
  const { results, inputs } = location.state as { 
    results: CalculationResults, 
    inputs: DamInputs 
  };
  
  const getStructureIcon = () => {
    switch (inputs.structureType) {
      case 'rectangle':
        return <Square className="w-6 h-6 text-dam-blue" />;
      case 'triangle':
        return <Triangle className="w-6 h-6 text-dam-blue" />;
      case 'trapezoid':
        return <Hexagon className="w-6 h-6 text-dam-blue" />;
    }
  };
  
  const unitSuffix = inputs.unitSystem === 'metric' ? 'm' : 'ft';
  const forceSuffix = inputs.unitSystem === 'metric' ? 'kN' : 'lb';
  const momentSuffix = inputs.unitSystem === 'metric' ? 'kNm' : 'lb-ft';
  
  return (
    <div className="min-h-screen bg-dam-dark text-white pb-20">
      <NavBar />
      
      <div className="container max-w-5xl mx-auto px-4 pt-20">
        <div className="text-center mb-8 animate-fade-up">
          <h1 className="text-2xl font-bold mb-2">Stability Results</h1>
          <div className="flex items-center justify-center text-white/70">
            <span className="mr-2">Structure Type:</span>
            {getStructureIcon()}
            <span className="ml-1 capitalize">{inputs.structureType}</span>
          </div>
          
          {/* Show solved parameter if available */}
          {results.solvedParameter && (
            <div className="mt-3 bg-dam-blue/20 inline-block px-4 py-2 rounded-full border border-dam-blue/30">
              <span className="font-medium mr-2">Solved Parameter:</span>
              <span className="capitalize">{results.solvedParameter.name}: </span>
              <span className="font-bold">{formatNumber(results.solvedParameter.value)}</span>
              {results.solvedParameter.name === 'waterLevel' || results.solvedParameter.name === 'baseWidth'
                ? ` ${unitSuffix}`
                : ''}
            </div>
          )}
        </div>
        
        {/* Dam visualization and safety factors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Dam visualization */}
          <div className="animate-fade-up">
            <DamVisualization 
              inputs={inputs} 
              locationOfRy={results.locationOfRy}
            />
          </div>
          
          {/* Safety factors - most important results */}
          <div>
            <h2 className="text-lg font-medium border-b border-white/10 pb-2 mb-4 animate-fade-up">
              Safety Factors
            </h2>
            
            <div className="space-y-4">
              {results.safetyFactorSliding !== undefined && (
                <CalculationCard
                  title="Factor of Safety against Sliding"
                  value={results.safetyFactorSliding}
                  description="Resistance to horizontal movement"
                  isSafetyFactor
                  withStatus
                  delay={1}
                />
              )}
              
              <CalculationCard
                title="Factor of Safety against Overturning"
                value={results.safetyFactorOverturning}
                description="Resistance to rotation"
                isSafetyFactor
                withStatus
                delay={2}
              />
            </div>
          </div>
        </div>
        
        {/* Step-by-step calculations */}
        <div className="mb-10">
          <CalculationSteps steps={results.calculationSteps} />
        </div>
        
        {/* Forces */}
        <div className="mb-8">
          <h2 className="text-lg font-medium border-b border-white/10 pb-2 mb-4 animate-fade-up animate-delay-300">
            Forces
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <CalculationCard
              title="Self Weight"
              value={results.selfWeight}
              unit={forceSuffix}
              description="Weight of the structure"
              delay={3}
            />
            
            <CalculationCard
              title="Hydrostatic Uplift"
              value={results.hydrostaticUplift}
              unit={forceSuffix}
              description="Upward water pressure"
              delay={4}
            />
            
            <CalculationCard
              title="Hydrostatic Pressure"
              value={results.hydrostaticPressure}
              unit={forceSuffix}
              description="Horizontal water pressure"
              delay={5}
            />
            
            <CalculationCard
              title="Vertical Reaction (Ry)"
              value={results.verticalReaction}
              unit={forceSuffix}
              description="Net vertical force"
              delay={6}
            />
            
            <CalculationCard
              title="Horizontal Reaction (Rx)"
              value={results.horizontalReaction}
              unit={forceSuffix}
              description="Net horizontal force"
              delay={7}
            />
            
            <CalculationCard
              title="Location of Ry"
              value={results.locationOfRy}
              unit={unitSuffix}
              description="From left edge"
              delay={8}
            />
          </div>
        </div>
        
        {/* Moments */}
        <div className="mb-8">
          <h2 className="text-lg font-medium border-b border-white/10 pb-2 mb-4 animate-fade-up animate-delay-600">
            Moments
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CalculationCard
              title="Righting Moment"
              value={results.rightingMoment}
              unit={momentSuffix}
              description="Stabilizing moment"
              delay={9}
            />
            
            <CalculationCard
              title="Overturning Moment"
              value={results.overturningMoment}
              unit={momentSuffix}
              description="Destabilizing moment"
              delay={10}
            />
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-up animate-delay-800">
          <button 
            onClick={() => navigate('/calculator')}
            className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300"
          >
            <RotateCcw className="w-5 h-5" />
            <span>New Calculation</span>
          </button>
          
          <button 
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 bg-dam-blue hover:bg-dam-blue/90 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-dam-blue/20"
          >
            <Download className="w-5 h-5" />
            <span>Export Results</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
