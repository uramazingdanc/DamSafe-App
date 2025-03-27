
import { DamInputs, CalculationResults, StructureType, WaterDensityUnit } from './types';

// Convert kg/m³ to kN/m³ (multiply by g=9.81 and divide by 1000)
export const convertWaterDensity = (
  density: number, 
  fromUnit: WaterDensityUnit, 
  toUnit: WaterDensityUnit
): number => {
  if (fromUnit === toUnit) return density;
  
  if (fromUnit === 'kg/m³' && toUnit === 'kN/m³') {
    // Convert kg/m³ to kN/m³: multiply by 9.81/1000
    return density * 9.81 / 1000;
  } else if (fromUnit === 'kN/m³' && toUnit === 'kg/m³') {
    // Convert kN/m³ to kg/m³: multiply by 1000/9.81
    return density * 1000 / 9.81;
  }
  
  return density; // Default case (should never reach here)
};

// Calculate dam volume based on structural type
const calculateVolume = (inputs: DamInputs): number => {
  const { structureType, baseWidth, height, crestWidth } = inputs;
  
  switch (structureType) {
    case 'rectangle':
      return baseWidth * height;
    case 'triangle':
      return (baseWidth * height) / 2;
    case 'trapezoid':
      // For trapezoid, we need both base width and crest width
      if (!crestWidth) throw new Error('Crest width required for trapezoid');
      return ((baseWidth + crestWidth) / 2) * height;
    default:
      throw new Error('Invalid structure type');
  }
};

// Calculate center of gravity based on structural type
const calculateCenterOfGravity = (inputs: DamInputs): number => {
  const { structureType, baseWidth, crestWidth } = inputs;
  
  switch (structureType) {
    case 'rectangle':
      return baseWidth / 2;
    case 'triangle':
      return baseWidth / 3;
    case 'trapezoid':
      // For trapezoid, we need both base width and crest width
      if (!crestWidth) throw new Error('Crest width required for trapezoid');
      return (baseWidth + (2 * crestWidth)) / (3 * (baseWidth + crestWidth)) * baseWidth;
    default:
      throw new Error('Invalid structure type');
  }
};

// Calculate hydrostatic uplift area
const calculateUpliftArea = (inputs: DamInputs): number => {
  const { baseWidth, heelUplift = 0, toeUplift = 0 } = inputs;
  
  // If no uplift is specified, return 0
  if (heelUplift === 0 && toeUplift === 0) return 0;
  
  // Calculate trapezoidal area for uplift
  return ((heelUplift + toeUplift) / 2) * baseWidth;
};

// Calculate hydrostatic pressure (water force)
const calculateHydrostaticPressure = (inputs: DamInputs): number => {
  const { waterDensity, waterDensityUnit, waterLevel } = inputs;
  
  // Convert waterDensity to kN/m³ for calculations if needed
  const densityInKN = waterDensityUnit === 'kg/m³' 
    ? convertWaterDensity(waterDensity, 'kg/m³', 'kN/m³') 
    : waterDensity;
  
  // Force = density × g × h × area (triangular pressure distribution)
  return densityInKN * (waterLevel * waterLevel) / 2;
};

// Process all calculations
export const calculateDamStability = (inputs: DamInputs): CalculationResults => {
  const {
    concreteDensity,
    waterDensity,
    waterDensityUnit,
    frictionCoefficient,
    waterLevel,
  } = inputs;
  
  // Convert water density to kN/m³ for calculations if needed
  const waterDensityInKN = waterDensityUnit === 'kg/m³' 
    ? convertWaterDensity(waterDensity, 'kg/m³', 'kN/m³') 
    : waterDensity;
  
  // Step 1: Calculate self-weight of the dam
  const volume = calculateVolume(inputs);
  const selfWeight = concreteDensity * volume;
  
  // Step 2: Calculate hydrostatic uplift (if applicable)
  const upliftArea = calculateUpliftArea(inputs);
  const hydrostaticUplift = waterDensityInKN * upliftArea;
  
  // Step 3: Calculate hydrostatic pressure force
  const hydrostaticPressure = calculateHydrostaticPressure({
    ...inputs,
    waterDensity: waterDensityInKN,
    waterDensityUnit: 'kN/m³'
  });
  
  // Step 4: Calculate vertical reaction (Ry)
  const verticalReaction = selfWeight - hydrostaticUplift;
  
  // Step 5: Calculate horizontal reaction (Rx)
  const horizontalReaction = hydrostaticPressure;
  
  // Step 6: Calculate center of gravity and related moments
  const centerOfGravity = calculateCenterOfGravity(inputs);
  
  // Step 7: Calculate righting moment (RM)
  const rightingMoment = selfWeight * centerOfGravity;
  
  // Step 8: Calculate overturning moment (OM)
  // Hydrostatic pressure acts at 1/3 height from bottom
  const pressureMoment = hydrostaticPressure * (waterLevel / 3);
  // Uplift moment depends on uplift distribution
  const upliftMoment = hydrostaticUplift * centerOfGravity;
  const overturningMoment = pressureMoment + upliftMoment;
  
  // Step 9: Calculate location of resultant vertical force (Ry)
  const locationOfRy = (rightingMoment - overturningMoment) / verticalReaction;
  
  // Step 10: Calculate safety factors
  const safetyFactorSliding = (frictionCoefficient * verticalReaction) / horizontalReaction;
  const safetyFactorOverturning = rightingMoment / (overturningMoment === 0 ? 1 : overturningMoment);
  
  return {
    selfWeight,
    hydrostaticUplift,
    hydrostaticPressure,
    verticalReaction,
    horizontalReaction,
    rightingMoment,
    overturningMoment,
    locationOfRy,
    safetyFactorSliding,
    safetyFactorOverturning
  };
};

// Helper to format number to 2 decimal places
export const formatNumber = (num: number): string => {
  return num.toFixed(2);
};

// Evaluate safety factor status
export const evaluateSafetyStatus = (factor: number): 'safe' | 'warning' | 'danger' => {
  if (factor >= 1.5) return 'safe';
  if (factor >= 1.0) return 'warning';
  return 'danger';
};
