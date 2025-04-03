import { DamInputs, CalculationResults, StructureType, WaterDensityUnit, CalculationStep, MassUnit } from './types';

// Convert between kg/m³ and kN/m³
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

// Convert force to mass
export const forceToMass = (force: number, unitSystem: 'metric' | 'imperial'): { mass: number; unit: MassUnit } => {
  if (unitSystem === 'metric') {
    // Convert kN to kg (F = m*g, so m = F/g)
    return { mass: force * 1000 / 9.81, unit: 'kg' };
  } else {
    // Convert lb-force to lb-mass (in imperial, they're numerically the same)
    return { mass: force, unit: 'lb' };
  }
};

// Get default water density based on unit
export const getDefaultWaterDensity = (unit: WaterDensityUnit): number => {
  return unit === 'kN/m³' ? 9.81 : 1000;
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

// Calculate center of gravity X position based on structural type
// This is measured from the left (heel) of the dam
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
      
      // Formula for centroid of a trapezoid from the left edge (heel)
      return (baseWidth + (2 * crestWidth)) / (3 * (baseWidth + crestWidth)) * baseWidth;
    default:
      throw new Error('Invalid structure type');
  }
};

// Calculate the center of gravity height (Y) from the base
const calculateCenterOfGravityHeight = (inputs: DamInputs): number => {
  const { structureType, height, crestWidth } = inputs;
  
  switch (structureType) {
    case 'rectangle':
      return height / 2;
    case 'triangle':
      return height / 3;
    case 'trapezoid':
      if (!crestWidth) throw new Error('Crest width required for trapezoid');
      return height / 3 * (2 * crestWidth + baseWidth) / (crestWidth + baseWidth);
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
      return '(baseWidth + 2 × crestWidth) / (3 × (baseWidth + crestWidth)) × baseWidth';
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
  
  // Force = density × waterLevel² / 2 (triangular pressure distribution)
  return densityInKN * (waterLevel * waterLevel) / 2;
};

// Calculate sliding safety factor
const calculateSlidingSafetyFactor = (
  verticalReaction: number, 
  horizontalReaction: number, 
  frictionCoefficient?: number,
  needsFrictionCalculation: boolean = true
): number | undefined => {
  if (!needsFrictionCalculation || frictionCoefficient === undefined) return undefined;
  
  return (frictionCoefficient * verticalReaction) / horizontalReaction;
};

// Calculate overturning safety factor
const calculateOverturningFactor = (
  rightingMoment: number, 
  overturningMoment: number
): number => {
  return rightingMoment / (overturningMoment === 0 ? 1 : overturningMoment);
};

// Solve for required water level to achieve target safety factor
const solveForWaterLevel = (inputs: DamInputs, targetSafetyFactor: number): number => {
  let low = 0;
  let high = inputs.height;
  let mid = (low + high) / 2;
  let iterations = 0;
  const maxIterations = 100;
  const tolerance = 0.001;
  
  while (iterations < maxIterations) {
    // Create test inputs with current water level guess
    const testInputs = { ...inputs, waterLevel: mid };
    
    // Calculate results with current water level
    const { rightingMoment, overturningMoment } = calculateIntermediateResults(testInputs);
    
    // Calculate safety factor
    const safFactor = rightingMoment / (overturningMoment || 1);
    
    // Check if we're close enough to target
    if (Math.abs(safFactor - targetSafetyFactor) < tolerance) {
      return mid;
    }
    
    // Adjust search range
    if (safFactor > targetSafetyFactor) {
      // Water level too low, increase it
      low = mid;
    } else {
      // Water level too high, decrease it
      high = mid;
    }
    
    mid = (low + high) / 2;
    iterations++;
  }
  
  return mid; // Return best approximation after max iterations
};

// Solve for required base width to achieve target safety factor
const solveForBaseWidth = (inputs: DamInputs, targetSafetyFactor: number): number => {
  let low = 0.1; // Start with small positive number to avoid division by zero
  let high = inputs.height * 10; // Assuming reasonable max base width
  let mid = (low + high) / 2;
  let iterations = 0;
  const maxIterations = 100;
  const tolerance = 0.001;
  
  while (iterations < maxIterations) {
    // Ensure we don't evaluate at zero
    if (mid <= 0) mid = 0.1;
    
    // Create test inputs with current base width guess
    const testInputs = { ...inputs, baseWidth: mid };
    
    // Calculate results with current base width
    const intermediateResults = calculateIntermediateResults(testInputs);
    const { rightingMoment, overturningMoment } = intermediateResults;
    
    // Calculate safety factor
    const safFactor = rightingMoment / (overturningMoment || 1);
    
    // Check if we're close enough to target
    if (Math.abs(safFactor - targetSafetyFactor) < tolerance) {
      return mid;
    }
    
    // Adjust search range
    if (safFactor < targetSafetyFactor) {
      // Base width too small, increase it
      low = mid;
    } else {
      // Base width too large, decrease it
      high = mid;
    }
    
    mid = (low + high) / 2;
    iterations++;
  }
  
  return mid; // Return best approximation after max iterations
};

// Solve for required friction coefficient to achieve target safety factor
const solveForFrictionCoefficient = (
  verticalReaction: number, 
  horizontalReaction: number, 
  targetSafetyFactor: number
): number => {
  return (targetSafetyFactor * horizontalReaction) / verticalReaction;
};

// Calculate intermediate results for use in various calculations
const calculateIntermediateResults = (inputs: DamInputs) => {
  // Calculate volume and self-weight
  const volume = calculateVolume(inputs);
  const selfWeight = inputs.concreteDensity * volume;
  
  // Calculate center of gravity from the heel (left edge)
  const centerOfGravity = calculateCenterOfGravity(inputs);
  
  // Calculate hydrostatic uplift
  const upliftArea = calculateUpliftArea(inputs);
  const waterDensityInKN = inputs.waterDensityUnit === 'kg/m³' 
    ? convertWaterDensity(inputs.waterDensity, 'kg/m³', 'kN/m³') 
    : inputs.waterDensity;
  const hydrostaticUplift = waterDensityInKN * upliftArea;
  
  // Calculate hydrostatic pressure
  const hydrostaticPressure = calculateHydrostaticPressure(inputs);
  
  // Calculate vertical reaction
  const verticalReaction = selfWeight - hydrostaticUplift;
  
  // Calculate horizontal reaction
  const horizontalReaction = hydrostaticPressure;
  
  // Calculate righting moment based on the dam's weight about the heel
  // Righting moment (RM) is the moment due to self-weight calculated about the left edge (heel)
  const rightingMoment = selfWeight * centerOfGravity;
  
  // Calculate pressure moment (water acts at h/3 from bottom)
  const pressureMoment = hydrostaticPressure * (inputs.waterLevel / 3);
  
  // Calculate uplift moment
  // The uplift force creates an overturning moment measured from the heel
  const upliftMoment = hydrostaticUplift * inputs.baseWidth / 2;
  
  // Calculate total overturning moment
  const overturningMoment = pressureMoment + upliftMoment;
  
  // Calculate location of resultant
  const locationOfRy = verticalReaction !== 0 
    ? (rightingMoment - overturningMoment) / verticalReaction 
    : 0;
  
  return {
    volume,
    selfWeight,
    centerOfGravity,
    hydrostaticUplift,
    hydrostaticPressure,
    verticalReaction,
    horizontalReaction,
    rightingMoment,
    overturningMoment,
    locationOfRy,
    pressureMoment,
    upliftMoment
  };
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
    unitSystem,
    solveFor = 'none',
    targetSafetyFactor,
    needsFrictionCalculation
  } = inputs;
  
  // Unit suffixes based on unit system
  const lengthUnit = unitSystem === 'metric' ? 'm' : 'ft';
  const forceUnit = unitSystem === 'metric' ? 'kN' : 'lb';
  const momentUnit = unitSystem === 'metric' ? 'kNm' : 'lb-ft';
  const densityUnit = unitSystem === 'metric' 
    ? (waterDensityUnit === 'kN/m³' ? 'kN/m³' : 'kg/m³') 
    : 'lb/ft³';
  
  // Array to hold detailed calculation steps
  const calculationSteps: CalculationStep[] = [];
  
  // Handle solving for unknown parameters
  let modifiedInputs = { ...inputs };
  let solvedParameter: { name: string; value: number } | undefined;
  
  if (solveFor !== 'none' && targetSafetyFactor) {
    // We need to solve for an unknown parameter
    if (solveFor === 'waterLevel') {
      // Initial calculation with a guess value to set up the problem
      const intermediateResults = calculateIntermediateResults(inputs);
      
      // Solve for water level
      const solvedWaterLevel = solveForWaterLevel(inputs, targetSafetyFactor);
      modifiedInputs.waterLevel = solvedWaterLevel;
      solvedParameter = { name: 'waterLevel', value: solvedWaterLevel };
      
      // Add solved parameter calculation step
      calculationSteps.push({
        title: "Solve for Required Water Level",
        formula: "Numerical method (bisection)",
        explanation: `Using numerical methods to find the water level that achieves a target safety factor of ${targetSafetyFactor}`,
        value: solvedWaterLevel,
        unit: lengthUnit
      });
    } 
    else if (solveFor === 'baseWidth') {
      // Initial calculation with a guess value
      const intermediateResults = calculateIntermediateResults(inputs);
      
      // Solve for base width
      const solvedBaseWidth = solveForBaseWidth(inputs, targetSafetyFactor);
      modifiedInputs.baseWidth = solvedBaseWidth;
      solvedParameter = { name: 'baseWidth', value: solvedBaseWidth };
      
      // Add solved parameter calculation step
      calculationSteps.push({
        title: "Solve for Required Base Width",
        formula: "Numerical method (bisection)",
        explanation: `Using numerical methods to find the base width that achieves a target safety factor of ${targetSafetyFactor}`,
        value: solvedBaseWidth,
        unit: lengthUnit
      });
    }
  }
  
  // Calculate intermediate results with potentially modified inputs
  const {
    volume,
    selfWeight,
    centerOfGravity,
    hydrostaticUplift,
    hydrostaticPressure,
    verticalReaction,
    horizontalReaction,
    rightingMoment,
    overturningMoment,
    locationOfRy,
    pressureMoment,
    upliftMoment
  } = calculateIntermediateResults(modifiedInputs);
  
  // If solving for friction coefficient, do it after intermediate calculations
  if (solveFor === 'frictionCoefficient' && targetSafetyFactor) {
    const solvedFriction = solveForFrictionCoefficient(
      verticalReaction, 
      horizontalReaction, 
      targetSafetyFactor
    );
    
    modifiedInputs.frictionCoefficient = solvedFriction;
    solvedParameter = { name: 'frictionCoefficient', value: solvedFriction };
    
    // Add solved parameter calculation step
    calculationSteps.push({
      title: "Solve for Required Friction Coefficient",
      formula: "(targetSafetyFactor × horizontalReaction) / verticalReaction",
      explanation: `Calculating the friction coefficient needed to achieve a target sliding safety factor of ${targetSafetyFactor}`,
      value: solvedFriction,
      unit: ""
    });
  }
  
  // Convert weight to mass for additional display
  const { mass: selfWeightMass, unit: massUnit } = forceToMass(selfWeight, unitSystem);
  
  // Step 1: Calculate volume and self-weight of the dam
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
  
  // Add self-weight calculation step
  calculationSteps.push({
    title: "Calculate Self Weight (W)",
    formula: "concreteDensity × volume",
    explanation: `The self weight (W) is the product of the concrete density (${concreteDensity} ${densityUnit}) and the volume (${formatNumber(volume)} ${lengthUnit}²).`,
    value: selfWeight,
    unit: forceUnit,
    alternateValue: selfWeightMass,
    alternateUnit: massUnit
  });
  
  // Step 2: Calculate hydrostatic uplift (if applicable)
  const upliftArea = calculateUpliftArea(modifiedInputs);
  
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
  // Add hydrostatic pressure calculation step
  calculationSteps.push({
    title: "Calculate Hydrostatic Pressure",
    formula: "waterDensity × (waterLevel² / 2)",
    explanation: `The water pressure increases linearly with depth, creating a triangular pressure distribution. For water level ${modifiedInputs.waterLevel}${lengthUnit} and density ${waterDensity} ${waterDensityUnit}, the total horizontal force is calculated using the area of the pressure triangle.`,
    value: hydrostaticPressure,
    unit: forceUnit
  });
  
  // Step 4: Calculate vertical reaction (Ry)
  // Add vertical reaction calculation step
  calculationSteps.push({
    title: "Calculate Vertical Reaction (Ry)",
    formula: "selfWeight - hydrostaticUplift",
    explanation: `The net vertical force is the difference between the dam's self weight (W) and the upward hydrostatic uplift force.`,
    value: verticalReaction,
    unit: forceUnit
  });
  
  // Step 5: Calculate horizontal reaction (Rx)
  // Add horizontal reaction calculation step
  calculationSteps.push({
    title: "Calculate Horizontal Reaction (Rx)",
    formula: "hydrostaticPressure",
    explanation: `The net horizontal force is equal to the hydrostatic pressure force from the water.`,
    value: horizontalReaction,
    unit: forceUnit
  });
  
  // Step 6: Calculate center of gravity and righting moment
  // Add center of gravity calculation step
  calculationSteps.push({
    title: "Calculate Center of Gravity",
    formula: getCenterOfGravityFormula(structureType),
    explanation: `The center of gravity position depends on the ${structureType} shape of the dam. It is measured from the left edge (heel) of the base.`,
    value: centerOfGravity,
    unit: lengthUnit
  });
  
  // Step 7: Calculate righting moment (RM)
  calculationSteps.push({
    title: "Calculate Righting Moment (RM)",
    formula: "selfWeight × centerOfGravity",
    explanation: `The righting moment (RM) is created by the dam's self weight (W) acting through its center of gravity. This moment tends to resist overturning.`,
    value: rightingMoment,
    unit: momentUnit
  });
  
  // Step 8: Calculate overturning moment (OM)
  // Hydrostatic pressure acts at 1/3 height from bottom
  // Add pressure moment calculation step
  calculationSteps.push({
    title: "Calculate Pressure Moment",
    formula: "hydrostaticPressure × (waterLevel / 3)",
    explanation: `The horizontal water pressure creates an overturning moment. The pressure resultant acts at 1/3 of the water height from the bottom.`,
    value: pressureMoment,
    unit: momentUnit
  });
  
  // Add uplift moment calculation step (if applicable)
  if (hydrostaticUplift > 0) {
    calculationSteps.push({
      title: "Calculate Uplift Moment",
      formula: "hydrostaticUplift × (baseWidth / 2)",
      explanation: `The upward uplift force creates an additional overturning moment when acting through the middle of the dam's base.`,
      value: upliftMoment,
      unit: momentUnit
    });
  }
  
  // Add total overturning moment calculation step
  calculationSteps.push({
    title: "Calculate Total Overturning Moment (OM)",
    formula: "pressureMoment + upliftMoment",
    explanation: `The total overturning moment is the sum of the water pressure moment and the uplift moment.`,
    value: overturningMoment,
    unit: momentUnit
  });
  
  // Step 9: Calculate location of resultant vertical force (Ry)
  // Add location of resultant calculation step
  calculationSteps.push({
    title: "Calculate Location of Resultant (Ry)",
    formula: "(rightingMoment - overturningMoment) / verticalReaction",
    explanation: `The location of the resultant vertical force is determined by taking moments about the left edge (heel) of the base.`,
    value: locationOfRy,
    unit: lengthUnit
  });
  
  // Step 10: Calculate safety factors
  let safetyFactorSliding: number | undefined;
  
  // Only calculate sliding factor if friction coefficient is provided and needed
  if (needsFrictionCalculation && frictionCoefficient !== undefined) {
    safetyFactorSliding = calculateSlidingSafetyFactor(
      verticalReaction, 
      horizontalReaction, 
      frictionCoefficient,
      needsFrictionCalculation
    );
    
    // Add sliding safety factor calculation step
    calculationSteps.push({
      title: "Calculate Factor of Safety against Sliding",
      formula: "(frictionCoefficient × verticalReaction) / horizontalReaction",
      explanation: `The sliding safety factor compares the maximum friction force available (using coefficient of friction ${frictionCoefficient}) to the horizontal force trying to push the dam.`,
      value: safetyFactorSliding!,
      unit: ""
    });
  }
  
  const safetyFactorOverturning = calculateOverturningFactor(rightingMoment, overturningMoment);
  
  // Add overturning safety factor calculation step
  calculationSteps.push({
    title: "Calculate Factor of Safety against Overturning",
    formula: "rightingMoment / overturningMoment",
    explanation: `The overturning safety factor compares the righting moment (RM) to the overturning moment (OM).`,
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
    calculationSteps,
    solvedParameter,
    massMeasurements: {
      selfWeightMass,
      massUnit
    }
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
