// Shared types for the Bura Fitness application

export type Gender = 'male' | 'female';
export type Goal = 'fat_loss' | 'muscle_building' | 'body_toning' | 'mobility' | 'strength' | 'general_fitness';
export type ActivityLevel = 'beginner' | 'intermediate' | 'advanced';
export type DaysAvailable = '2-3' | '3-4' | '4-5' | '5-6';
export type TrainingLocation = 'home' | 'gym';
export type Equipment = 'dumbbells' | 'bands' | 'bodyweight';

/**
 * Complete user profile with all form data
 * This represents the final, validated user data stored in the database
 */
export interface UserProfile {
  // Demographics
  gender: Gender;
  age: number;
  height: number; // cm
  weight: number; // kg
  
  // Questionnaire Data
  goal: Goal;
  activityLevel: ActivityLevel;
  trainingLocation: TrainingLocation;
  equipment: Equipment[];
  daysAvailable: DaysAvailable;
  hasInjuries: boolean;
  
  // Contact Info
  name: string;
  phone: string;
}

