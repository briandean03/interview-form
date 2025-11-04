import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Store the client instance
let supabaseInstance: SupabaseClient | null = null

// Function to create a new Supabase client
const createSupabaseClient = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    // --- Debug: verify environment variables ---
  console.log('🔍 Supabase URL:', supabaseUrl)  
  console.log('🔍 Supabase Key present:', !!supabaseAnonKey)


  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are missing. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { params: { eventsPerSecond: 10 } },
  })
}


// Function to reset the connection
export const resetSupabaseConnection = () => {
  console.log('Resetting Supabase connection...')
  
  // Clear the existing instance
  if (supabaseInstance) {
    // Close any existing connections
    try {
      supabaseInstance.removeAllChannels()
    } catch (error) {
      console.warn('Error closing existing channels:', error)
    }
  }
  
  supabaseInstance = null
  
  // Create a new instance
  supabaseInstance = createSupabaseClient()
  
  return supabaseInstance
}

// Get or create the Supabase client
export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient()
  }
  return supabaseInstance
}

// Export the client (will be created on first access)
export const supabase = getSupabaseClient()

// Export configuration check
export const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  return Boolean(url && key && (url.includes('supabase.co') || url.includes('supabase.net')))
}


// Test connection function
export const testSupabaseConnection = async () => {
  const client = getSupabaseClient()
  if (!client) {
    throw new Error('Supabase client not configured. Please set up your Supabase connection.')
  }

  try {
    // console.log('Testing connection to:', import.meta.env.VITE_SUPABASE_URL)
    const { data, error } = await client
      .from('hrta_cd00-01_resume_extraction')
      .select('candidate_id')
      .limit(1)

    if (error) {
      console.error('Supabase query error:', error)
      if (error.message.includes('Failed to fetch') || error.code === 'PGRST301') {
        throw new Error('Cannot connect to Supabase. Please check your project URL and ensure the project is not paused.')
      }
      throw new Error(`Database error: ${error.message}`)
    }

    console.log('Supabase connection test successful')
    return true
  } catch (error) {
    console.error('Supabase connection test failed:', error)
    if (error instanceof TypeError && (error.message.includes('Failed to fetch') || error.message.includes('ERR_NAME_NOT_RESOLVED'))) {
      throw new Error('Cannot reach Supabase server. This usually means:\n\n• The Supabase project URL is incorrect\n• The Supabase project is paused or deleted\n• Network connectivity issues\n\nPlease click "Connect to Supabase" to set up your database connection.')
    }
    throw error
  }
}