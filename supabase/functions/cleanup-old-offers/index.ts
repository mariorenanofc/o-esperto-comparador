import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DatabaseConfig {
  supabaseUrl: string
  supabaseKey: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // SECURITY: Extract and validate JWT token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    console.log('🧹 Starting cleanup of old daily offers...')

    // Initialize Supabase client with anon key to verify user
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Create client for user verification
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    })
    
    // SECURITY: Verify user is admin
    const { data: user, error: userError } = await userSupabase.auth.getUser()
    if (userError || !user?.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin using database function
    const { data: isAdmin, error: adminError } = await userSupabase.rpc('is_user_admin')
    if (adminError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Insufficient privileges - admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Now proceed with cleanup using service role for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Calculate cutoff date: 30 days ago
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const cutoffDate = thirtyDaysAgo.toISOString()

    console.log(`🗓️ Cleaning up offers older than: ${cutoffDate}`)

    // Delete old offers (older than 30 days)
    const { data: deletedOffers, error: deleteError, count } = await supabase
      .from('daily_offers')
      .delete({ count: 'exact' })
      .lt('created_at', cutoffDate)

    if (deleteError) {
      console.error('❌ Error deleting old offers:', deleteError)
      throw deleteError
    }

    const deletedCount = count || 0
    console.log(`✅ Successfully deleted ${deletedCount} old daily offers`)

    // Also cleanup related data if needed
    const { error: notificationError } = await supabase.rpc('cleanup_old_notifications')
    if (notificationError) {
      console.warn('⚠️ Warning cleaning up notifications:', notificationError)
    }

    // Log the cleanup action for audit purposes
    const { error: logError } = await supabase.rpc('log_admin_action', {
      action_type: 'CLEANUP_OLD_OFFERS',
      action_details: {
        deleted_count: deletedCount,
        cutoff_date: cutoffDate,
        automated: true
      }
    })

    if (logError) {
      console.warn('⚠️ Warning logging cleanup action:', logError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Cleanup completed successfully`,
        deleted_count: deletedCount,
        cutoff_date: cutoffDate
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('💥 Error in cleanup function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})