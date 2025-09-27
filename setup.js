#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 AliExpress Affiliate Store Setup');
console.log('=====================================\n');

// Check if .env.local already exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file already exists');
  console.log('   If you need to update it, please edit it manually.\n');
} else {
  console.log('📝 Creating .env.local file...');
  
  const envContent = `# Supabase Configuration
# Get these values from https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Instructions:
# 1. Go to https://supabase.com and create a new project
# 2. Go to Settings > API in your Supabase dashboard
# 3. Copy your Project URL and anon/public key
# 4. Replace the values above with your actual credentials
# 5. Run the SQL from supabase-schema.sql in your Supabase SQL editor
# 6. Restart your development server with: npm run dev
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');
  console.log('   Please edit it with your Supabase credentials\n');
}

console.log('📋 Next Steps:');
console.log('1. Create a Supabase project at https://supabase.com');
console.log('2. Get your API credentials from Settings > API');
console.log('3. Update .env.local with your credentials');
console.log('4. Run the SQL from supabase-schema.sql in Supabase SQL editor');
console.log('5. Restart development server: npm run dev');
console.log('6. Test the upload functionality in /admin\n');

console.log('📁 Test Files Available:');
console.log('   - test-products.csv (convert to Excel for testing)');
console.log('   - supabase-schema.sql (database setup)');
console.log('\n🎉 Setup complete! Happy coding!');
