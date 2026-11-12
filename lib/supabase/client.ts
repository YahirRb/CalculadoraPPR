
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jnsjqlzcwiocpeyoxcsf.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Este cliente usa tu clave secreta y solo debe usarse en servidor
export const supabase = createClient(supabaseUrl, supabaseKey)