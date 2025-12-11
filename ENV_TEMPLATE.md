# Environment Variables Template

Copy this to `.env.local` and fill in your values:

```env
# Supabase Configuration
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Africa's Talking SMS Service
AFRICASTALKING_USERNAME=your_africastalking_username
AFRICASTALKING_API_KEY=your_africastalking_api_key

# Site Base URL (for SMS links)
PUBLIC_SITE_URL=https://your-domain.com
# For local development, use: http://localhost:4321
```

## Getting Your Credentials

### Supabase
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the Project URL and anon/public key

### Africa's Talking
1. Register at https://africastalking.com
2. Create an application in your dashboard
3. Go to Settings > API Key
4. Generate and copy your API Key
5. Your username is your application username

### Site URL
- Production: Your deployed domain (e.g., https://burafitness.com)
- Development: http://localhost:4321

