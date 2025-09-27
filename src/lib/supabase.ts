import { createClient } from '@supabase/supabase-js'

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return url && 
         key && 
         url !== 'your_supabase_url_here' && 
         key !== 'your_supabase_anon_key_here' &&
         url.startsWith('https://') &&
         url.includes('.supabase.co')
}

// Only create client if properly configured, otherwise use null
export const supabase = isSupabaseConfigured() 
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  : null

export interface Product {
  id?: number
  product_id: string
  image_url: string
  product_desc: string
  origin_price: number
  discount_price: number
  promotion_url: string
  commission_rate?: number
  positive_feedback?: number
  coupon_info?: string
  video_url?: string
  created_at?: string
  updated_at?: string
}
