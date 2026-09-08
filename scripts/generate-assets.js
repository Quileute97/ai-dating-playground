import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

// 1. Generate 1200x630 OpenGraph Banner (og-image.jpg)
const ogSvg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090514" />
      <stop offset="50%" stop-color="#180b33" />
      <stop offset="100%" stop-color="#2d0b4e" />
    </linearGradient>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#A855F7" />
      <stop offset="50%" stop-color="#EC4899" />
      <stop offset="100%" stop-color="#F43F5E" />
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.03" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="24" flood-color="#A855F7" flood-opacity="0.5" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgGrad)" />

  <!-- Ambient Glow Circles -->
  <circle cx="200" cy="150" r="300" fill="#7C3AED" opacity="0.25" filter="blur(80px)" />
  <circle cx="1000" cy="450" r="350" fill="#DB2777" opacity="0.2" filter="blur(90px)" />
  <circle cx="600" cy="300" r="250" fill="#9333EA" opacity="0.15" filter="blur(70px)" />

  <!-- Top Brand Pill -->
  <rect x="80" y="80" width="220" height="46" rx="23" fill="url(#cardGrad)" stroke="#A855F7" stroke-width="1.5" stroke-opacity="0.4" />
  <circle cx="106" cy="103" r="8" fill="#EC4899" />
  <text x="126" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="600" fill="#F3E8FF" letter-spacing="1">HYLIYA • DATING AI</text>

  <!-- Big Headline -->
  <text x="80" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="900" fill="#FFFFFF" letter-spacing="-1">
    Hẹn hò AI &amp; Kết nối
  </text>
  <text x="80" y="285" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="900" fill="url(#brandGrad)" letter-spacing="-1">
    Thông minh cho người Việt
  </text>

  <!-- Subtitle -->
  <text x="80" y="360" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400" fill="#D8B4FE">
    Ghép đôi chính xác bằng AI • Chat ẩn danh an toàn • Tìm bạn quanh đây
  </text>

  <!-- Badges Container -->
  <g transform="translate(80, 420)">
    <!-- Badge 1 -->
    <rect x="0" y="0" width="180" height="52" rx="26" fill="url(#cardGrad)" stroke="#ffffff" stroke-opacity="0.15" stroke-width="1" />
    <text x="24" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="600" fill="#FFFFFF">✨ Ghép đôi AI</text>

    <!-- Badge 2 -->
    <rect x="200" y="0" width="200" height="52" rx="26" fill="url(#cardGrad)" stroke="#ffffff" stroke-opacity="0.15" stroke-width="1" />
    <text x="224" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="600" fill="#FFFFFF">💬 Chat Realtime</text>

    <!-- Badge 3 -->
    <rect x="420" y="0" width="180" height="52" rx="26" fill="url(#cardGrad)" stroke="#ffffff" stroke-opacity="0.15" stroke-width="1" />
    <text x="444" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="600" fill="#FFFFFF">📍 Quanh đây</text>

    <!-- Badge 4 -->
    <rect x="620" y="0" width="200" height="52" rx="26" fill="url(#cardGrad)" stroke="#ffffff" stroke-opacity="0.15" stroke-width="1" />
    <text x="644" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="600" fill="#FFFFFF">🔒 Bảo mật RLS</text>
  </g>

  <!-- Right Side Visual Card -->
  <g transform="translate(930, 160)" filter="url(#glow)">
    <rect width="190" height="340" rx="36" fill="url(#cardGrad)" stroke="url(#brandGrad)" stroke-width="2.5" />
    <!-- Avatar circle -->
    <circle cx="95" cy="90" r="50" fill="url(#brandGrad)" />
    <!-- Heart Icon inside avatar -->
    <path d="M95 110s-30-18-30-42c0-13 11-24 24-24 8 0 15 4 19 10 4-6 11-10 19-10 13 0 24 11 24 24 0 24-30 42-30 42z" fill="#FFFFFF" />
    
    <!-- Profile Match indicator -->
    <rect x="25" y="165" width="140" height="32" rx="16" fill="#10B981" fill-opacity="0.2" stroke="#10B981" stroke-width="1" />
    <text x="45" y="186" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#34D399">Tương thích 98%</text>

    <rect x="35" y="220" width="120" height="12" rx="6" fill="#ffffff" fill-opacity="0.7" />
    <rect x="45" y="242" width="100" height="10" rx="5" fill="#ffffff" fill-opacity="0.3" />
    <circle cx="65" cy="285" r="18" fill="#EF4444" fill-opacity="0.3" stroke="#EF4444" stroke-width="1.5" />
    <circle cx="125" cy="285" r="18" fill="#10B981" fill-opacity="0.3" stroke="#10B981" stroke-width="1.5" />
  </g>

  <!-- Bottom URL -->
  <text x="80" y="555" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700" fill="#A855F7" letter-spacing="1.5">
    HTTPS://HYLIYA.COM
  </text>
</svg>
`;

// 2. Generate Favicon SVG (512x512)
const favSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="favGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8B5CF6" />
      <stop offset="50%" stop-color="#EC4899" />
      <stop offset="100%" stop-color="#F43F5E" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#favGrad)" />
  <path d="M256 420s-140-84-140-196c0-62 50-112 112-112 36 0 68 18 88 46 20-28 52-46 88-46 62 0 112 50 112 112 0 112-140 196-140 196z" fill="#FFFFFF" />
  <circle cx="210" cy="260" r="16" fill="#8B5CF6" />
  <circle cx="302" cy="260" r="16" fill="#EC4899" />
</svg>
`;

async function generateAssets() {
  console.log('Generating high-resolution SEO and branding assets...');

  // 1. og-image.jpg (1200x630)
  await sharp(Buffer.from(ogSvg))
    .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
    .toFile(path.join(publicDir, 'og-image.jpg'));
  console.log('✅ Created public/og-image.jpg (1200x630)');

  // 2. favicon.png (192x192)
  await sharp(Buffer.from(favSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('✅ Created public/favicon.png (192x192)');

  // 3. apple-touch-icon.png (180x180)
  await sharp(Buffer.from(favSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✅ Created public/apple-touch-icon.png (180x180)');

  // 4. Save favicon.svg
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), favSvg.trim());
  console.log('✅ Created public/favicon.svg');
}

generateAssets().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
