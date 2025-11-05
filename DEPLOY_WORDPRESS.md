# Hướng Dẫn Deploy Lên WordPress Hosting

## Phương pháp: Upload Static Files vào Thư mục Con

Hướng dẫn này giúp bạn chạy React app trong một thư mục con trên WordPress hosting (ví dụ: `yourdomain.com/app`).

---

## Bước 1: Chuẩn Bị Project

### 1.1. Cài đặt Dependencies

```bash
npm install
```

### 1.2. Cấu hình Environment Variables

Tạo file `.env.production` từ `.env.production.example`:

```bash
cp .env.production.example .env.production
```

Chỉnh sửa `.env.production` với thông tin thực tế:

```env
VITE_SUPABASE_URL=https://oeepmsbttxfknkznbnym.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=oeepmsbttxfknkznbnym
VITE_SITE_URL=https://yourdomain.com/app
VITE_SITE_NAME=Hyliya
```

**LƯU Ý:** Thay đổi `VITE_SITE_URL` thành URL đầy đủ của thư mục con (ví dụ: `https://yourdomain.com/app`)

### 1.3. Cấu hình Base Path trong Vite

Chỉnh sửa `vite.config.ts` để thêm base path:

```typescript
export default defineConfig(({ mode }) => ({
  base: '/app/', // Thay 'app' bằng tên thư mục của bạn
  // ... các cấu hình khác
}));
```

---

## Bước 2: Build Project

Chạy lệnh build để tạo static files:

```bash
npm run build
```

Sau khi build xong, bạn sẽ có thư mục `dist/` chứa tất cả static files.

