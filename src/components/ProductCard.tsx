'use client'

import { Product } from '@/lib/supabase'
import { Play, ShoppingCart } from 'lucide-react'
import Image from 'next/image'

interface ProductCardProps {
  product: Product
  onDelete?: (id: number) => void
  isAdmin?: boolean
}

export default function ProductCard({ product, onDelete, isAdmin = false }: ProductCardProps) {
  const handleBuyNow = () => {
    if (product.promotion_url) {
      window.open(product.promotion_url, '_blank', 'noopener,noreferrer')
    }
  }

  const handlePlayVideo = () => {
    if (product.video_url) {
      window.open(product.video_url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleDelete = () => {
    if (onDelete && product.id) {
      onDelete(product.id)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.image_url}
          alt={product.product_desc}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
          onError={() => {
            // Fallback handled by Next.js Image component
          }}
        />
        {product.video_url && (
          <button
            onClick={handlePlayVideo}
            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200"
            title="Play Video"
          >
            <Play size={16} />
          </button>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
          {product.product_desc}
        </h3>

        {/* Price Section */}
        <div className="mb-3">
          <div className="flex items-center gap-2">
            {product.origin_price > 0 && product.origin_price > product.discount_price && (
              <span className="text-gray-500 text-sm line-through">
                {product.origin_price.toFixed(2)} MAD
              </span>
            )}
            <span className="text-red-600 font-bold text-lg">
              {product.discount_price.toFixed(2)} MAD
            </span>
          </div>
          {product.origin_price === product.discount_price && product.origin_price > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              Regular price
            </div>
          )}
          {/* Debug info - remove this later */}
          <div className="text-xs text-gray-400 mt-1">
            Debug: Origin: {product.origin_price}, Discount: {product.discount_price}
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-1 mb-4 text-xs text-gray-600">
          {product.commission_rate && (
            <div>Commission: {product.commission_rate}%</div>
          )}
          {product.positive_feedback && (
            <div>Positive Feedback: {product.positive_feedback}%</div>
          )}
          {product.coupon_info && (
            <div className="text-green-600 font-medium">{product.coupon_info}</div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleBuyNow}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <ShoppingCart size={16} />
            Buy Now
          </button>
          
          {isAdmin && onDelete && (
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md transition-colors duration-200 text-sm"
              title="Delete Product"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
