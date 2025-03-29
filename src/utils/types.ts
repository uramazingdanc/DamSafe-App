
// Structure forms
export type StructureType = "rectangle" | "triangle" | "trapezoid";

// Water density units
export type WaterDensityUnit = "kN/m³" | "kg/m³";

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
  frictionCoefficient?: number; // Now optional
  heelUplift?: number; // Optional
  toeUplift?: number; // Optional
  unitSystem: 'metric' | 'imperial';
  solveFor?: 'none' | 'waterLevel' | 'baseWidth' | 'frictionCoefficient'; // New field to determine what to solve for
  targetSafetyFactor?: number; // Target safety factor when solving for an unknown
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
  safetyFactorSliding?: number; // Now optional as it might not be calculated
  safetyFactorOverturning: number;
  calculationSteps: CalculationStep[];
  solvedParameter?: { name: string; value: number }; // For when solving for an unknown parameter
}

// Step-by-step calculation explanation
export interface CalculationStep {
  title: string;
  formula: string;
  explanation: string;
  value: number;
  unit?: string;
}
