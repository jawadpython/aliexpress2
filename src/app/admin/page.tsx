'use client'

import { useState, useEffect } from 'react'
import { supabase, Product } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import { Upload, Download, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deletingAll, setDeletingAll] = useState(false)

  // Fetch products from Supabase
  const fetchProducts = async () => {
    try {
      // Check if Supabase is configured
      if (!supabase) {
        console.log('Supabase not configured - showing setup instructions')
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
        toast.error(`Database error: ${error.message}`)
        return
      }
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to fetch products. Check your Supabase configuration.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Handle file upload and parsing
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check if Supabase is configured
    if (!supabase) {
      toast.error('Please configure Supabase first. Create a .env.local file with your Supabase credentials.')
      return
    }

    if (!file.name.endsWith('.xls') && !file.name.endsWith('.xlsx')) {
      toast.error('Please upload an Excel file (.xls or .xlsx)')
      return
    }

    setUploading(true)

    try {
      console.log('Starting file processing...')
      const data = await file.arrayBuffer()
      console.log('File read successfully, size:', data.byteLength)
      
      const workbook = XLSX.read(data)
      console.log('Workbook parsed, sheets:', workbook.SheetNames)
      
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[]
      
      console.log('Excel data parsed, rows:', jsonData.length)
      console.log('Sample row:', jsonData[0])
      console.log('Available columns:', Object.keys(jsonData[0] || {}))
      
      // Debug: Show what we're looking for vs what we found
      const availableColumns = Object.keys(jsonData[0] || {})
      console.log('=== COLUMN MAPPING DEBUG ===')
      console.log('Looking for price columns...')
      availableColumns.forEach(col => {
        if (col.toLowerCase().includes('price') || col.toLowerCase().includes('cost')) {
          console.log(`Found price column: "${col}" = ${jsonData[0][col]}`)
        }
      })
      console.log('============================')

      // Transform the data to match our Product interface
      const newProducts = jsonData.map((row: Record<string, unknown>, index: number) => {
        // Handle various column name formats - more comprehensive
        const productId = row.ProductId || row.product_id || row['Product ID'] || row['product-id'] || row['ProductId'] || ''
        const imageUrl = row['Image Url'] || row.image_url || row['Image URL'] || row['image-url'] || row['ImageUrl'] || ''
        const productDesc = row['Product Desc'] || row.product_desc || row['Product Description'] || row['product-description'] || row['ProductDesc'] || ''
        
        // Price column matching - exact match for your file structure
        const originPrice = row['Origin Price'] || row.origin_price || '0'
        const discountPrice = row['Discount Price'] || row.discount_price || '0'
        
        const promotionUrl = row['Promotion Url'] || row.promotion_url || row['Promotion URL'] || row['promotion-url'] || 
                           row['Affiliate Link'] || row['affiliate-link'] || row['Link'] || row.link || 
                           row['URL'] || row.url || ''
        
        const commissionRate = row['Commission Rate'] || row.commission_rate || row['Commission'] || row.commission || '0'
        const positiveFeedback = row['Positive Feedback'] || row.positive_feedback || row['Rating'] || row.rating || '0'
        const couponInfo = row['Coupon Info'] || row.coupon_info || row['Coupon'] || row.coupon || ''
        const videoUrl = row['Video Url'] || row.video_url || row['Video URL'] || row['video-url'] || ''

        // Ensure we have valid prices - handle currency symbols and different formats
        const cleanPrice = (price: unknown): number => {
          if (typeof price === 'number') return price
          const priceStr = String(price || '0')
          // Remove currency symbols (including MAD, DH, د.م., etc.), commas, and other non-numeric characters except decimal point
          const cleaned = priceStr
            .replace(/[MAD|DH|د\.م\.|د\.م|دج|درهم]/gi, '') // Remove MAD currency symbols
            .replace(/[^0-9.-]/g, '') // Remove other non-numeric characters
            .replace(/\s+/g, '') // Remove spaces
          const parsed = parseFloat(cleaned)
          return isNaN(parsed) ? 0 : parsed
        }
        
        const parsedOriginPrice = cleanPrice(originPrice)
        const parsedDiscountPrice = cleanPrice(discountPrice)
        
        // Debug: Log price parsing for first few products
        if (index < 3) {
          console.log(`Product ${index + 1} price debug:`, {
            rawOriginPrice: originPrice,
            rawDiscountPrice: discountPrice,
            parsedOriginPrice,
            parsedDiscountPrice,
            productId: String(productId).substring(0, 20) + '...'
          })
        }
        
        // If origin price is 0, use discount price as origin price
        const finalOriginPrice = parsedOriginPrice > 0 ? parsedOriginPrice : parsedDiscountPrice
        const finalDiscountPrice = parsedDiscountPrice > 0 ? parsedDiscountPrice : parsedOriginPrice

        return {
          product_id: String(productId),
          image_url: String(imageUrl),
          product_desc: String(productDesc),
          origin_price: finalOriginPrice,
          discount_price: finalDiscountPrice,
          promotion_url: String(promotionUrl),
          commission_rate: parseFloat(String(commissionRate)) || 0,
          positive_feedback: parseInt(String(positiveFeedback)) || 0,
          coupon_info: String(couponInfo),
          video_url: String(videoUrl),
        }
      }).filter((product: Product) => product.product_id && product.image_url && product.promotion_url)
      
      console.log('Products after filtering:', newProducts.length)

      // Deduplicate by product_id and insert new products
      let addedCount = 0
      let duplicateCount = 0

      if (!supabase) {
        throw new Error('Supabase not configured')
      }

      console.log('=== UPLOAD DEBUG INFO ===')
      console.log('Supabase client configured:', !!supabase)
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('Number of products to process:', newProducts.length)
      console.log('Sample product:', newProducts[0])
      console.log('========================')

      for (const product of newProducts) {
        try {
          // Check if product already exists
          const { data: existingProduct } = await supabase
            .from('products')
            .select('product_id')
            .eq('product_id', product.product_id)
            .single()

          if (!existingProduct) {
            const { error } = await supabase
              .from('products')
              .insert([product])

            if (error) {
              console.error('Error inserting product:', error)
              console.error('Product data:', product)
              console.error('Error details:', JSON.stringify(error, null, 2))
            } else {
              addedCount++
            }
          } else {
            duplicateCount++
          }
        } catch (error) {
          console.error('Error processing product:', product.product_id, error)
        }
      }

      toast.success(`Uploaded ${addedCount} new products. ${duplicateCount} duplicates skipped.`)
      
      // Refresh the products list
      await fetchProducts()
    } catch (error) {
      console.error('Error processing file:', error)
      toast.error('Failed to process file')
    } finally {
      setUploading(false)
      // Reset file input
      event.target.value = ''
    }
  }

  // Handle product deletion
  const handleDeleteProduct = async (id: number) => {
    try {
      if (!supabase) {
        toast.error('Supabase not configured')
        return
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Supabase delete error:', error)
        toast.error(`Failed to delete product: ${error.message}`)
        return
      }

      toast.success('Product deleted successfully')
      
      // Update local state
      setProducts(products.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    }
  }

  // Handle delete all products
  const handleDeleteAllProducts = async () => {
    if (!supabase) {
      toast.error('Supabase not configured')
      return
    }

    if (products.length === 0) {
      toast.error('No products to delete')
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ALL ${products.length} products? This action cannot be undone.`
    )

    if (!confirmed) return

    setDeletingAll(true)

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .neq('id', 0) // Delete all rows

      if (error) {
        console.error('Error deleting all products:', error)
        toast.error(`Failed to delete products: ${error.message}`)
        return
      }

      toast.success(`Successfully deleted all ${products.length} products`)
      
      // Update local state
      setProducts([])
    } catch (error) {
      console.error('Error deleting all products:', error)
      toast.error('Failed to delete all products')
    } finally {
      setDeletingAll(false)
    }
  }

  // Download template
  const downloadTemplate = () => {
    const template = [
      {
        ProductId: '123456789',
        'Image Url': 'https://example.com/image.jpg',
        'Product Desc': 'Sample Product Description',
        'Origin Price': '29.99',
        'Discount Price': '19.99',
        'Promotion Url': 'https://example.com/affiliate-link',
        'Commission Rate': '5.5',
        'Positive Feedback': '98',
        'Coupon Info': 'SAVE10',
        'Video Url': 'https://example.com/video.mp4'
      }
    ]

    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Products')
    XLSX.writeFile(wb, 'product_template.xlsx')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600 mt-2">
                Manage your AliExpress affiliate products
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Total Products: <span className="font-semibold">{products.length}</span>
              </p>
              {!supabase && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Setup Required:</strong> Please configure Supabase to use the admin panel.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
              >
                <Download size={16} />
                Download Template
              </button>
              
              <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 cursor-pointer">
                <Upload size={16} />
                {uploading ? 'Uploading...' : 'Upload XLS'}
                <input
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              {products.length > 0 && supabase && (
                <button
                  onClick={handleDeleteAllProducts}
                  disabled={deletingAll}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors duration-200"
                >
                  <Trash2 size={16} />
                  {deletingAll ? 'Deleting...' : 'Delete All'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        {!supabase && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🚀 Quick Setup Guide</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900">1. Create Supabase Project</h3>
                <p className="text-gray-600">Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">supabase.com</a> and create a new project</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900">2. Get API Credentials</h3>
                <p className="text-gray-600">In your Supabase dashboard, go to Settings → API and copy your Project URL and anon key</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900">3. Create Environment File</h3>
                <p className="text-gray-600">Create a <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> file in your project root with:</p>
                <pre className="bg-gray-100 p-3 rounded mt-2 text-sm">
{`NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here`}
                </pre>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900">4. Setup Database</h3>
                <p className="text-gray-600">Run the SQL from <code className="bg-gray-100 px-2 py-1 rounded">supabase-schema.sql</code> in your Supabase SQL editor</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900">5. Restart Development Server</h3>
                <p className="text-gray-600">Stop and restart <code className="bg-gray-100 px-2 py-1 rounded">npm run dev</code> to load the new environment variables</p>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {products.length === 0 && supabase ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Upload size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              Upload your first Excel file to get started
            </p>
          </div>
        ) : products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDelete={handleDeleteProduct}
                isAdmin={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
