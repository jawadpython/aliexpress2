# Deployment Guide

## Quick Setup for Production

### 1. Supabase Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the project to be ready

2. **Get API Credentials**
   - Go to Settings > API
   - Copy your Project URL and anon/public key

3. **Setup Database**
   - Go to SQL Editor in your Supabase dashboard
   - Run the SQL from `supabase-schema.sql`:

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

-- Create index on product_id for faster lookups
CREATE INDEX idx_products_product_id ON products(product_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 2. Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
   - Deploy!

### 3. Alternative: Deploy to Netlify

1. **Build the project**
   ```bash
   npm run build
   npm run export  # If using static export
   ```

2. **Deploy**
   - Connect your GitHub repo to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `.next`
   - Add environment variables in Netlify dashboard

### 4. Environment Variables

Make sure to set these in your deployment platform:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Post-Deployment

1. **Test Admin Panel**
   - Visit `https://your-domain.com/admin`
   - Upload a test XLS file
   - Verify products appear

2. **Test Public Store**
   - Visit `https://your-domain.com`
   - Verify products display correctly
   - Test responsive design on mobile

### 6. Domain Setup (Optional)

1. **Custom Domain on Vercel**
   - Go to Project Settings > Domains
   - Add your custom domain
   - Configure DNS records

2. **SSL Certificate**
   - Automatically handled by Vercel/Netlify
   - Force HTTPS redirect

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check environment variables are set
   - Ensure all dependencies are in package.json
   - Run `npm run build` locally first

2. **Database Connection Issues**
   - Verify Supabase URL and key are correct
   - Check Supabase project is active
   - Ensure database schema is created

3. **Images Not Loading**
   - Check Next.js image configuration
   - Verify image URLs are accessible
   - Update `next.config.ts` if needed

4. **Admin Panel Not Working**
   - Check file upload permissions
   - Verify XLS file format matches template
   - Check browser console for errors

### Performance Optimization

1. **Image Optimization**
   - Use Next.js Image component (already implemented)
   - Consider CDN for external images
   - Optimize image sizes

2. **Database Optimization**
   - Add indexes for frequently queried fields
   - Use pagination for large datasets
   - Implement caching if needed

3. **Bundle Optimization**
   - Code splitting (already handled by Next.js)
   - Lazy load components if needed
   - Optimize bundle size

## Monitoring

1. **Vercel Analytics**
   - Enable Vercel Analytics for performance monitoring
   - Track Core Web Vitals

2. **Supabase Monitoring**
   - Monitor database usage in Supabase dashboard
   - Set up alerts for high usage

3. **Error Tracking**
   - Consider adding Sentry for error tracking
   - Monitor user feedback

## Security Considerations

1. **Environment Variables**
   - Never commit `.env.local` to version control
   - Use different keys for development/production

2. **Database Security**
   - Use Row Level Security (RLS) in Supabase
   - Limit API access to necessary operations

3. **File Upload Security**
   - Validate file types and sizes
   - Scan uploaded files for malware
   - Limit upload frequency

## Backup Strategy

1. **Database Backups**
   - Supabase provides automatic backups
   - Export data regularly for additional safety

2. **Code Backups**
   - Use GitHub for version control
   - Tag stable releases
   - Keep deployment configurations

## Scaling Considerations

1. **Database Scaling**
   - Monitor Supabase usage limits
   - Consider database upgrades if needed
   - Implement caching strategies

2. **CDN Usage**
   - Use Vercel's Edge Network
   - Consider additional CDN for global reach

3. **Load Balancing**
   - Vercel handles this automatically
   - Monitor performance metrics
