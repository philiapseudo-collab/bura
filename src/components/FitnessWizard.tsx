import { useState } from 'react';

type Gender = 'male' | 'female';
type Goal = 'fat_loss' | 'muscle_building' | 'body_toning' | 'mobility' | 'strength' | 'general_fitness';
type ActivityLevel = 'beginner' | 'intermediate' | 'advanced';
type DaysAvailable = '2-3' | '3-4' | '4-5' | '5-6';
type TrainingLocation = 'home' | 'gym';
type Equipment = 'dumbbells' | 'bands' | 'bodyweight';

interface FormData {
  // Step 0: Body Stats
  gender: Gender | '';
  age: number | '';
  height: number | ''; // cm
  weight: number | ''; // kg
  
  // Step 1: Goal
  goal: Goal | '';
  
  // Step 2: Activity
  activityLevel: ActivityLevel | '';
  
  // Step 3: Availability
  daysAvailable: DaysAvailable | '';
  
  // Step 4: Location
  trainingLocation: TrainingLocation | '';
  
  // Step 5: Equipment (conditional)
  equipment: Equipment[];
  
  // Step 6: Medical
  hasInjuries: boolean | null;
  
  // Step 7: Contact
  name: string;
  phone: string;
}

const TOTAL_STEPS = 8; // 0-7

