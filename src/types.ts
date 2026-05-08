export interface Car {
  brand: string;
  model: string;
  price: number;
  body: string;
  fuel: string;
  engine: string;
  transmission: string;
  fuelEconomy: number; // 5.6
  image?: string;
}

export type Priority = 'budget' | 'fuel_economy' | 'performance' | 'style';

export interface UserPreferences {
  maxBudget: number;
  bodyType: string[];
  priorities: Priority[];
  mileageRange: 'low' | 'medium' | 'high';
}
