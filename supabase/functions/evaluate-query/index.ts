import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import postgres from "https://deno.land/x/postgresjs/mod.js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { program_id, participant_email, question_id, submitted_query } = await req.json();

    // 1. Connect to Supabase to fetch questions and save scores
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 2. Get the expected answer for this question
    const { data: questionData, error: questionError } = await supabaseAdmin
      .from('competition_questions')
      .select('expected_output, points')
      .eq('id', question_id)
      .single();

    if (questionError || !questionData) throw new Error("Invalid question ID.");

    // 3. Connect to the database as the READ-ONLY Line Cook
    const dbHost = Deno.env.get('DB_HOST') ?? '';
    const dbPassword = Deno.env.get('COMPETITION_DB_PASSWORD') ?? '';
    
    // Using the competition_runner role we created earlier
    const sql = postgres(`postgresql://competition_runner:${dbPassword}@${dbHost}:5432/postgres`, { 
        connect_timeout: 5,
        idle_timeout: 5
    });

    let executionResult;
    let resultStatus = 'incorrect';

    try {
      // 4. Safely run the participant's SQL
      executionResult = await sql.unsafe(submitted_query);
      
      // 5. Compare their output with the expected answer
      if (JSON.stringify(executionResult) === JSON.stringify(questionData.expected_output)) {
        resultStatus = 'correct';
      }
    } catch (err) {
      // Catch syntax errors or forbidden commands (like DROP or UPDATE)
      resultStatus = 'error';
      executionResult = [{ error: err.message }];
    } finally {
      await sql.end(); // Always close the connection
    }

    // 6. Log the submission
    await supabaseAdmin.from('competition_submissions').insert([{
      program_id,
      participant_email,
      question_id,
      submitted_query,
      result_status: resultStatus
    }]);

    // 7. Update score if they got it right
    if (resultStatus === 'correct') {
      const { data: existingScore } = await supabaseAdmin
        .from('competition_scores')
        .select('total_score')
        .eq('program_id', program_id)
        .eq('participant_email', participant_email)
        .maybeSingle();

      const newScore = (existingScore?.total_score || 0) + questionData.points;

      await supabaseAdmin.from('competition_scores').upsert({
        program_id,
        participant_email,
        total_score: newScore,
        last_updated: new Date().toISOString()
      }, { onConflict: 'program_id, participant_email' });
    }

    // 8. Send the result back to the frontend
    return new Response(
      JSON.stringify({ status: resultStatus, output: executionResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});