### Kiểm tra Build Output

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [các file khác]
├── .htaccess
├── robots.txt
├── sitemap.xml
└── [các file khác]
```

---

## Bước 3: Upload Lên WordPress Hosting

### 3.1. Kết nối tới Server

Có 3 cách để upload files:

#### **Cách A: File Manager (Khuyến nghị)**

1. Đăng nhập vào **cPanel** hoặc **Plesk** của hosting
2. Mở **File Manager**
3. Điều hướng tới `public_html/` (hoặc `www/` tùy hosting)
4. Tạo thư mục mới (ví dụ: `app`)

#### **Cách B: FTP/SFTP**

Sử dụng FileZilla hoặc WinSCP:

```
Host: ftp.yourdomain.com hoặc yourdomain.com
Username: [FTP username của bạn]
Password: [FTP password của bạn]
Port: 21 (FTP) hoặc 22 (SFTP)
```

#### **Cách C: SSH (Nếu có quyền truy cập)**

```bash
scp -r dist/* user@yourdomain.com:/path/to/public_html/app/
```

### 3.2. Upload Files

1. Tạo thư mục con trong `public_html/` (ví dụ: `app`)
2. Upload **TẤT CẢ** nội dung trong thư mục `dist/` vào thư mục `app/`

**CẤU TRÚC SAU KHI UPLOAD:**

```
public_html/
├── app/                    ← Thư mục React app của bạn
│   ├── index.html
│   ├── assets/
│   ├── .htaccess          ← QUAN TRỌNG cho routing
│   ├── robots.txt
│   └── sitemap.xml
├── wp-admin/              ← WordPress files
├── wp-content/
├── wp-includes/
└── index.php              ← WordPress index
```

---

## Bước 4: Cấu hình .htaccess

File `.htaccess` trong thư mục `app/` đã được tự động copy từ `public/.htaccess`. Đảm bảo nó có nội dung sau:

```apache
RewriteEngine On
RewriteBase /app/

# Don't rewrite files or directories
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]

# MIME types
AddType application/javascript .js
AddType application/javascript .mjs
AddType application/wasm .wasm
AddType text/css .css
```

**LƯU Ý:** Thay `/app/` bằng tên thư mục thực tế của bạn.

### Kiểm tra Mod_Rewrite

Đảm bảo `mod_rewrite` được bật trên server. Hầu hết WordPress hosting đều đã bật sẵn.

---

## Bước 5: Cấu hình Supabase

### 5.1. Cập nhật Site URL và Redirect URLs

Truy cập **Supabase Dashboard**:

1. Vào **Authentication** → **URL Configuration**
2. Cập nhật:
   - **Site URL**: `https://yourdomain.com/app`
   - **Redirect URLs**: 
     - `https://yourdomain.com/app`
     - `https://yourdomain.com/app/*`

### 5.2. Cập nhật CORS

Vào **API Settings** → **CORS**:

Thêm domain của bạn:
```
https://yourdomain.com
```

---

## Bước 6: Kiểm Tra Deployment

### 6.1. Truy cập App

Mở trình duyệt và truy cập:

```
https://yourdomain.com/app
```

### 6.2. Kiểm tra các tính năng

- ✅ Trang chủ load đúng
- ✅ Routing hoạt động (không bị 404 khi refresh)
- ✅ Authentication hoạt động
- ✅ API calls tới Supabase thành công
- ✅ Static assets (images, CSS, JS) load đúng

### 6.3. Kiểm tra Console

Mở **DevTools** → **Console** và kiểm tra:
- Không có errors về CORS
- Không có 404 errors
- API calls thành công

---

## Bước 7: Troubleshooting

### Vấn đề 1: 404 khi Refresh Trang

**Nguyên nhân:** `.htaccess` không hoạt động

**Giải pháp:**
1. Kiểm tra file `.htaccess` có trong thư mục `app/`
2. Đảm bảo `RewriteBase /app/` đúng với tên thư mục
3. Kiểm tra hosting có bật `mod_rewrite`
4. Liên hệ support hosting để bật `AllowOverride All`

### Vấn đề 2: Static Assets Không Load

**Nguyên nhân:** Base path không đúng

**Giải pháp:**
1. Kiểm tra `base: '/app/'` trong `vite.config.ts`
2. Rebuild project: `npm run build`
3. Upload lại files

### Vấn đề 3: CORS Errors

**Nguyên nhân:** Supabase chưa được cấu hình đúng

**Giải pháp:**
1. Vào Supabase Dashboard → API Settings
2. Thêm domain vào CORS allowed origins
3. Đợi vài phút để cập nhật

### Vấn đề 4: Authentication Không Hoạt Động

**Nguyên nhân:** Redirect URLs không đúng

**Giải pháp:**
1. Vào Supabase → Authentication → URL Configuration
2. Cập nhật Site URL và Redirect URLs
3. Đảm bảo có dấu `/*` ở cuối redirect URL

### Vấn đề 5: WordPress Conflict

**Nguyên nhân:** WordPress rewrite rules xung đột

**Giải pháp:**

Thêm vào `.htaccess` **CỦA WORDPRESS** (trong `public_html/`):

```apache
# Exclude React app folder from WordPress routing
RewriteRule ^app/ - [L]
```

Đặt đoạn này **TRƯỚC** các WordPress rewrite rules.

---

## Bước 8: Cập Nhật Code Sau Này

Khi có thay đổi code:

1. **Pull code mới** (nếu dùng Git)
   ```bash
   git pull
   ```

2. **Rebuild project**
   ```bash
   npm install  # Nếu có dependencies mới
   npm run build
   ```

3. **Upload lại**
   - Xóa nội dung thư mục `app/` trên server
   - Upload lại toàn bộ nội dung từ `dist/`

---

## Bước 9: Tối Ưu (Optional)

### 9.1. Caching

Thêm vào `.htaccess` trong thư mục `app/`:

```apache
# Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>
```

### 9.2. Compression

```apache
# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>
```

---

## Tóm Tắt Quy Trình

1. ✅ Cấu hình `.env.production` với URL đầy đủ
2. ✅ Thêm `base: '/app/'` vào `vite.config.ts`
3. ✅ Build project: `npm run build`
4. ✅ Tạo thư mục `app/` trong `public_html/`
5. ✅ Upload nội dung `dist/` vào `app/`
6. ✅ Kiểm tra `.htaccess` có `RewriteBase /app/`
7. ✅ Cập nhật Supabase URLs
8. ✅ Test app tại `yourdomain.com/app`

---

## Lưu Ý Quan Trọng

- **Không** upload vào thư mục WordPress (`wp-content`, `wp-includes`, etc.)
- **Luôn** giữ `.htaccess` trong thư mục React app
- **Đảm bảo** base path trong Vite config khớp với tên thư mục
- **Cập nhật** Supabase URLs mỗi khi thay đổi domain/path
- **Backup** thường xuyên trước khi cập nhật code

---

## Hỗ Trợ

Nếu gặp vấn đề:

1. Kiểm tra Console errors trong DevTools
2. Kiểm tra Network tab để xem request nào fail
3. Kiểm tra server error logs trong cPanel
4. Liên hệ support hosting nếu vấn đề liên quan server config

---

**Chúc bạn deploy thành công! 🚀**
