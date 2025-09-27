'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestDatabasePage() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<string>('')

  const testConnection = async () => {
    setTesting(true)
    setResult('')
    
    try {
      if (!supabase) {
        setResult('❌ Supabase client is null - not configured properly')
        return
      }

      // Test 1: Check if we can query the products table
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(1)

      if (error) {
        setResult(`❌ Database query failed: ${JSON.stringify(error, null, 2)}`)
        return
      }

      setResult(`✅ Database connection successful! Found ${data?.length || 0} products.`)

      // Test 2: Try to insert a test product
      const testProduct = {
        product_id: `test-${Date.now()}`,
        image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
        product_desc: 'Test Product',
        origin_price: 29.99,
        discount_price: 19.99,
        promotion_url: 'https://example.com/test',
        commission_rate: 5.0,
        positive_feedback: 95,
        coupon_info: 'TEST10',
        video_url: ''
      }

      const { error: insertError } = await supabase
        .from('products')
        .insert([testProduct])

      if (insertError) {
        setResult(prev => prev + `\n❌ Insert test failed: ${JSON.stringify(insertError, null, 2)}`)
      } else {
        setResult(prev => prev + `\n✅ Insert test successful!`)

        // Clean up test product
        await supabase
          .from('products')
          .delete()
          .eq('product_id', testProduct.product_id)
      }

    } catch (error) {
      setResult(`❌ Connection test failed: ${error}`)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Database Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Check</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set'}</p>
            <p><strong>Supabase Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}</p>
            <p><strong>Supabase Client:</strong> {supabase ? '✅ Initialized' : '❌ Not initialized'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <button
            onClick={testConnection}
            disabled={testing}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Test Database Connection'}
          </button>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded">
              {result}
            </pre>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting</h2>
          <ul className="space-y-2 text-sm">
            <li>• Make sure your Supabase project is active</li>
            <li>• Verify the database schema is created (run supabase-schema.sql)</li>
            <li>• Check that your .env.local file has the correct credentials</li>
            <li>• Ensure your Supabase project URL ends with .supabase.co</li>
            <li>• Restart the development server after changing environment variables</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
