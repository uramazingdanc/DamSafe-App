
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import InputField from '@/components/InputField';
import StructuralForm from '@/components/StructuralForm';
import { DamInputs, StructureType, WaterDensityUnit } from '@/utils/types';
import { calculateDamStability, convertWaterDensity } from '@/utils/calculations';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Calculator = () => {
  const navigate = useNavigate();
  const [structureType, setStructureType] = useState<StructureType>('rectangle');
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [waterDensityUnit, setWaterDensityUnit] = useState<WaterDensityUnit>('kN/m³');
  
  const [inputs, setInputs] = useState<Partial<DamInputs>>({
    structureType: 'rectangle',
    baseWidth: undefined,
    height: undefined,
    waterLevel: undefined,
    crestWidth: undefined,
    concreteDensity: unitSystem === 'metric' ? 23.5 : 149.76, // Default values
    waterDensity: unitSystem === 'metric' ? 9.81 : 62.4, // Default values
    waterDensityUnit: 'kN/m³',
    frictionCoefficient: 0.7, // Default value
    heelUplift: 0,
    toeUplift: 0,
    unitSystem: 'metric'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Effect to convert water density when units change
  useEffect(() => {
    if (inputs.waterDensity && inputs.waterDensityUnit !== waterDensityUnit) {
      const convertedDensity = convertWaterDensity(
        inputs.waterDensity,
        inputs.waterDensityUnit as WaterDensityUnit,
        waterDensityUnit
      );
      
      setInputs(prev => ({
        ...prev,
        waterDensity: convertedDensity,
        waterDensityUnit
      }));
    }
  }, [waterDensityUnit]);
  
  const handleStructureChange = (type: StructureType) => {
    setStructureType(type);
    setInputs(prev => ({ ...prev, structureType: type }));
  };
  
  const handleUnitSystemChange = (system: 'metric' | 'imperial') => {
    setUnitSystem(system);
    
    // Update density values based on unit system
    const concreteDensity = system === 'metric' ? 23.5 : 149.76;
    
    // Default water density in current unit
    let waterDensity: number;
    if (system === 'metric') {
      waterDensity = waterDensityUnit === 'kN/m³' ? 9.81 : 1000;
    } else {
      waterDensity = 62.4; // lb/ft³
    }
    
    setInputs(prev => ({
      ...prev,
      concreteDensity,
      waterDensity,
      unitSystem: system
    }));
  };
  
  const handleWaterDensityUnitChange = (unit: WaterDensityUnit) => {
    setWaterDensityUnit(unit);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (value === '') {
      setInputs(prev => ({ ...prev, [name]: undefined }));
      return;
    }
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setInputs(prev => ({ ...prev, [name]: numValue }));
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateInputs = (): boolean => {
    const newErrors: Record<string, string> = {};
    const requiredFields = ['baseWidth', 'height', 'waterLevel', 'concreteDensity', 'waterDensity', 'frictionCoefficient'];
    
    if (structureType === 'trapezoid') {
      requiredFields.push('crestWidth');
    }
    
    requiredFields.forEach(field => {
      if (inputs[field as keyof DamInputs] === undefined) {
        newErrors[field] = 'This field is required';
      }
    });
    
    // Validate water level is less than or equal to height
    if (inputs.waterLevel && inputs.height && inputs.waterLevel > inputs.height) {
      newErrors.waterLevel = 'Water level cannot exceed dam height';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) {
      toast.error('Please correct the errors in the form');
      return;
    }
    
    try {
      const results = calculateDamStability(inputs as DamInputs);
      
      // Navigate to results page with data
      navigate('/results', { 
        state: { 
          results,
          inputs
        } 
      });
    } catch (error) {
      console.error('Calculation error:', error);
      toast.error('Error during calculation. Please check your inputs.');
    }
  };
  
  return (
    <div className="min-h-screen bg-dam-dark text-white pb-20">
      <NavBar />
      
      <div className="container max-w-md mx-auto px-4 pt-20">
        <div className="text-center mb-8 animate-fade-up">
          <h1 className="text-2xl font-bold mb-2">Dam Parameters</h1>
          <p className="text-white/70">Enter measurements and properties</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Structure selection */}
          <StructuralForm 
            selected={structureType} 
            onChange={handleStructureChange} 
          />
          
          {/* Unit system toggle */}
          <div className="animate-fade-up animate-delay-300">
            <p className="text-white/80 mb-3 text-sm">Unit System</p>
            <div className="flex bg-white/5 rounded-lg p-1 backdrop-blur-sm">
              {(['metric', 'imperial'] as const).map((system) => (
                <button
                  key={system}
                  type="button"
                  className={`flex-1 py-2 text-sm rounded-md transition-all ${
                    unitSystem === system 
                      ? 'bg-dam-blue text-white shadow-md' 
                      : 'text-white/70 hover:text-white'
                  }`}
                  onClick={() => handleUnitSystemChange(system)}
                >
                  {system === 'metric' ? 'Metric (m, kN)' : 'Imperial (ft, lb)'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Main dimensions */}
          <div className="space-y-4 animate-fade-up animate-delay-400">
            <h2 className="text-lg font-medium border-b border-white/10 pb-2 mb-3">Dimensions</h2>
            
            <InputField
              label="Base Width"
              name="baseWidth"
              type="number"
              placeholder="Enter base width"
              value={inputs.baseWidth || ''}
              onChange={handleInputChange}
              suffix={unitSystem === 'metric' ? 'm' : 'ft'}
              error={errors.baseWidth}
              min="0"
              step="0.1"
            />
            
            <InputField
              label="Height"
              name="height"
              type="number"
              placeholder="Enter height"
              value={inputs.height || ''}
              onChange={handleInputChange}
              suffix={unitSystem === 'metric' ? 'm' : 'ft'}
              error={errors.height}
              min="0"
              step="0.1"
            />
            
            <InputField
              label="Water Level"
              name="waterLevel"
              type="number"
              placeholder="Enter water level"
              value={inputs.waterLevel || ''}
              onChange={handleInputChange}
              suffix={unitSystem === 'metric' ? 'm' : 'ft'}
              error={errors.waterLevel}
              min="0"
              step="0.1"
            />
            
            {structureType === 'trapezoid' && (
              <InputField
                label="Crest Width"
                name="crestWidth"
                type="number"
                placeholder="Enter crest width"
                value={inputs.crestWidth || ''}
                onChange={handleInputChange}
                suffix={unitSystem === 'metric' ? 'm' : 'ft'}
                error={errors.crestWidth}
                min="0"
                step="0.1"
              />
            )}
          </div>
          
          {/* Material properties */}
          <div className="space-y-4 animate-fade-up animate-delay-500">
            <h2 className="text-lg font-medium border-b border-white/10 pb-2 mb-3">Material Properties</h2>
            
            <InputField
              label="Concrete Density"
              name="concreteDensity"
              type="number"
              placeholder="Enter concrete density"
              value={inputs.concreteDensity || ''}
              onChange={handleInputChange}
              suffix={unitSystem === 'metric' ? 'kN/m³' : 'lb/ft³'}
              error={errors.concreteDensity}
              min="0"
              step="0.1"
            />
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="waterDensity" className="block text-sm font-medium text-white/90">
                  Water Density
                </label>
                
                <Select
                  value={waterDensityUnit}
                  onValueChange={(value) => handleWaterDensityUnitChange(value as WaterDensityUnit)}
                >
                  <SelectTrigger className="w-24 h-8 bg-white/5 border-white/20 text-sm">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent className="bg-dam-dark border-white/20">
                    <SelectItem value="kN/m³">kN/m³</SelectItem>
                    <SelectItem value="kg/m³">kg/m³</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <InputField
                name="waterDensity"
                type="number"
                placeholder="Enter water density"
                value={inputs.waterDensity || ''}
                onChange={handleInputChange}
                suffix={unitSystem === 'imperial' ? 'lb/ft³' : waterDensityUnit}
                error={errors.waterDensity}
                min="0"
                step="0.1"
              />
            </div>
            
            <InputField
              label="Friction Coefficient"
              name="frictionCoefficient"
              type="number"
              placeholder="Enter friction coefficient"
              value={inputs.frictionCoefficient || ''}
              onChange={handleInputChange}
              error={errors.frictionCoefficient}
              min="0"
              max="1"
              step="0.01"
            />
          </div>
          
          {/* Optional uplift inputs */}
          <div className="space-y-4 animate-fade-up animate-delay-600">
            <h2 className="text-lg font-medium border-b border-white/10 pb-2 mb-3">
              Hydrostatic Uplift (Optional)
            </h2>
            
            <InputField
              label="Heel Uplift"
              name="heelUplift"
              type="number"
              placeholder="Enter heel uplift pressure"
              value={inputs.heelUplift || ''}
              onChange={handleInputChange}
              suffix={unitSystem === 'metric' ? 'm' : 'ft'}
              min="0"
              step="0.1"
            />
            
            <InputField
              label="Toe Uplift"
              name="toeUplift"
              type="number"
              placeholder="Enter toe uplift pressure"
              value={inputs.toeUplift || ''}
              onChange={handleInputChange}
              suffix={unitSystem === 'metric' ? 'm' : 'ft'}
              min="0"
              step="0.1"
            />
          </div>
          
          {/* Submit button */}
          <div className="pt-4 animate-fade-up animate-delay-700">
            <button
              type="submit"
              className="w-full bg-dam-blue hover:bg-dam-blue/90 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-dam-blue/20"
            >
              Calculate Stability
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Calculator;
