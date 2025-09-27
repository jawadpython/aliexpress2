# AliExpress Affiliate Store

A modern Next.js + TailwindCSS affiliate website with Supabase integration for managing and displaying AliExpress products.

## Features

- 🛍️ **Admin Panel** (`/admin`) - Upload XLS files, manage products
- 🏠 **Public Store** (`/`) - Browse products with responsive grid layout
- 📊 **Database Integration** - Supabase for data persistence
- 🔄 **Real-time Updates** - Products sync across devices
- 📱 **Responsive Design** - Mobile-first approach
- 🎨 **Modern UI** - Beautiful TailwindCSS styling
- 🔔 **Notifications** - Toast messages for user feedback

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: TailwindCSS
- **Database**: Supabase
- **File Processing**: xlsx library
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd pro3
npm install
```

### 2. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your URL and anon key
3. Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Setup Database

Run the SQL from `supabase-schema.sql` in your Supabase SQL editor:

```sql
-- Create products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(255) UNIQUE NOT NULL,
    image_url TEXT NOT NULL,
    product_desc TEXT NOT NULL,
    origin_price DECIMAL(10,2) NOT NULL,
    discount_price DECIMAL(10,2) NOT NULL,
    promotion_url TEXT NOT NULL,
    commission_rate DECIMAL(5,2),
    positive_feedback INTEGER,
    coupon_info TEXT,
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index and trigger (see full file for complete setup)
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your store!

## Usage

### Admin Panel (`/admin`)

1. **Upload Products**: Click "Upload XLS" and select your AliExpress export file
2. **Download Template**: Use the template button to see the expected Excel format
3. **Manage Products**: View, delete products from the database
4. **Real-time Stats**: See total product count

### Public Store (`/`)

- **Browse Products**: Responsive grid layout (3-4 per row on desktop, 1 on mobile)
- **Product Cards**: Show image, description, prices, commission info
- **Buy Now**: Direct affiliate links to AliExpress
- **Video Support**: Play button for products with video URLs

### Excel File Format

Your XLS file should have these columns:
- `ProductId` - Unique product identifier
- `Image Url` - Product image URL
- `Product Desc` - Product description
- `Origin Price` - Original price
- `Discount Price` - Discounted price
- `Promotion Url` - Affiliate link
- `Commission Rate` - Commission percentage (optional)
- `Positive Feedback` - Feedback percentage (optional)
- `Coupon Info` - Coupon details (optional)
- `Video Url` - Product video URL (optional)

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repo to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your deployment platform:

```
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

## Project Structure

```
src/
├── app/
│   ├── admin/          # Admin panel page
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout with toast provider
│   └── page.tsx        # Home page
├── components/
│   └── ProductCard.tsx # Reusable product card component
└── lib/
    └── supabase.ts     # Supabase client and types
```

## Features in Detail

### Responsive Design
- Mobile-first approach
- Grid layouts: 1 column (mobile) → 2-4 columns (desktop)
- Smooth hover effects and transitions

### Data Management
- Automatic deduplication by ProductId
- Real-time database synchronization
- Optimistic UI updates

### User Experience
- Loading states and skeleton screens
- Toast notifications for all actions
- Error handling and fallbacks
- Smooth animations and transitions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
