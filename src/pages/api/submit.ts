import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
// SMS sending removed - now using WhatsApp bridge flow
// import { sendPlanLink } from '../../lib/sms';

// Ensure this API route is not prerendered
export const prerender = false;

// Generate a random 6-character alphanumeric ID
function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Check if Supabase client is configured
    if (!supabase) {
      const missingKey = !import.meta.env.PUBLIC_SUPABASE_URL 
        ? 'PUBLIC_SUPABASE_URL' 
        : 'PUBLIC_SUPABASE_ANON_KEY';
      console.error(`Supabase client not initialized. Missing: ${missingKey}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check Content-Type header (if available)
    // Note: In hybrid mode, headers may not be available during prerender
    // We'll validate the body format during parsing as a fallback
    let contentType: string | null = null;
    try {
      if (request.headers) {
        contentType = request.headers.get('content-type');
        if (contentType && !contentType.includes('application/json')) {
          return new Response(
            JSON.stringify({ success: false, message: 'Invalid request body' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    } catch (e) {
      // Headers might not be available in some contexts, continue without check
      // We'll validate the body format during parsing instead
    }

    // Parse request body with error handling
    let body;
    try {
      // Read body as text first to check if it's empty
      const text = await request.text();
      
      // If body is empty, return error
      if (!text || text.trim() === '') {
        return new Response(
          JSON.stringify({ success: false, message: 'Invalid request body' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Parse JSON
      body = JSON.parse(text);
    } catch (e) {
      // Only log if it's not an empty body (which we already handled)
      if (e instanceof SyntaxError && e.message.includes('JSON')) {
        console.error('Error parsing request body:', e.message);
      } else {
        console.error('Error parsing request body:', e);
      }
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate body is not empty and has required fields
    if (!body || typeof body !== 'object' || !body.phone) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate all required fields
    if (!body.name || !body.phone || !body.formData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique slug
    const slug = generateSlug();

    // Insert into Supabase
    const { error: dbError } = await supabase
      .from('leads')
      .insert({
        phone: body.phone,
        name: body.name,
        form_data: body.formData, // Store the entire formData object
        plan_id: slug,
      });

    if (dbError) {
      console.error('Database insertion error:', dbError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Something went wrong saving your plan. Please try again.' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // SMS sending removed - now using WhatsApp bridge flow
    // The frontend handles redirecting to WhatsApp after successful save

    // Return success (slug is still generated and saved to DB for reference, but not needed in response)
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Something went wrong saving your plan. Please try again.' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

