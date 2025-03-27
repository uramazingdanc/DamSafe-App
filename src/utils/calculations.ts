
import { DamInputs, CalculationResults, StructureType, WaterDensityUnit, CalculationStep } from './types';

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

// Get volume calculation formula explanation
const getVolumeFormula = (structureType: StructureType): string => {
  switch (structureType) {
    case 'rectangle':
      return 'baseWidth × height';
    case 'triangle':
      return '(baseWidth × height) / 2';
    case 'trapezoid':
      return '((baseWidth + crestWidth) / 2) × height';
    default:
      return '';
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

// Get center of gravity formula explanation
const getCenterOfGravityFormula = (structureType: StructureType): string => {
  switch (structureType) {
    case 'rectangle':
      return 'baseWidth / 2';
    case 'triangle':
      return 'baseWidth / 3';
    case 'trapezoid':
      return '(baseWidth + (2 × crestWidth)) / (3 × (baseWidth + crestWidth)) × baseWidth';
    default:
      return '';
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
    structureType,
    baseWidth,
    height,
    crestWidth,
    concreteDensity,
    waterDensity,
    waterDensityUnit,
    frictionCoefficient,
    waterLevel,
    heelUplift = 0,
    toeUplift = 0,
    unitSystem
  } = inputs;
  
  // Unit suffixes based on unit system
  const lengthUnit = unitSystem === 'metric' ? 'm' : 'ft';
  const forceUnit = unitSystem === 'metric' ? 'kN' : 'lb';
  const momentUnit = unitSystem === 'metric' ? 'kNm' : 'lb-ft';
  const densityUnit = unitSystem === 'metric' 
    ? (waterDensityUnit === 'kN/m³' ? 'kN/m³' : 'kg/m³') 
    : 'lb/ft³';
  
  // Convert water density to kN/m³ for calculations if needed
  const waterDensityInKN = waterDensityUnit === 'kg/m³' 
    ? convertWaterDensity(waterDensity, 'kg/m³', 'kN/m³') 
    : waterDensity;
  
  // Array to hold detailed calculation steps
  const calculationSteps: CalculationStep[] = [];
  
  // Step 1: Calculate volume and self-weight of the dam
  const volume = calculateVolume(inputs);
  const volumeFormula = getVolumeFormula(structureType);
  
  // Add volume calculation step
  calculationSteps.push({
    title: "Calculate Dam Volume",
    formula: volumeFormula,
    explanation: `For a ${structureType} dam with baseWidth=${baseWidth}${lengthUnit}, height=${height}${lengthUnit}${
      structureType === 'trapezoid' ? `, crestWidth=${crestWidth}${lengthUnit}` : ''
    }, the volume is calculated using the formula for a ${structureType}.`,
    value: volume,
    unit: `${lengthUnit}²`
  });
  
  // Calculate self weight
  const selfWeight = concreteDensity * volume;
  
  // Add self-weight calculation step
  calculationSteps.push({
    title: "Calculate Self Weight",
    formula: "concreteDensity × volume",
    explanation: `The self weight is the product of the concrete density (${concreteDensity} ${densityUnit}) and the volume (${formatNumber(volume)} ${lengthUnit}²).`,
    value: selfWeight,
    unit: forceUnit
  });
  
  // Step 2: Calculate hydrostatic uplift (if applicable)
  const upliftArea = calculateUpliftArea(inputs);
  const hydrostaticUplift = waterDensityInKN * upliftArea;
  
  // Add uplift calculation step
  calculationSteps.push({
    title: "Calculate Hydrostatic Uplift",
    formula: "waterDensity × ((heelUplift + toeUplift) / 2) × baseWidth",
    explanation: `${
      heelUplift === 0 && toeUplift === 0 
        ? "No uplift values provided, so uplift force is zero." 
        : `Uplift pressure varies from ${heelUplift}${lengthUnit} at the heel to ${toeUplift}${lengthUnit} at the toe. The average uplift height is ${(heelUplift + toeUplift) / 2}${lengthUnit}, acting over the entire base width.`
    }`,
    value: hydrostaticUplift,
    unit: forceUnit
  });
  
  // Step 3: Calculate hydrostatic pressure force
  const hydrostaticPressure = calculateHydrostaticPressure({
    ...inputs,
    waterDensity: waterDensityInKN,
    waterDensityUnit: 'kN/m³'
  });
  
  // Add hydrostatic pressure calculation step
  calculationSteps.push({
    title: "Calculate Hydrostatic Pressure",
    formula: "waterDensity × (waterLevel² / 2)",
    explanation: `The water pressure increases linearly with depth, creating a triangular pressure distribution. For water level ${waterLevel}${lengthUnit} and density ${waterDensityInKN} kN/m³, the total horizontal force is calculated using the area of the pressure triangle.`,
    value: hydrostaticPressure,
    unit: forceUnit
  });
  
  // Step 4: Calculate vertical reaction (Ry)
  const verticalReaction = selfWeight - hydrostaticUplift;
  
  // Add vertical reaction calculation step
  calculationSteps.push({
    title: "Calculate Vertical Reaction (Ry)",
    formula: "selfWeight - hydrostaticUplift",
    explanation: `The net vertical force is the difference between the dam's self weight and the upward hydrostatic uplift force.`,
    value: verticalReaction,
    unit: forceUnit
  });
  
  // Step 5: Calculate horizontal reaction (Rx)
  const horizontalReaction = hydrostaticPressure;
  
  // Add horizontal reaction calculation step
  calculationSteps.push({
    title: "Calculate Horizontal Reaction (Rx)",
    formula: "hydrostaticPressure",
    explanation: `The net horizontal force is equal to the hydrostatic pressure force from the water.`,
    value: horizontalReaction,
    unit: forceUnit
  });
  
  // Step 6: Calculate center of gravity and righting moment
  const centerOfGravity = calculateCenterOfGravity(inputs);
  
  // Add center of gravity calculation step
  calculationSteps.push({
    title: "Calculate Center of Gravity",
    formula: getCenterOfGravityFormula(structureType),
    explanation: `The center of gravity position depends on the ${structureType} shape of the dam. It is measured from the left edge of the base.`,
    value: centerOfGravity,
    unit: lengthUnit
  });
  
  // Step 7: Calculate righting moment (RM)
  const rightingMoment = selfWeight * centerOfGravity;
  
  // Add righting moment calculation step
  calculationSteps.push({
    title: "Calculate Righting Moment (RM)",
    formula: "selfWeight × centerOfGravity",
    explanation: `The righting moment is the stabilizing moment created by the dam's self weight acting through its center of gravity.`,
    value: rightingMoment,
    unit: momentUnit
  });
  
  // Step 8: Calculate overturning moment (OM)
  // Hydrostatic pressure acts at 1/3 height from bottom
  const pressureMoment = hydrostaticPressure * (waterLevel / 3);
  
  // Add pressure moment calculation step
  calculationSteps.push({
    title: "Calculate Pressure Moment",
    formula: "hydrostaticPressure × (waterLevel / 3)",
    explanation: `The horizontal water pressure creates an overturning moment. The pressure resultant acts at 1/3 of the water height from the bottom.`,
    value: pressureMoment,
    unit: momentUnit
  });
  
  // Uplift moment depends on uplift distribution
  const upliftMoment = hydrostaticUplift * centerOfGravity;
  
  // Add uplift moment calculation step (if applicable)
  if (hydrostaticUplift > 0) {
    calculationSteps.push({
      title: "Calculate Uplift Moment",
      formula: "hydrostaticUplift × centerOfGravity",
      explanation: `The upward uplift force creates an additional overturning moment when acting through the dam's center of gravity.`,
      value: upliftMoment,
      unit: momentUnit
    });
  }
  
  const overturningMoment = pressureMoment + upliftMoment;
  
  // Add total overturning moment calculation step
  calculationSteps.push({
    title: "Calculate Total Overturning Moment (OM)",
    formula: "pressureMoment + upliftMoment",
    explanation: `The total overturning moment is the sum of the water pressure moment and the uplift moment.`,
    value: overturningMoment,
    unit: momentUnit
  });
  
  // Step 9: Calculate location of resultant vertical force (Ry)
  const locationOfRy = (rightingMoment - overturningMoment) / verticalReaction;
  
  // Add location of resultant calculation step
  calculationSteps.push({
    title: "Calculate Location of Resultant (Ry)",
    formula: "(rightingMoment - overturningMoment) / verticalReaction",
    explanation: `The location of the resultant vertical force is determined by taking moments about the left edge of the base.`,
    value: locationOfRy,
    unit: lengthUnit
  });
  
  // Step 10: Calculate safety factors
  const safetyFactorSliding = (frictionCoefficient * verticalReaction) / horizontalReaction;
  
  // Add sliding safety factor calculation step
  calculationSteps.push({
    title: "Calculate Factor of Safety against Sliding",
    formula: "(frictionCoefficient × verticalReaction) / horizontalReaction",
    explanation: `The sliding safety factor compares the maximum friction force available (using coefficient of friction ${frictionCoefficient}) to the horizontal force trying to push the dam.`,
    value: safetyFactorSliding,
    unit: ""
  });
  
  const safetyFactorOverturning = rightingMoment / (overturningMoment === 0 ? 1 : overturningMoment);
  
  // Add overturning safety factor calculation step
  calculationSteps.push({
    title: "Calculate Factor of Safety against Overturning",
    formula: "rightingMoment / overturningMoment",
    explanation: `The overturning safety factor compares the stabilizing (righting) moment to the destabilizing (overturning) moment.`,
    value: safetyFactorOverturning,
    unit: ""
  });
  
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
    safetyFactorOverturning,
    calculationSteps
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
