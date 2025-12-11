// Content mapping logic for generating personalized plans
// This will be expanded when client content is available

type Goal = 'fat_loss' | 'muscle_building' | 'body_toning' | 'mobility' | 'strength' | 'general_fitness';
type TrainingLocation = 'home' | 'gym';

export interface PlanContent {
  title: string;
  description: string;
  videoUrl?: string;
  videoThumbnail?: string;
}

export function getPlanContent(goal: Goal, location: TrainingLocation): PlanContent {
  const goalTitles: Record<Goal, string> = {
    fat_loss: 'Fat Loss Protocol',
    muscle_building: 'Muscle Building Program',
    body_toning: 'Body Toning Transformation',
    mobility: 'Mobility & Flexibility',
    strength: 'Strength Training Program',
    general_fitness: 'General Fitness Plan',
  };

  const locationModifiers: Record<TrainingLocation, string> = {
    home: 'Home Workout',
    gym: 'Gym Training',
  };

  return {
    title: `${goalTitles[goal]} - ${locationModifiers[location]}`,
    description: `Your personalized ${goalTitles[goal]} designed for ${location === 'home' ? 'home training' : 'gym workouts'}.`,
    videoUrl: 'https://www.youtube.com/watch?v=placeholder', // Placeholder
    videoThumbnail: '/video-thumbnail-placeholder.jpg', // Placeholder
  };
}

export function getScheduleDays(daysAvailable: string): string[] {
  // Map daysAvailable to actual days of the week
  switch (daysAvailable) {
    case '2-3':
      return ['Monday', 'Wednesday', 'Friday'];
    case '3-4':
      return ['Monday', 'Wednesday', 'Friday', 'Saturday'];
    case '4-5':
      return ['Monday', 'Tuesday', 'Thursday', 'Friday'];
    case '5-6':
      return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    default:
      return ['Monday', 'Wednesday', 'Friday'];
  }
}

export function getWorkoutPlaceholder(dayIndex: number, daysAvailable: string): string {
  const workouts = [
    'Full Body Strength',
    'Active Recovery',
    'Upper Body Focus',
    'Lower Body Focus',
    'Cardio & Conditioning',
    'Core & Stability',
    'Flexibility & Mobility',
  ];

  // Cycle through workout types based on day
  return workouts[dayIndex % workouts.length];
}

