import { useState } from 'react';

type Gender = 'male' | 'female';
type Goal = 'fat_loss' | 'muscle_building' | 'body_toning' | 'mobility' | 'strength' | 'general_fitness';
type ActivityLevel = 'beginner' | 'intermediate' | 'advanced';
type DaysAvailable = '2-3' | '3-4' | '4-5' | '5-6';
type PreferredMethod = 'home_workouts' | 'gym_training' | 'calisthenics';
type CommitmentLevel = 'low' | 'medium' | 'high';
type SelectedProgram = '21_day_abs' | '12_week_muscle' | 'strength_training';

// WhatsApp configuration
const COACH_PHONE = '254746110624';

// Helper functions to convert enum values to human-readable labels
function getGoalLabel(goal: Goal): string {
  const labels: Record<Goal, string> = {
    fat_loss: 'Fat Loss',
    muscle_building: 'Muscle Building',
    body_toning: 'Body Toning',
    mobility: 'Mobility',
    strength: 'Strength',
    general_fitness: 'General Fitness',
  };
  return labels[goal] || goal;
}

function getProgramLabel(program: SelectedProgram): string {
  const labels: Record<SelectedProgram, string> = {
    '21_day_abs': '21 Days Abs Challenge',
    '12_week_muscle': '12 Week Muscle Building Program',
    'strength_training': 'Strength Training Workout',
  };
  return labels[program] || program;
}

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
  
  // Step 4: History
  hasUsedTrainer: boolean | null;
  
  // Step 5: Method
  preferredMethod: PreferredMethod | '';
  
  // Step 6: Medical
  hasInjuries: boolean | null;
  
  // Step 7: Equipment
  hasEquipment: boolean | null;
  
  // Step 8: Commitment
  commitmentLevel: CommitmentLevel | '';
  
  // Step 9: Program Selection
  selectedProgram: SelectedProgram | '';
  
  // Step 10: Contact
  name: string;
  phone: string;
}

