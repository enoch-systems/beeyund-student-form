import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Types for our database
export interface Registration {
  id: number
  full_name: string
  email: string
  phone_number: string
  created_at: string
}

export interface RegistrationStats {
  total_registrations: number
  registrations_last_24h: number
  registrations_last_7d: number
}

// Lazy initialization of Supabase client
let supabaseClient: SupabaseClient | null = null

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials are not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  }
  
  return supabaseClient
}

// Export a function that returns the client (for realtime subscriptions)
export const getClient = (): SupabaseClient => getSupabaseClient()

// Export a proxy that properly binds methods to the client
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabaseClient()
    const value = (client as any)[prop]
    // Bind functions to the client so `this` is correct
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  }
})