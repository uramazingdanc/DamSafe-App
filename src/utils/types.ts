
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
