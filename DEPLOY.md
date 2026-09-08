# 🚀 HƯỚNG DẪN DEPLOY HYLIYA LÊN CYBERPANEL

## 📋 YÊU CẦU

- ✅ VPS đã cài CyberPanel (Apache/OpenLiteSpeed/Nginx)
- ✅ Domain đã trỏ về IP của VPS
- ✅ Node.js 18+ trên máy local (để build)
- ✅ Supabase project đang hoạt động

---

## 🔧 BƯỚC 1: BUILD PROJECT

### 1.1. Chuẩn bị môi trường

```bash
# Clone hoặc download source code về máy
cd /path/to/hyliya

# Cài đặt dependencies
npm install
```

### 1.2. Cấu hình production environment

```bash
# Copy file .env.production.example thành .env.production
cp .env.production.example .env.production

# Chỉnh sửa .env.production với thông tin thực
nano .env.production
```

### 1.3. Build project

```bash
# Build cho production
npm run build

# Kết quả: thư mục dist/ chứa toàn bộ static files
```

### 1.4. Kiểm tra build

```bash
# Nên có các file sau trong dist/:
# - index.html
# - assets/ (CSS, JS, images)
# - robots.txt
# - sitemap.xml
# - .htaccess
# - favicon.ico
```

---

## 🌐 BƯỚC 2: CẤU HÌNH DNS

Trỏ domain về IP của VPS CyberPanel:

```
Type: A
Name: @
Value: [IP VPS của bạn]
TTL: 3600

Type: A
Name: www
Value: [IP VPS của bạn]
TTL: 3600
```

**Kiểm tra DNS:**
```bash
# Trên máy local
nslookup hyliya.com
dig hyliya.com
```

---

## 🖥️ BƯỚC 3: TẠO WEBSITE TRÊN CYBERPANEL

### 3.1. Đăng nhập CyberPanel

```
URL: https://[IP-VPS]:8090
Username: admin
Password: [password của bạn]
```

### 3.2. Tạo website mới

1. **Vào**: Websites → Create Website
2. **Điền thông tin:**
   - Domain Name: `hyliya.com`
   - Email: `admin@hyliya.com`
   - Package: chọn package phù hợp
   - PHP: **Select None** (không cần PHP cho React)
   - SSL: ✅ **Tích chọn**
3. **Create Website**

### 3.3. Thêm subdomain www (nếu cần)

1. **Vào**: Websites → List Websites
2. **Chọn**: hyliya.com
3. **Child Domains** → Create Child Domain
4. **Domain**: `www.hyliya.com`

---

## 📦 BƯỚC 4: UPLOAD FILES

### Phương án A: Upload qua File Manager (Khuyến nghị)

1. **Vào**: File Manager → hyliya.com → public_html
2. **Xóa tất cả file mặc định** (index.html cũ)
3. **Nén thư mục dist/ trên máy local:**
   ```bash
   cd dist
   zip -r hyliya-build.zip *
   ```
4. **Upload file hyliya-build.zip** lên public_html/
5. **Extract trực tiếp trên server** (nút Extract trong File Manager)

### Phương án B: Upload qua FTP/SFTP

```bash
# Sử dụng FileZilla hoặc SCP
scp -r dist/* root@[IP-VPS]:/home/hyliya.com/public_html/
```

### 4.1. Kiểm tra cấu trúc thư mục

Sau khi upload, cấu trúc phải như sau:

```
/home/hyliya.com/public_html/
├── index.html                 # Trang chủ (Prerendered SSG)
├── gioi-thieu/index.html       # Trang Giới thiệu (Prerendered SSG)
├── huong-dan/index.html        # Trang Hướng dẫn (Prerendered SSG)
├── faq/index.html              # Trang FAQ (Prerendered SSG)
├── dieu-khoan/index.html       # Trang Điều khoản (Prerendered SSG)
├── chinh-sach-bao-mat/index.html # Trang Chính sách (Prerendered SSG)
├── dating/index.html           # Trang Hẹn hò AI (Prerendered SSG)
├── chat/index.html             # Trang Chat người lạ (Prerendered SSG)
├── nearby/index.html           # Trang Quanh đây (Prerendered SSG)
├── timeline/index.html         # Trang Timeline (Prerendered SSG)
├── assets/
│   ├── index-xxxxx.js
│   ├── index-xxxxx.css
│   └── ...
├── .htaccess
├── robots.txt
├── sitemap.xml
├── og-image.jpg                # Chuẩn 1200x630px Open Graph
├── favicon.svg / favicon.png / favicon.ico
└── ...
```

