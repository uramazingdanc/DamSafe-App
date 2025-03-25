
// Structure forms
export type StructureType = "rectangle" | "triangle" | "trapezoid";

// Input data types
export interface DamInputs {
  structureType: StructureType;
  baseWidth: number;
  height: number;
  waterLevel: number;
  crestWidth?: number; // Only for trapezoid
  concreteDensity: number;
  waterDensity: number;
  frictionCoefficient: number;
  heelUplift?: number; // Optional
  toeUplift?: number; // Optional
  unitSystem: 'metric' | 'imperial';
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
  safetyFactorSliding: number;
  safetyFactorOverturning: number;
}
