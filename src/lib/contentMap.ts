// Content mapping logic for generating personalized plans
// This will be expanded when client content is available

type Goal = 'general_fitness' | 'strength' | 'weight_loss_body_toning';
type TrainingLocation = 'home' | 'gym';
type DaysAvailable = '2-3' | '3-4' | '4-5' | '5-6';
type WorkoutSplit = 'full_body' | 'upper_lower' | 'push_pull_legs' | 'body_part_split';
type Equipment = 'dumbbells' | 'bands' | 'bodyweight';

export interface PlanContent {
  title: string;
  description: string;
}

export interface WorkoutSplitInfo {
  type: WorkoutSplit;
  name: string;
  description: string;
}

export function getPlanContent(goal: Goal, location: TrainingLocation): PlanContent {
  const goalTitles: Record<Goal, string> = {
    general_fitness: 'General Fitness Plan',
    strength: 'Strength Training Program',
    weight_loss_body_toning: 'Weight Loss and Body Toning',
  };

  const locationModifiers: Record<TrainingLocation, string> = {
    home: 'Home Workout',
    gym: 'Gym Training',
  };

  return {
    title: `${goalTitles[goal]} - ${locationModifiers[location]}`,
    description: `Your personalized ${goalTitles[goal]} designed for ${location === 'home' ? 'home training' : 'gym workouts'}.`,
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

/**
 * Determines the workout split type based on days available
 * Volume Logic: Map daysAvailable to specific workout splits (Full Body vs. Split)
 */
export function getWorkoutSplit(daysAvailable: DaysAvailable): WorkoutSplitInfo {
  switch (daysAvailable) {
    case '2-3':
      // 2-3 days: Full Body (each workout targets entire body)
      return {
        type: 'full_body',
        name: 'Full Body Split',
        description: 'Each workout targets your entire body for maximum efficiency',
      };
    
    case '3-4':
      // 3-4 days: Upper/Lower Split (alternating upper and lower body)
      return {
        type: 'upper_lower',
        name: 'Upper/Lower Split',
        description: 'Alternate between upper body and lower body workouts',
      };
    
    case '4-5':
      // 4-5 days: Push/Pull/Legs (push muscles, pull muscles, legs)
      return {
        type: 'push_pull_legs',
        name: 'Push/Pull/Legs Split',
        description: 'Target push muscles, pull muscles, and legs in rotation',
      };
    
    case '5-6':
      // 5-6 days: Body Part Split (chest, back, legs, shoulders, arms)
      return {
        type: 'body_part_split',
        name: 'Body Part Split',
        description: 'Focus on specific muscle groups each day for maximum volume',
      };
    
    default:
      return {
        type: 'full_body',
        name: 'Full Body Split',
        description: 'Each workout targets your entire body',
      };
  }
}

/**
 * Equipment Filter Logic
 * If trainingLocation === 'home', do NOT show gym machine exercises unless specifically selected
 */
export function getAvailableEquipment(
  trainingLocation: TrainingLocation,
  equipment: Equipment[]
): Equipment[] {
  // If training at gym, all equipment types are available (including gym machines)
  if (trainingLocation === 'gym') {
    return equipment; // Gym has machines available, so return all selected equipment
  }
  
  // If training at home, filter out gym machines
  // Only return equipment that can be used at home
  // Current equipment types (dumbbells, bands, bodyweight) are all home-friendly
  // This function ensures gym machines are never included for home workouts
  return equipment.filter(eq => 
    eq === 'dumbbells' || 
    eq === 'bands' || 
    eq === 'bodyweight'
  );
}

/**
 * Checks if an exercise type requires gym machines
 * This helps filter out gym-specific exercises for home workouts
 */
function requiresGymMachines(exerciseType: string): boolean {
  const gymMachineExercises = [
    'cable',
    'machine',
    'smith',
    'leg press',
    'lat pulldown',
    'seated row',
    'chest press machine',
    'leg extension',
    'leg curl',
    'hack squat',
    'cable fly',
  ];
  
  return gymMachineExercises.some(machine => 
    exerciseType.toLowerCase().includes(machine)
  );
}

/**
 * Generates exercise suggestions based on equipment and location
 * Filters out gym machines when trainingLocation === 'home'
 */
export function getExerciseSuggestions(
  workoutType: string,
  trainingLocation: TrainingLocation,
  equipment: Equipment[]
): string[] {
  // Get available equipment (filtered for home workouts)
  const availableEquipment = getAvailableEquipment(trainingLocation, equipment);
  
  // If no equipment available and at home, default to bodyweight
  const effectiveEquipment = availableEquipment.length > 0 
    ? availableEquipment 
    : ['bodyweight'];
  
  // Base exercise pool (all exercises)
  const allExercises: Record<string, string[]> = {
    'Full Body Strength': [
      'Squats', 'Push-ups', 'Lunges', 'Plank', 'Burpees',
      'Deadlifts', 'Overhead Press', 'Rows', 'Leg Press', 'Cable Flyes'
    ],
    'Full Body Conditioning': [
      'Jump Squats', 'Mountain Climbers', 'High Knees', 'Plank Jacks',
      'Battle Ropes', 'Rowing Machine', 'Assault Bike', 'Sled Push'
    ],
    'Upper Body': [
      'Push-ups', 'Pull-ups', 'Dumbbell Press', 'Rows',
      'Cable Crossovers', 'Lat Pulldown', 'Chest Press Machine', 'Cable Rows'
    ],
    'Lower Body': [
      'Squats', 'Lunges', 'Deadlifts', 'Leg Press',
      'Leg Extension', 'Leg Curl', 'Hack Squat', 'Calf Raises'
    ],
    'Push Day': [
      'Bench Press', 'Overhead Press', 'Tricep Dips', 'Cable Flyes',
      'Chest Press Machine', 'Cable Tricep Extensions'
    ],
    'Pull Day': [
      'Pull-ups', 'Rows', 'Lat Pulldown', 'Cable Rows',
      'Seated Row Machine', 'Cable Face Pulls'
    ],
    'Legs Day': [
      'Squats', 'Deadlifts', 'Leg Press', 'Leg Extension',
      'Leg Curl', 'Hack Squat', 'Lunges', 'Calf Raises'
    ],
    'Chest & Triceps': [
      'Push-ups', 'Dumbbell Press', 'Cable Flyes', 'Chest Press Machine',
      'Tricep Dips', 'Cable Tricep Extensions'
    ],
    'Back & Biceps': [
      'Pull-ups', 'Rows', 'Lat Pulldown', 'Cable Rows',
      'Seated Row Machine', 'Cable Curls'
    ],
    'Legs & Glutes': [
      'Squats', 'Lunges', 'Deadlifts', 'Leg Press',
      'Leg Extension', 'Leg Curl', 'Hip Thrusts'
    ],
    'Shoulders & Core': [
      'Overhead Press', 'Lateral Raises', 'Plank', 'Cable Lateral Raises',
      'Cable Shoulder Press', 'Ab Crunches'
    ],
    'Arms & Abs': [
      'Bicep Curls', 'Tricep Extensions', 'Cable Curls', 'Cable Tricep Extensions',
      'Plank', 'Ab Crunches', 'Cable Crunches'
    ],
    'Full Body Active Recovery': [
      'Light Walking', 'Yoga', 'Stretching', 'Foam Rolling'
    ],
  };
  
  // Get exercises for this workout type
  const exercises = allExercises[workoutType] || allExercises['Full Body Strength'];
  
  // Filter based on training location
  if (trainingLocation === 'home') {
    // Remove gym machine exercises
    return exercises.filter(exercise => !requiresGymMachines(exercise));
  }
  
  // For gym, return all exercises (including machines)
  return exercises;
}

/**
 * Generates workout names based on the split type and day index
 * Now includes equipment and location awareness
 */
export function getWorkoutForDay(
  dayIndex: number,
  daysAvailable: DaysAvailable,
  splitType?: WorkoutSplit,
  trainingLocation?: TrainingLocation,
  equipment?: Equipment[]
): string {
  // If split type not provided, determine it
  const split = splitType || getWorkoutSplit(daysAvailable).type;

  switch (split) {
    case 'full_body':
      // Full Body workouts - vary intensity/focus
      const fullBodyWorkouts = [
        'Full Body Strength (Squats, Pushups, Rows, Lunges)',
        'Full Body Conditioning (Jump Squats, Mountain Climbers, Burpees)',
        'Full Body Power (Deadlifts, Push Press, Kettlebell Swings)',
      ];
      return fullBodyWorkouts[dayIndex % fullBodyWorkouts.length];

    case 'upper_lower':
      // Upper/Lower alternation
      if (dayIndex % 2 === 0) {
        return 'Upper Body (Pushups, Rows, Shoulder Press)';
      } else {
        return 'Lower Body (Squats, Deadlifts, Lunges)';
      }

    case 'push_pull_legs':
      // Push/Pull/Legs rotation
      const pplWorkouts = [
        'Push Day (Pushups, Dips, Overhead Press)',
        'Pull Day (Rows, Pull-Ups, Face Pulls)',
        'Legs Day (Squats, Lunges, Romanian Deadlifts)',
      ];
      return pplWorkouts[dayIndex % 3];

    case 'body_part_split':
      // Body part split - 5-6 day rotation
      const bodyPartWorkouts = [
        'Chest & Triceps (Bench, Incline DB Press, Dips)',
        'Back & Biceps (Rows, Pull-Ups, Hammer Curls)',
        'Legs & Glutes (Squats, Hip Thrusts, Split Squats)',
        'Shoulders & Core (Overhead Press, Lateral Raises, Planks)',
        'Arms & Abs (Curls, Tricep Extensions, Hanging Knee Raises)',
        'Full Body Active Recovery (Walk, Mobility, Light Core)',
      ];
      return bodyPartWorkouts[dayIndex % bodyPartWorkouts.length];

    default:
      return 'Full Body Strength (Squats, Pushups, Rows)';
  }
}

/**
 * Legacy function - kept for backward compatibility
 * Now uses the new volume logic
 */
export function getWorkoutPlaceholder(
  dayIndex: number, 
  daysAvailable: string,
  trainingLocation?: TrainingLocation,
  equipment?: Equipment[]
): string {
  return getWorkoutForDay(
    dayIndex, 
    daysAvailable as DaysAvailable,
    undefined,
    trainingLocation,
    equipment
  );
}

