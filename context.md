# Project Context: Get Fit With Bura

## 1. Project Overview
We are building a **high-performance, low-data mobile website** for a Kenyan fitness coach named "Bura." The primary function of the site is a **Lead Generation Funnel**.
* **Core Mechanism:** A multi-step "Wizard" questionnaire (Fitness Calculator) that collects user metrics.
* **Value Exchange:** Users provide their **Phone Number** to receive a link to their personalized fitness guide via SMS.
* **Target Audience:** Kenyan youth/young adults. Mobile-first, data-conscious.
* **Primary Constraint:** Users rarely check email. Communication happens via SMS (text message) containing a link to the results.

## 2. Tech Stack & Architecture
* **Framework:** **Astro** (for high performance/low data usage).
* **Interactivity:** **React** (Islands architecture for the Form/Wizard).
* **Styling:** **Tailwind CSS**.
* **Database:** **Supabase** (Required to store the generated plan so it can be accessed via a unique URL later).
* **SMS Gateway:** **Africa's Talking** (or similar provider) API to send the notification SMS.
* **Deployment:** Vercel.

## 3. The User Flow
1.  **Landing Page:** Fast loading hook. "Get Your Custom Body Transformation Plan."
2.  **The Calculator (Wizard):**
    * **Step 1:** Demographics (Age, Height, Weight -> Calculate BMI).
    * [cite_start]**Step 2:** Goal Selection [cite: 1] (Fat Loss, Muscle Building, etc.).
    * [cite_start]**Step 3:** Logistics (Days available [cite: 26][cite_start], Location [cite: 31][cite_start], Equipment [cite: 34]).
    * [cite_start]**Step 4:** Experience Level [cite: 8] [cite_start]& Injuries[cite: 15].
3.  **The Gate:** User enters **Name** and **Phone Number** (Kenyan format validation required: +254/07xx/01xx).
4.  **The Logic Engine:** System processes inputs, selects "Content Blocks," saves the plan to Supabase, and generates a unique ID (e.g., `/p/8x92a`).
5.  **Notification:** System triggers an SMS: "Hi [Name], your plan is ready! View it here: [URL]".
6.  **Results Page (Dynamic Route):** The unique URL loads the customized guide with video links.

## 4. Data Dictionary & Logic Maps

### Inputs (The "State")
```typescript
type UserProfile = {
  // Demographics
  age: number;
  gender: 'male' | 'female';
  weight: number; // in KG
  height: number; // in CM

  // Questionnaire Data
  goal: 'fat_loss' | 'muscle_building' | 'body_toning' | 'mobility' | 'strength' | 'general_fitness';
  activityLevel: 'beginner' | 'intermediate' | 'advanced';
  trainingLocation: 'home' | 'gym';
  equipment: string[]; // e.g., ['dumbbells', 'bands', 'bodyweight']
  daysAvailable: 2 | 3 | 4 | 5 | 6;
  hasInjuries: boolean;
  
  // Contact Info (The "Cost")
  name: string;
  phone: string; // Kenyan format (+254...)
  // NOTE: Email removed per client request (low usage in target market)
}

Logic Rules
Equipment Filter: If trainingLocation === 'home', do NOT show gym machine exercises unless specifically selected.

Injury Flag: If hasInjuries === true, inject "Medical Disclaimer" block.

Volume Logic: Map daysAvailable to specific workout splits (Full Body vs. Split).

5. Design Guidelines (The "Kenyan Context")
Images: .webp format, highly compressed.

Video: No auto-play. Thumbnails linking to external sources (TikTok/IG).

Network: Assume 3G/4G unstable connections. Fail gracefully if offline.

Input Validation: Phone number field must strip spaces and handle common Kenyan prefixes (07..., 01..., +254...).

6. Implementation Phases
Phase 1: Scaffold Astro + Tailwind.

Phase 2: Build React Wizard (Form).

Phase 3: Setup Supabase to store "Plan Results."

Phase 4: Implement Africa's Talking API (or mock it for MVP) to send the SMS with the link.