const TOTAL_STEPS = 11; // 0-10

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
    hasUsedTrainer: null,
    preferredMethod: '',
    hasInjuries: null,
    hasEquipment: null,
    commitmentLevel: '',
    selectedProgram: '',
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
      case 4: // History
        return formData.hasUsedTrainer !== null;
      case 5: // Method
        return formData.preferredMethod !== '';
      case 6: // Medical
        return formData.hasInjuries !== null;
      case 7: // Equipment
        return formData.hasEquipment !== null;
      case 8: // Commitment
        return formData.commitmentLevel !== '';
      case 9: // Program Selection
        return formData.selectedProgram !== '';
      case 10: // Contact
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
      if (currentStep < TOTAL_STEPS - 1) {
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
      setCurrentStep(prev => prev - 1);
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

        // Attempt to save to database (fail-open: continue even if this fails)
        try {
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
                hasUsedTrainer: finalData.hasUsedTrainer,
                preferredMethod: finalData.preferredMethod,
                hasInjuries: finalData.hasInjuries,
                hasEquipment: finalData.hasEquipment,
                commitmentLevel: finalData.commitmentLevel,
                selectedProgram: finalData.selectedProgram,
              },
            }),
          });

          const result = await response.json();
          if (!result.success) {
            console.warn('Database save failed, but continuing to WhatsApp:', result.error);
          }
        } catch (error) {
          // Fail-open: Continue to WhatsApp even if API call fails
          console.warn('API error (continuing to WhatsApp anyway):', error);
        }

        // Build WhatsApp message with human-readable labels
        const goalLabel = finalData.goal ? getGoalLabel(finalData.goal as Goal) : 'Not specified';
        const programLabel = finalData.selectedProgram ? getProgramLabel(finalData.selectedProgram as SelectedProgram) : 'Not specified';
        const injuriesText = finalData.hasInjuries === true ? 'Yes' : 'No';

        const whatsappMessage = `Hi Coach! I just finished the quiz.
• Name: ${finalData.name}
• Goal: ${goalLabel}
• Program Interest: ${programLabel}
• Injured: ${injuriesText}
I'm ready to start.`;

        // Construct WhatsApp URL and redirect
        const whatsappUrl = `https://wa.me/${COACH_PHONE}?text=${encodeURIComponent(whatsappMessage)}`;
        window.location.href = whatsappUrl;
      }
    }
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

  // Step 4: History
  const renderHistory = () => (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-center mb-6">Have you had a personal trainer before?</h2>
      <div className="space-y-3">
        {([
          { value: true, label: 'Yes' },
          { value: false, label: 'No' },
        ]).map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, hasUsedTrainer: option.value }))}
            className={`w-full min-h-[48px] rounded-lg font-bold transition-all ${
              formData.hasUsedTrainer === option.value
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

  // Step 5: Method
  const renderMethod = () => (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-center mb-6">Preferred training method?</h2>
      <div className="space-y-3">
        {([
          { value: 'home_workouts', label: 'Home Workouts' },
          { value: 'gym_training', label: 'Gym Training' },
          { value: 'calisthenics', label: 'Calisthenics' },
        ] as { value: PreferredMethod; label: string }[]).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, preferredMethod: option.value }))}
            className={`w-full min-h-[48px] rounded-lg font-bold transition-all ${
              formData.preferredMethod === option.value
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

  // Step 7: Equipment
  const renderEquipment = () => (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-center mb-6">Do you have training equipment?</h2>
      <div className="space-y-3">
        {([
          { value: true, label: 'Yes' },
          { value: false, label: 'No' },
        ]).map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, hasEquipment: option.value }))}
            className={`w-full min-h-[48px] rounded-lg font-bold transition-all ${
              formData.hasEquipment === option.value
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

  // Step 8: Commitment
  const renderCommitment = () => (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-center mb-6">How serious are you?</h2>
      <div className="space-y-3">
        {([
          { value: 'low', label: 'Just Curious' },
          { value: 'medium', label: 'Ready to Start' },
          { value: 'high', label: 'I will do whatever it takes' },
        ] as { value: CommitmentLevel; label: string }[]).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, commitmentLevel: option.value }))}
            className={`w-full min-h-[48px] rounded-lg font-bold transition-all ${
              formData.commitmentLevel === option.value
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

  // Step 9: Program Selection
  const renderProgramSelection = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center mb-6">Choose your program</h2>
      <div className="space-y-3">
        {([
          { value: '21_day_abs', title: '21 Days Abs Challenge', subtitle: 'Beginner Friendly' },
          { value: '12_week_muscle', title: '12 Week Muscle Building Program', subtitle: 'Intermediate' },
          { value: 'strength_training', title: 'Strength Training Workout', subtitle: 'Advanced' },
        ] as { value: SelectedProgram; title: string; subtitle: string }[]).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, selectedProgram: option.value }))}
            className={`w-full p-5 rounded-lg border-2 transition-all text-left ${
              formData.selectedProgram === option.value
                ? 'border-bura-green bg-bura-green/10'
                : 'border-gray-700 bg-gray-800'
            }`}
          >
            <div className="font-bold text-lg mb-1">{option.title}</div>
            <div className="text-sm text-gray-400">{option.subtitle}</div>
          </button>
        ))}
      </div>
    </div>
  );

  // Step 10: Contact
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
        return renderHistory();
      case 5:
        return renderMethod();
      case 6:
        return renderMedical();
      case 7:
        return renderEquipment();
      case 8:
        return renderCommitment();
      case 9:
        return renderProgramSelection();
      case 10:
        return renderContact();
      default:
        return null;
    }
  };

  // Calculate step number for display (linear flow, no skipping)
  const getDisplayStep = () => {
    return currentStep + 1;
  };

  const getTotalSteps = () => {
    return TOTAL_STEPS;
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
              className={`flex-1 min-h-[48px] rounded-full font-bold transition-all flex items-center justify-center gap-2 ${
                canProceed()
                  ? 'bg-bura-green text-bura-black hover:opacity-90 active:scale-95'
                  : 'bg-bura-gray text-gray-500 cursor-not-allowed'
              }`}
            >
              {currentStep === TOTAL_STEPS - 1 ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Get My Plan on WhatsApp
                </>
              ) : (
                'Next'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

