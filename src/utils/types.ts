
// Structure forms
export type StructureType = "rectangle" | "triangle" | "trapezoid";

// Water density units
export type WaterDensityUnit = "kN/m³" | "kg/m³";

// Mass units
export type MassUnit = "kg" | "lb";

// Input data types
export interface DamInputs {
  structureType: StructureType;
  baseWidth: number;
  height: number;
  waterLevel: number;
  crestWidth?: number; // Only for trapezoid
  concreteDensity: number;
  waterDensity: number;
  waterDensityUnit: WaterDensityUnit;
  frictionCoefficient?: number; // Optional
  heelUplift?: number; // Optional
  toeUplift?: number; // Optional
  unitSystem: 'metric' | 'imperial';
  solveFor?: 'none' | 'waterLevel' | 'baseWidth' | 'frictionCoefficient'; // What to solve for
  targetSafetyFactor?: number; // Target safety factor when solving for an unknown
  needsFrictionCalculation: boolean; // Flag to indicate if friction calculation is needed
}

// Results data types
export interface CalculationResults {
  selfWeight: number;
  hydrostaticUplift: number;
  hydrostaticPressure: number;
  verticalReaction: number;
  horizontalReaction: number;
  rightingMoment: number;
  overturningMoment: number;
  locationOfRy: number;
  safetyFactorSliding?: number; // Optional as it might not be calculated
  safetyFactorOverturning: number;
  calculationSteps: CalculationStep[];
  solvedParameter?: { name: string; value: number }; // For when solving for an unknown parameter
  massMeasurements?: {
    selfWeightMass: number;
    massUnit: MassUnit;
  }; // For displaying mass equivalents
}

// Step-by-step calculation explanation
export interface CalculationStep {
  title: string;
  formula: string;
  explanation: string;
  value: number;
  unit?: string;
  alternateValue?: number; // For displaying in alternate units
  alternateUnit?: string;
}
