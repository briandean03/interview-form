import { testSupabaseConnection, isSupabaseConfigured } from './src/lib/supabase.js'

async function main() {
  console.log('🔍 Supabase Connection Test')
  console.log('==========================')
  
  // Check configuration
  const isConfigured = isSupabaseConfigured()
  console.log(`Configuration Status: ${isConfigured ? '✅ Configured' : '❌ Not Configured'}`)
  
  if (!isConfigured) {
    console.log('\n❌ Environment variables are missing:')
    console.log('   - VITE_SUPABASE_URL')
    console.log('   - VITE_SUPABASE_ANON_KEY')
    console.log('\nPlease create a .env file with these variables.')
    process.exit(1)
  }
  
  // Test connection
  try {
    console.log('\n🔄 Testing connection...')
    await testSupabaseConnection()
    console.log('✅ Connection successful!')
  } catch (error) {
    console.log('❌ Connection failed:')
    console.log(error instanceof Error ? error.message : 'Unknown error')
    process.exit(1)
  }
}

main().catch(console.error)