✨ **Lợi ích SEO vượt trội**: Nhờ quy trình SSG tự động, mỗi URL trên server đều có file `index.html` tĩnh với mã hash (md5sum), thẻ meta và nội dung semantic độc lập. Web server sẽ trả về nội dung hoàn chỉnh ngay lập tức cho Googlebot và bot mạng xã hội mà không cần phụ thuộc vào client JavaScript.

⚠️ **QUAN TRỌNG**: Toàn bộ nội dung trong thư mục `dist/` phải được upload trực tiếp vào `public_html/`!

---

## ⚙️ BƯỚC 5: CẤU HÌNH REWRITE RULES

### Với Apache/OpenLiteSpeed (Mặc định)

File `.htaccess` đã được tự động copy khi build. Kiểm tra:

```bash
# Vào File Manager, kiểm tra file:
/home/hyliya.com/public_html/.htaccess

# Hoặc qua SSH:
cat /home/hyliya.com/public_html/.htaccess
```

### Với Nginx

1. **Vào**: Websites → List Websites → hyliya.com → vHost Conf Files
2. **Chỉnh sửa** file cấu hình Nginx
3. **Copy nội dung** từ file `nginx.conf.example` trong source code
4. **Save Changes**
5. **Restart Nginx:**
   ```bash
   systemctl restart nginx
   ```

---

## 🔒 BƯỚC 6: CÀI ĐẶT SSL

### 6.1. Issue SSL Certificate (Let's Encrypt)

1. **Vào**: SSL → Manage SSL
2. **Chọn domain**: hyliya.com
3. **Tích chọn**: ✅ www.hyliya.com (nếu có)
4. **Issue SSL**
5. **Đợi 1-2 phút** để SSL được cấp

### 6.2. Force HTTPS Redirect

File `.htaccess` đã có sẵn rule redirect HTTP → HTTPS.

**Kiểm tra:**
```bash
curl -I http://hyliya.com
# Phải trả về: HTTP/1.1 301 Moved Permanently
# Location: https://hyliya.com
```

---

## 🔗 BƯỚC 7: CẤU HÌNH SUPABASE

### 7.1. Cập nhật Site URL

1. **Vào**: Supabase Dashboard → Authentication → URL Configuration
2. **Site URL**: `https://hyliya.com`
3. **Save**

### 7.2. Cập nhật Redirect URLs

Thêm các URL sau vào **Redirect URLs**:

```
https://hyliya.com
https://hyliya.com/**
https://www.hyliya.com
https://www.hyliya.com/**
```

### 7.3. Cập nhật CORS

1. **Vào**: Settings → API → CORS Configuration
2. **Thêm allowed origins:**
   ```
   https://hyliya.com
   https://www.hyliya.com
   ```
3. **Save**

---

## ✅ BƯỚC 8: KIỂM TRA & TEST

### 8.1. Checklist cơ bản

- [ ] Website load thành công: `https://hyliya.com`
- [ ] HTTPS hoạt động (có ổ khóa xanh)
- [ ] www redirect về non-www (hoặc ngược lại)
- [ ] React Router hoạt động (F5 không bị 404)
- [ ] Robots.txt accessible: `https://hyliya.com/robots.txt`
- [ ] Sitemap accessible: `https://hyliya.com/sitemap.xml`

### 8.2. Test các tính năng

```bash
# 1. Test authentication
✅ Đăng ký tài khoản mới
✅ Đăng nhập
✅ Google Sign-in
✅ Đăng xuất

# 2. Test storage
✅ Upload avatar
✅ Upload ảnh timeline
✅ Upload album

# 3. Test features
✅ Đăng bài timeline
✅ Like/comment
✅ Chat với người lạ
✅ Dating swipe
✅ Nearby search

# 4. Test payment
✅ Mua gói premium
✅ PayOS redirect
✅ Webhook callback
```

### 8.3. Kiểm tra Console Logs

Mở DevTools (F12) → Console:
- ❌ Không có lỗi CORS
- ❌ Không có lỗi 404
- ❌ Không có lỗi kết nối Supabase

