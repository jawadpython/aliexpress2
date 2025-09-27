'use client'

import { useState, useEffect } from 'react'
import { supabase, Product } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import { ShoppingBag } from 'lucide-react'

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch products from Supabase
  const fetchProducts = async () => {
    try {
      // Check if Supabase is configured
      if (!supabase) {
        console.log('Supabase not configured - showing empty state')
        setProducts([])
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        setProducts([])
        return
      }
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading amazing products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="text-blue-600" />
                AliExpress Affiliate Store
              </h1>
              <p className="text-gray-600 mt-2">
                Discover amazing products with exclusive deals
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-blue-600">{products.length}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products available</h3>
            <p className="text-gray-600">
              Check back soon for amazing deals and products!
            </p>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>

            {/* Footer Info */}
            <div className="mt-12 bg-white rounded-lg shadow-sm p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🛍️ Best Deals & Discounts
              </h3>
              <p className="text-gray-600">
                All products are carefully curated affiliate links. 
                We earn a small commission when you purchase through our links at no extra cost to you.
              </p>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2024 AliExpress Affiliate Store. All rights reserved.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Powered by Next.js, TailwindCSS & Supabase
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}