export default function FitnessWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [formData, setFormData] = useState<FormData>({
    gender: '',
    age: '',
    height: '',
    weight: '',
    goal: '',
    activityLevel: '',
    daysAvailable: '',
    trainingLocation: '',
    equipment: [],
    hasInjuries: null,
    name: '',
    phone: '',
  });
  const [phoneError, setPhoneError] = useState('');

  // Phone validation and normalization
  const validateAndNormalizePhone = (phone: string): { isValid: boolean; normalized: string; error: string } => {
    // Remove all spaces
    const cleaned = phone.replace(/\s/g, '');
    
    // Check if it matches Kenyan format
    const kenyanRegex = /^(\+254|0)(7|1)\d{8}$/;
    
    if (!kenyanRegex.test(cleaned)) {
      return {
        isValid: false,
        normalized: '',
        error: 'Please enter a valid Kenyan phone number (e.g., 0712...).'
      };
    }
    
    // Normalize to +254 format
    let normalized = cleaned;
    if (normalized.startsWith('0')) {
      normalized = '+254' + normalized.substring(1);
    } else if (normalized.startsWith('254')) {
      normalized = '+' + normalized;
    } else if (!normalized.startsWith('+254')) {
      normalized = '+254' + normalized;
    }
    
    return {
      isValid: true,
      normalized,
      error: ''
    };
  };

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, phone: value }));
    setPhoneError('');
  };

  const handlePhoneBlur = () => {
    if (formData.phone) {
      const validation = validateAndNormalizePhone(formData.phone);
      if (validation.isValid) {
        setFormData(prev => ({ ...prev, phone: validation.normalized }));
        setPhoneError('');
      } else {
        setPhoneError(validation.error);
      }
    }
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0: // Body Stats
        return formData.gender !== '' && 
               formData.age !== '' && 
               formData.height !== '' && 
               formData.weight !== '';
      case 1: // Goal
        return formData.goal !== '';
      case 2: // Activity
        return formData.activityLevel !== '';
      case 3: // Availability
        return formData.daysAvailable !== '';
      case 4: // Location
        return formData.trainingLocation !== '';
      case 5: // Equipment (only if home)
        if (formData.trainingLocation === 'home') {
          return formData.equipment.length > 0;
        }
        return true; // Skip if gym
      case 6: // Medical
        return formData.hasInjuries !== null;
      case 7: // Contact
        return formData.name.trim() !== '' && 
               formData.phone !== '' && 
               phoneError === '';
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      setDirection('right');
      // Skip equipment step if location is gym
      if (currentStep === 4 && formData.trainingLocation === 'gym') {
        setCurrentStep(prev => prev + 2);
      } else if (currentStep < TOTAL_STEPS - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        // Final submit
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection('left');
      // Skip back over equipment step if location is gym
      if (currentStep === 6 && formData.trainingLocation === 'gym') {
        setCurrentStep(prev => prev - 2);
      } else {
        setCurrentStep(prev => prev - 1);
      }
    }
  };

  const handleSubmit = async () => {
    // Normalize phone one more time before submit
    if (formData.phone) {
      const validation = validateAndNormalizePhone(formData.phone);
      if (validation.isValid) {
        const finalData = {
          ...formData,
          phone: validation.normalized
        };

        try {
          // Submit to API
          const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              name: finalData.name,
              phone: finalData.phone,
              formData: {
                gender: finalData.gender,
                age: finalData.age,
                height: finalData.height,
                weight: finalData.weight,
                goal: finalData.goal,
                activityLevel: finalData.activityLevel,
                daysAvailable: finalData.daysAvailable,
                trainingLocation: finalData.trainingLocation,
                equipment: finalData.equipment,
                hasInjuries: finalData.hasInjuries,
              },
            }),
          });

          const result = await response.json();

          if (result.success && result.slug) {
            // Redirect to results page
            window.location.href = `/plan/${result.slug}`;
          } else {
            console.error('Submission failed:', result.error);
            alert('Failed to submit. Please try again.');
          }
        } catch (error) {
          console.error('API error:', error);
          alert('Network error. Please check your connection and try again.');
        }
      }
    }
  };

  const toggleEquipment = (equipment: Equipment) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter(e => e !== equipment)
        : [...prev.equipment, equipment]
    }));
  };

  // Step 0: Body Stats
  const renderBodyStats = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">What's your body profile?</h2>
      
      {/* Gender */}
      <div>
        <label className="block text-sm font-medium mb-3">Gender</label>
        <div className="grid grid-cols-2 gap-3">
          {(['male', 'female'] as Gender[]).map((gender) => (
            <button
              key={gender}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, gender }))}
              className={`min-h-[48px] rounded-lg font-bold transition-all ${
                formData.gender === gender
                  ? 'bg-bura-green text-bura-black'
                  : 'bg-bura-gray text-gray-200'
              }`}
            >
              {gender === 'male' ? 'Male' : 'Female'}
            </button>
          ))}
        </div>
      </div>

      {/* Age */}
      <div>
        <label className="block text-sm font-medium mb-3">Age</label>
        <input
          type="number"
          min="1"
          max="120"
          value={formData.age}
          onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value ? parseInt(e.target.value) : '' }))}
          className="w-full min-h-[48px] px-4 rounded-lg bg-bura-gray text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-bura-green"
          placeholder="Enter your age"
        />
      </div>

      {/* Height */}
      <div>
        <label className="block text-sm font-medium mb-3">Height (cm)</label>
        <input
          type="number"
          min="50"
          max="250"
          value={formData.height}
          onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value ? parseInt(e.target.value) : '' }))}
          className="w-full min-h-[48px] px-4 rounded-lg bg-bura-gray text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-bura-green"
          placeholder="Enter height in cm"
        />
      </div>

      {/* Weight */}
      <div>
        <label className="block text-sm font-medium mb-3">Weight (kg)</label>
        <input
          type="number"
          min="20"
          max="300"
          value={formData.weight}
          onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value ? parseFloat(e.target.value) : '' }))}
          className="w-full min-h-[48px] px-4 rounded-lg bg-bura-gray text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-bura-green"
          placeholder="Enter weight in kg"
        />
      </div>
    </div>
  );

  // Step 1: Goal
  const renderGoal = () => (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-center mb-6">What's your primary goal?</h2>
      <div className="space-y-3">
        {([
          { value: 'fat_loss', label: 'Fat Loss' },
          { value: 'muscle_building', label: 'Muscle Building' },
          { value: 'body_toning', label: 'Body Toning' },
          { value: 'mobility', label: 'Mobility' },
          { value: 'strength', label: 'Strength' },
          { value: 'general_fitness', label: 'General Fitness' },
        ] as { value: Goal; label: string }[]).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, goal: option.value }))}
            className={`w-full min-h-[48px] rounded-lg font-bold transition-all ${
              formData.goal === option.value
                ? 'bg-bura-green text-bura-black'
                : 'bg-bura-gray text-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  // Step 2: Activity Level
  const renderActivity = () => (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-center mb-6">Current activity level?</h2>
      <div className="space-y-3">
        {([
          { value: 'beginner', label: 'Beginner' },
          { value: 'intermediate', label: 'Intermediate' },
          { value: 'advanced', label: 'Advanced' },
        ] as { value: ActivityLevel; label: string }[]).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, activityLevel: option.value }))}
            className={`w-full min-h-[48px] rounded-lg font-bold transition-all ${
              formData.activityLevel === option.value
                ? 'bg-bura-green text-bura-black'
                : 'bg-bura-gray text-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  // Step 3: Availability
  const renderAvailability = () => (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-center mb-6">Days per week available?</h2>
      <div className="space-y-3">
        {([
          { value: '2-3', label: '2-3 days' },
          { value: '3-4', label: '3-4 days' },
          { value: '4-5', label: '4-5 days' },
          { value: '5-6', label: '5-6 days' },
        ] as { value: DaysAvailable; label: string }[]).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, daysAvailable: option.value }))}
            className={`w-full min-h-[48px] rounded-lg font-bold transition-all ${
              formData.daysAvailable === option.value
                ? 'bg-bura-green text-bura-black'
                : 'bg-bura-gray text-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  // Step 4: Location
  const renderLocation = () => (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-center mb-6">Preferred Training Method?</h2>
      <div className="space-y-3">
        {([
          { value: 'home', label: 'Home' },
          { value: 'gym', label: 'Gym' },
        ] as { value: TrainingLocation; label: string }[]).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              setFormData(prev => ({ 
                ...prev, 
                trainingLocation: option.value,
                // Clear equipment if switching to gym
                equipment: option.value === 'gym' ? [] : prev.equipment
              }));
            }}
            className={`w-full min-h-[48px] rounded-lg font-bold transition-all ${
              formData.trainingLocation === option.value
                ? 'bg-bura-green text-bura-black'
                : 'bg-bura-gray text-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  // Step 5: Equipment
  const renderEquipment = () => (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-center mb-6">What equipment do you have?</h2>
      <div className="space-y-3">
        {([
          { value: 'dumbbells', label: 'Dumbbells' },
          { value: 'bands', label: 'Resistance Bands' },
          { value: 'bodyweight', label: 'Bodyweight Only' },
        ] as { value: Equipment; label: string }[]).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => toggleEquipment(option.value)}
            className={`w-full min-h-[48px] rounded-lg font-bold transition-all ${
              formData.equipment.includes(option.value)
                ? 'bg-bura-green text-bura-black'
                : 'bg-bura-gray text-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  // Step 6: Medical
  const renderMedical = () => (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-center mb-6">Any medical conditions/injuries?</h2>
      <div className="space-y-3">
        {([
          { value: true, label: 'Yes' },
          { value: false, label: 'No' },
        ]).map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, hasInjuries: option.value }))}
            className={`w-full min-h-[48px] rounded-lg font-bold transition-all ${
              formData.hasInjuries === option.value
                ? 'bg-bura-green text-bura-black'
                : 'bg-bura-gray text-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  // Step 7: Contact
  const renderContact = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">Almost there! Share your details</h2>
      
      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-3">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full min-h-[48px] px-4 rounded-lg bg-bura-gray text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-bura-green"
          placeholder="Enter your name"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium mb-3">Phone Number</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          onBlur={handlePhoneBlur}
          className={`w-full min-h-[48px] px-4 rounded-lg bg-bura-gray text-white border ${
            phoneError ? 'border-red-500' : 'border-gray-700'
          } focus:outline-none focus:ring-2 focus:ring-bura-green`}
          placeholder="0712 345 678"
        />
        {phoneError && (
          <p className="mt-2 text-sm text-red-500">{phoneError}</p>
        )}
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return renderBodyStats();
      case 1:
        return renderGoal();
      case 2:
        return renderActivity();
      case 3:
        return renderAvailability();
      case 4:
        return renderLocation();
      case 5:
        return renderEquipment();
      case 6:
        return renderMedical();
      case 7:
        return renderContact();
      default:
        return null;
    }
  };

  // Calculate actual step number for display (accounting for skipped equipment step)
  const getDisplayStep = () => {
    // Steps 0-4 are always shown (Body Stats, Goal, Activity, Availability, Location)
    if (currentStep <= 4) return currentStep + 1;
    
    // If gym is selected, equipment step (5) is skipped
    if (formData.trainingLocation === 'gym') {
      // currentStep 6 (Medical) displays as step 6
      // currentStep 7 (Contact) displays as step 7
      return currentStep;
    }
    
    // If home is selected, all steps are shown
    return currentStep + 1;
  };

  const getTotalSteps = () => {
    return formData.trainingLocation === 'gym' ? TOTAL_STEPS - 1 : TOTAL_STEPS;
  };

  return (
    <div className="min-h-[100dvh] max-w-md mx-auto px-4 py-8 pb-32">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">
            Step {getDisplayStep()} of {getTotalSteps()}
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-1.5">
          <div
            className="bg-bura-green h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${(getDisplayStep() / getTotalSteps()) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content with Transition */}
      <div className="mb-8 relative overflow-hidden min-h-[400px]">
        <div
          key={currentStep}
          style={{
            animation: direction === 'right' 
              ? 'slideInRight 300ms ease-out' 
              : 'slideInLeft 300ms ease-out'
          }}
        >
          {renderStep()}
        </div>
      </div>

      {/* Sticky Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-bura-black/95 backdrop-blur-sm border-t border-gray-800 pb-6 pt-4" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center gap-4">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="text-gray-400 font-medium hover:text-white active:scale-95 transition-all px-4 py-3"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex-1 min-h-[48px] rounded-full font-bold transition-all ${
                canProceed()
                  ? 'bg-bura-green text-bura-black hover:opacity-90 active:scale-95'
                  : 'bg-bura-gray text-gray-500 cursor-not-allowed'
              }`}
            >
              {currentStep === TOTAL_STEPS - 1 ? 'Submit' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