### 8.4. Kiểm tra Network

Mở DevTools → Network:
- ✅ API calls đến Supabase thành công (200 OK)
- ✅ Edge Functions hoạt động
- ✅ Upload files thành công

---

## 🚨 TROUBLESHOOTING

### ❌ Lỗi 404 khi F5 trên route khác homepage

**Nguyên nhân:** Rewrite rules chưa hoạt động

**Giải pháp:**
```bash
# 1. Kiểm tra .htaccess có trong public_html/
ls -la /home/hyliya.com/public_html/.htaccess

# 2. Kiểm tra mod_rewrite đã enable (Apache)
sudo a2enmod rewrite
sudo systemctl restart apache2

# 3. Kiểm tra AllowOverride (trong vhost config)
# Phải là: AllowOverride All
```

### ❌ Lỗi CORS

**Nguyên nhân:** Domain chưa được thêm vào Supabase CORS

**Giải pháp:**
1. Vào Supabase → Settings → API
2. Thêm `https://hyliya.com` vào allowed origins
3. Clear browser cache và thử lại

### ❌ Google Sign-in không hoạt động

**Nguyên nhân:** Redirect URLs chưa đúng

**Giải pháp:**
1. Vào Supabase → Authentication → URL Configuration
2. Thêm: `https://hyliya.com/**` vào Redirect URLs
3. Vào Google Cloud Console → OAuth 2.0 Client IDs
4. Thêm `https://hyliya.com` vào Authorized redirect URIs

### ❌ PayOS webhook không hoạt động

**Nguyên nhân:** Webhook URL chưa đúng

**Giải pháp:**
1. Vào PayOS Dashboard
2. Cập nhật webhook URL:
   ```
   https://oeepmsbttxfknkznbnym.supabase.co/functions/v1/payos-webhook
   ```
3. **KHÔNG DÙNG:** `https://hyliya.com/api/payos-webhook`

### ❌ Assets (CSS/JS) không load

**Nguyên nhân:** Base path không đúng

**Giải pháp:**
1. Kiểm tra file index.html trong dist/
2. Đảm bảo assets path bắt đầu bằng `/` (absolute path)
3. Rebuild nếu cần

---

## 📊 MONITORING & MAINTENANCE

### Theo dõi logs

```bash
# Apache logs
tail -f /home/hyliya.com/logs/access.log
tail -f /home/hyliya.com/logs/error.log

# Nginx logs
tail -f /var/log/nginx/hyliya.com.access.log
tail -f /var/log/nginx/hyliya.com.error.log
```

### Theo dõi Supabase

1. **Database Usage**: Supabase Dashboard → Database
2. **Edge Functions Logs**: Supabase Dashboard → Edge Functions → Logs
3. **Auth Logs**: Supabase Dashboard → Authentication → Logs

### Backup

```bash
# Backup files
cd /home
tar -czf hyliya-backup-$(date +%Y%m%d).tar.gz hyliya.com/

# Backup database (từ Supabase Dashboard)
# Settings → Database → Backups
```

---

## 🔄 CẬP NHẬT CODE MỚI

Khi có thay đổi code:

```bash
# 1. Pull code mới
git pull origin main

# 2. Build lại
npm run build

# 3. Upload dist/ mới lên server (ghi đè)
# Dùng File Manager hoặc SCP

# 4. Clear cache
# Thường không cần restart vì static files
```

---

## 📞 HỖ TRỢ

- **CyberPanel Docs**: https://cyberpanel.net/docs/
- **Supabase Docs**: https://supabase.com/docs
- **Vite Deployment**: https://vitejs.dev/guide/static-deploy.html

---

## ✨ KIẾN TRÚC SAU KHI DEPLOY

```
[User Browser]
      ↓
[hyliya.com - CyberPanel VPS]
      ↓ (Static Files: HTML, CSS, JS)
[User's Browser executes React]
      ↓ (API Calls)
[Supabase Cloud]
      ├── Database (PostgreSQL)
      ├── Authentication
      ├── Storage (Avatars, Images)
      └── Edge Functions
            ├── create-payos-payment
            ├── check-payment-status
            ├── payos-webhook
            └── ai-chat-proxy
```

---

**🎉 CHÚC BẠN DEPLOY THÀNH CÔNG!**
