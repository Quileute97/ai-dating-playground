import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

const baseUrl = 'https://hyliya.com';

const routes = [
  {
    path: '/',
    title: 'Hyliya - Hẹn hò AI & kết nối thông minh cho người Việt',
    description: 'Hyliya là ứng dụng hẹn hò AI cho người Việt với ghép đôi thông minh, chat an toàn, tìm bạn quanh đây và timeline chia sẻ khoảnh khắc.',
    keywords: 'hẹn hò AI, app hẹn hò Việt Nam, chat với người lạ, ghép đôi thông minh, tìm bạn quanh đây, ứng dụng hẹn hò online, Hyliya',
    url: `${baseUrl}/`,
    changefreq: 'daily',
    priority: '1.0',
    breadcrumbs: [
      { name: 'Trang chủ', url: `${baseUrl}/` }
    ],
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${baseUrl}/#org`,
        name: 'Hyliya',
        url: `${baseUrl}/`,
        logo: `${baseUrl}/favicon.png`,
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'support@hyliya.com',
          contactType: 'customer support',
          areaServed: 'VN',
          availableLanguage: ['Vietnamese']
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: `${baseUrl}/`,
        name: 'Hyliya',
        publisher: { '@id': `${baseUrl}/#org` },
        inLanguage: 'vi-VN',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}/?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Hyliya',
        url: `${baseUrl}/`,
        description: 'Ứng dụng hẹn hò AI cho người Việt: ghép đôi thông minh, chat với người lạ, tìm bạn quanh đây.',
        applicationCategory: 'SocialNetworkingApplication',
        operatingSystem: 'Web, Android, iOS',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'VND' },
        featureList: [
          'Ghép đôi bằng AI thông minh',
          'Chat với người lạ ẩn danh an toàn',
          'Tìm bạn quanh đây theo bán kính vị trí',
          'Timeline cộng đồng chia sẻ khoảnh khắc',
          'Sao donate ủng hộ kết nối yêu thích'
        ]
      }
    ],
    htmlContent: `
      <header class="py-8 px-4 text-center bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
        <h1 class="text-3xl md:text-5xl font-bold mb-4">Hyliya - Hẹn hò AI & kết nối thông minh cho người Việt</h1>
        <p class="max-w-2xl mx-auto text-lg text-purple-200">
          Ghép đôi thông minh bằng AI, chat với người lạ an toàn, tìm bạn quanh đây và chia sẻ khoảnh khắc trên timeline - ứng dụng hẹn hò thuần Việt, miễn phí và bảo mật hàng đầu.
        </p>
      </header>
      <nav aria-label="Điều hướng chính" class="bg-slate-900 text-white py-3 px-6 text-center">
        <ul class="flex flex-wrap justify-center gap-6 text-sm font-medium">
          <li><a href="/dating" class="hover:text-purple-400">Hẹn hò AI</a></li>
          <li><a href="/chat" class="hover:text-purple-400">Chat với người lạ</a></li>
          <li><a href="/nearby" class="hover:text-purple-400">Tìm bạn quanh đây</a></li>
          <li><a href="/timeline" class="hover:text-purple-400">Timeline cộng đồng</a></li>
          <li><a href="/gioi-thieu" class="hover:text-purple-400">Giới thiệu</a></li>
          <li><a href="/huong-dan" class="hover:text-purple-400">Hướng dẫn</a></li>
          <li><a href="/faq" class="hover:text-purple-400">Câu hỏi thường gặp</a></li>
        </ul>
      </nav>
      <main class="max-w-5xl mx-auto px-5 py-12">
        <section class="mb-12">
          <h2 class="text-2xl font-bold text-slate-900 mb-6 text-center">Tính năng đột phá của Hyliya</h2>
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="p-6 border rounded-xl shadow-sm bg-white">
              <h3 class="font-bold text-lg text-purple-600 mb-2">✨ Ghép đôi AI</h3>
              <p class="text-slate-600 text-sm">Thuật toán trí tuệ nhân tạo phân tích sở thích, tính cách và độ tuổi để đề xuất người phù hợp nhất.</p>
            </div>
            <div class="p-6 border rounded-xl shadow-sm bg-white">
              <h3 class="font-bold text-lg text-purple-600 mb-2">💬 Chat ngẫu nhiên</h3>
              <p class="text-slate-600 text-sm">Trò chuyện tức thì với người lạ ẩn danh, thoải mái chia sẻ không lo lộ thông tin cá nhân.</p>
            </div>
            <div class="p-6 border rounded-xl shadow-sm bg-white">
              <h3 class="font-bold text-lg text-purple-600 mb-2">📍 Quanh đây</h3>
              <p class="text-slate-600 text-sm">Khám phá những người dùng ở gần bạn theo bán kính vị trí thực tế, dễ dàng kết bạn gần nhà.</p>
            </div>
            <div class="p-6 border rounded-xl shadow-sm bg-white">
              <h3 class="font-bold text-lg text-purple-600 mb-2">📸 Timeline</h3>
              <p class="text-slate-600 text-sm">Đăng ảnh, cảm xúc và tương tác cùng cộng đồng độc thân sôi động mỗi ngày.</p>
            </div>
          </div>
        </section>
        <section class="mb-12 bg-purple-50 p-8 rounded-2xl">
          <h2 class="text-2xl font-bold text-purple-950 mb-4">Vì sao người Việt chọn Hyliya?</h2>
          <ul class="space-y-3 text-slate-700">
            <li><strong>✓ Bảo mật &amp; An toàn:</strong> Dữ liệu mã hóa HTTPS, kiểm duyệt ngôn ngữ tiếng Việt 24/7 và xác thực tài khoản.</li>
            <li><strong>✓ Thuần Việt 100%:</strong> Giao diện tối ưu theo văn hóa giao tiếp và thói quen hẹn hò của giới trẻ Việt Nam.</li>
            <li><strong>✓ Thanh toán nội địa tiện lợi:</strong> Tích hợp cổng thanh toán PayOS qua QR ngân hàng chuyển khoản tiện lợi.</li>
          </ul>
        </section>
      </main>
      <footer class="bg-slate-900 text-slate-400 py-8 px-5 text-center text-sm border-t border-slate-800">
        <p class="mb-3 space-x-4">
          <a href="/gioi-thieu" class="hover:text-white">Giới thiệu</a> · 
          <a href="/huong-dan" class="hover:text-white">Hướng dẫn</a> · 
          <a href="/faq" class="hover:text-white">FAQ</a> · 
          <a href="/dieu-khoan" class="hover:text-white">Điều khoản</a> · 
          <a href="/chinh-sach-bao-mat" class="hover:text-white">Chính sách bảo mật</a>
        </p>
        <p>© 2026 Hyliya - Ứng dụng hẹn hò AI & kết nối thông minh cho người Việt.</p>
      </footer>
    `
  },
  {
    path: '/gioi-thieu',
    title: 'Giới thiệu về Hyliya - Ứng dụng hẹn hò AI Việt Nam',
    description: 'Hyliya là ứng dụng hẹn hò và kết nối thông minh tích hợp AI dành cho người Việt: chat realtime, tìm bạn quanh đây, ghép đôi phù hợp và timeline chia sẻ cảm xúc.',
    keywords: 'giới thiệu Hyliya, app hẹn hò AI Việt Nam, ứng dụng kết nối thông minh, hẹn hò online, chat AI',
    url: `${baseUrl}/gioi-thieu`,
    changefreq: 'monthly',
    priority: '0.7',
    breadcrumbs: [
      { name: 'Trang chủ', url: `${baseUrl}/` },
      { name: 'Giới thiệu', url: `${baseUrl}/gioi-thieu` }
    ],
    schemas: [],
    htmlContent: `
      <main class="max-w-3xl mx-auto px-5 py-10 prose prose-slate">
        <nav class="text-sm text-slate-500 mb-4" aria-label="Breadcrumb">
          <a href="/" class="hover:underline text-purple-600">Trang chủ</a> / <span>Giới thiệu</span>
        </nav>
        <h1 class="text-3xl font-bold mb-4 text-slate-900">Giới thiệu về Hyliya</h1>
        <p class="text-slate-700 leading-relaxed">
          <strong>Hyliya</strong> là nền tảng hẹn hò và kết nối xã hội thế hệ mới cho người Việt Nam, được thiết kế xoay quanh ba trụ cột: <em>ghép đôi thông minh bằng AI</em>, <em>chat realtime an toàn</em> và <em>khám phá người quanh đây</em>. Chúng tôi tin rằng công nghệ có thể giúp mọi người tìm thấy những kết nối thật sự ý nghĩa — không chỉ những lượt quẹt vô nghĩa.
        </p>
        <h2 class="text-2xl font-semibold mt-8 mb-3 text-slate-900">Sứ mệnh</h2>
        <p class="text-slate-700 leading-relaxed">
          Xây dựng một cộng đồng hẹn hò lành mạnh, tôn trọng và ưu tiên trải nghiệm người dùng Việt Nam. Hyliya kết hợp AI để hiểu sở thích, tính cách và mục tiêu tình cảm của bạn nhằm đưa ra gợi ý phù hợp thay vì hiển thị ngẫu nhiên.
        </p>
        <h2 class="text-2xl font-semibold mt-8 mb-3 text-slate-900">Tính năng nổi bật</h2>
        <ul class="list-disc pl-6 space-y-2 text-slate-700">
          <li><strong>Hẹn hò AI:</strong> Ghép đôi dựa trên hồ sơ, sở thích và mức độ tương thích.</li>
          <li><strong>Chat với người lạ:</strong> Trò chuyện ẩn danh an toàn, có hệ thống báo cáo.</li>
          <li><strong>Quanh đây:</strong> Tìm bạn cùng khu vực theo bán kính bạn chọn.</li>
          <li><strong>Timeline:</strong> Chia sẻ khoảnh khắc, hình ảnh và cảm xúc hằng ngày.</li>
          <li><strong>Sao donate:</strong> Ủng hộ người bạn quý mến bằng ngôi sao ảo.</li>
        </ul>
        <h2 class="text-2xl font-semibold mt-8 mb-3 text-slate-900">Vì sao chọn Hyliya?</h2>
        <p class="text-slate-700 leading-relaxed">
          Khác với các ứng dụng hẹn hò quốc tế, Hyliya được bản địa hoá hoàn toàn cho thị trường Việt Nam: hỗ trợ tiếng Việt tự nhiên, tích hợp thanh toán nội địa (PayOS), đội ngũ kiểm duyệt hiểu văn hoá địa phương và cộng đồng người dùng thật.
        </p>
        <p class="mt-8">
          <a href="/" class="text-purple-600 hover:underline font-medium">← Quay về trang chủ</a>
        </p>
      </main>
    `
  },
  {
    path: '/huong-dan',
    title: 'Hướng dẫn sử dụng Hyliya - Cách hẹn hò online an toàn',
    description: 'Hướng dẫn từng bước sử dụng Hyliya: tạo hồ sơ hấp dẫn, chat với người lạ an toàn, tìm bạn quanh đây và sử dụng tính năng ghép đôi AI hiệu quả.',
    keywords: 'hướng dẫn Hyliya, cách dùng app hẹn hò, mẹo hẹn hò online, tips ghép đôi AI',
    url: `${baseUrl}/huong-dan`,
    changefreq: 'monthly',
    priority: '0.7',
    breadcrumbs: [
      { name: 'Trang chủ', url: `${baseUrl}/` },
      { name: 'Hướng dẫn', url: `${baseUrl}/huong-dan` }
    ],
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'Cách sử dụng ứng dụng hẹn hò Hyliya',
        description: 'Hướng dẫn từng bước tạo hồ sơ, ghép đôi bằng AI và kết nối an toàn trên Hyliya.',
        step: [
          {
            '@type': 'HowToStep',
            name: 'Bước 1: Tạo hồ sơ hấp dẫn',
            text: 'Đăng tải ảnh rõ mặt, viết tiểu sử ngắn 2-3 câu về sở thích và mục tiêu tình cảm.'
          },
          {
            '@type': 'HowToStep',
            name: 'Bước 2: Khám phá & ghép đôi',
            text: 'Vào tab Hẹn hò để xem các gợi ý AI. Quẹt phải nếu thích, quẹt trái để bỏ qua.'
          },
          {
            '@type': 'HowToStep',
            name: 'Bước 3: Chat & gặp gỡ',
            text: 'Sử dụng tab Tin nhắn hoặc Chat ngẫu nhiên để trò chuyện an toàn.'
          },
          {
            '@type': 'HowToStep',
            name: 'Bước 4: Tìm bạn quanh đây',
            text: 'Bật vị trí và mở tab Quanh đây để xem người dùng gần bạn theo bán kính tuỳ chọn.'
          }
        ]
      }
    ],
    htmlContent: `
      <main class="max-w-3xl mx-auto px-5 py-10 prose prose-slate">
        <nav class="text-sm text-slate-500 mb-4" aria-label="Breadcrumb">
          <a href="/" class="hover:underline text-purple-600">Trang chủ</a> / <span>Hướng dẫn</span>
        </nav>
        <h1 class="text-3xl font-bold mb-4 text-slate-900">Hướng dẫn sử dụng Hyliya</h1>
        
        <h2 class="text-2xl font-semibold mt-6 mb-2 text-slate-900">Bước 1: Tạo hồ sơ hấp dẫn</h2>
        <p class="text-slate-700 leading-relaxed">
          Đăng tải ảnh rõ mặt, viết tiểu sử ngắn 2-3 câu về sở thích và mục tiêu tình cảm. Hồ sơ càng đầy đủ, AI càng ghép đôi chính xác và tỉ lệ match thành công càng cao.
        </p>

        <h2 class="text-2xl font-semibold mt-6 mb-2 text-slate-900">Bước 2: Khám phá &amp; ghép đôi</h2>
        <p class="text-slate-700 leading-relaxed">
          Vào tab <a href="/dating" class="text-purple-600 hover:underline">Hẹn hò</a> để xem các gợi ý AI thông minh. Quẹt phải nếu bạn có cảm tình, quẹt trái để bỏ qua. Khi hai người cùng thích nhau, hệ thống sẽ tự động tạo cuộc trò chuyện riêng tư.
        </p>

        <h2 class="text-2xl font-semibold mt-6 mb-2 text-slate-900">Bước 3: Chat &amp; gặp gỡ</h2>
        <p class="text-slate-700 leading-relaxed">
          Sử dụng tab <a href="/messages" class="text-purple-600 hover:underline">Tin nhắn</a> để trao đổi trực tiếp. Với trải nghiệm muốn thử thách ngẫu nhiên, hãy khám phá tab <a href="/chat" class="text-purple-600 hover:underline">Chat ngẫu nhiên</a>.
        </p>

        <h2 class="text-2xl font-semibold mt-6 mb-2 text-slate-900">Bước 4: Tìm bạn quanh đây</h2>
        <p class="text-slate-700 leading-relaxed">
          Bật tính năng chia sẻ vị trí và mở tab <a href="/nearby" class="text-purple-600 hover:underline">Quanh đây</a> để xem những người dùng đang ở gần bạn theo bán kính tùy chọn từ 1km đến 50km.
        </p>

        <h2 class="text-2xl font-semibold mt-6 mb-2 text-slate-900">Mẹo hẹn hò an toàn</h2>
        <ul class="list-disc pl-6 space-y-1 text-slate-700">
          <li>Không chia sẻ thông tin tài chính, số tài khoản ngân hàng hoặc mật khẩu.</li>
          <li>Gặp mặt lần đầu ở nơi công cộng, đông người vào ban ngày.</li>
          <li>Báo cáo tài khoản đáng ngờ ngay lập tức qua nút Báo cáo/Report trên hồ sơ.</li>
        </ul>

        <p class="mt-8">
          <a href="/" class="text-purple-600 hover:underline font-medium">← Quay về trang chủ</a>
        </p>
      </main>
    `
  },
  {
    path: '/faq',
    title: 'Câu hỏi thường gặp - Hyliya FAQ',
    description: 'Giải đáp các câu hỏi thường gặp về ứng dụng hẹn hò Hyliya: bảo mật, AI ghép đôi, chat ngẫu nhiên, gói Premium và cách xoá tài khoản.',
    keywords: 'FAQ Hyliya, câu hỏi thường gặp, hỗ trợ Hyliya, an toàn hẹn hò',
    url: `${baseUrl}/faq`,
    changefreq: 'monthly',
    priority: '0.7',
    breadcrumbs: [
      { name: 'Trang chủ', url: `${baseUrl}/` },
      { name: 'FAQ', url: `${baseUrl}/faq` }
    ],
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Hyliya có miễn phí không?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Hyliya miễn phí các tính năng cơ bản: tạo hồ sơ, ghép đôi, chat. Gói Premium mở khoá các đặc quyền như xem ai đã thích bạn, lượt like không giới hạn.'
            }
          },
          {
            '@type': 'Question',
            name: 'Ứng dụng có an toàn cho người Việt Nam không?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Có. Hyliya có đội ngũ kiểm duyệt tiếng Việt, hệ thống báo cáo/khoá tài khoản, và mã hoá dữ liệu theo chuẩn HTTPS + Row Level Security.'
            }
          },
          {
            '@type': 'Question',
            name: 'AI của Hyliya hoạt động ra sao?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'AI phân tích hồ sơ, sở thích, độ tuổi, vị trí và hành vi tương tác để đề xuất người có mức tương thích cao nhất, giúp giảm thời gian tìm kiếm.'
            }
          },
          {
            '@type': 'Question',
            name: 'Tôi có thể xoá tài khoản không?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Có. Vào Cài đặt → Tài khoản → Xoá vĩnh viễn. Toàn bộ dữ liệu cá nhân sẽ bị xoá khỏi hệ thống trong 30 ngày.'
            }
          },
          {
            '@type': 'Question',
            name: 'Chat ngẫu nhiên có ẩn danh không?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Chat với người lạ hiển thị nickname bạn chọn, không lộ số điện thoại hay email. Bạn có thể ngắt kết nối bất cứ lúc nào.'
            }
          }
        ]
      }
    ],
    htmlContent: `
      <main class="max-w-3xl mx-auto px-5 py-10">
        <nav class="text-sm text-slate-500 mb-4" aria-label="Breadcrumb">
          <a href="/" class="hover:underline text-purple-600">Trang chủ</a> / <span>FAQ</span>
        </nav>
        <h1 class="text-3xl font-bold mb-6 text-slate-900">Câu hỏi thường gặp</h1>
        <div class="space-y-6">
          <article class="border-b pb-4">
            <h2 class="text-lg font-semibold mb-2 text-slate-900">Hyliya có miễn phí không?</h2>
            <p class="text-slate-700">Hyliya miễn phí các tính năng cơ bản: tạo hồ sơ, ghép đôi, chat. Gói Premium mở khoá các đặc quyền như xem ai đã thích bạn, lượt like không giới hạn.</p>
          </article>
          <article class="border-b pb-4">
            <h2 class="text-lg font-semibold mb-2 text-slate-900">Ứng dụng có an toàn cho người Việt Nam không?</h2>
            <p class="text-slate-700">Có. Hyliya có đội ngũ kiểm duyệt tiếng Việt, hệ thống báo cáo/khoá tài khoản, và mã hoá dữ liệu theo chuẩn HTTPS + Row Level Security.</p>
          </article>
          <article class="border-b pb-4">
            <h2 class="text-lg font-semibold mb-2 text-slate-900">AI của Hyliya hoạt động ra sao?</h2>
            <p class="text-slate-700">AI phân tích hồ sơ, sở thích, độ tuổi, vị trí và hành vi tương tác để đề xuất người có mức tương thích cao nhất, giúp giảm thời gian tìm kiếm.</p>
          </article>
          <article class="border-b pb-4">
            <h2 class="text-lg font-semibold mb-2 text-slate-900">Tôi có thể xoá tài khoản không?</h2>
            <p class="text-slate-700">Có. Vào Cài đặt → Tài khoản → Xoá vĩnh viễn. Toàn bộ dữ liệu cá nhân sẽ bị xoá khỏi hệ thống trong 30 ngày.</p>
          </article>
          <article class="border-b pb-4">
            <h2 class="text-lg font-semibold mb-2 text-slate-900">Chat ngẫu nhiên có ẩn danh không?</h2>
            <p class="text-slate-700">Chat với người lạ hiển thị nickname bạn chọn, không lộ số điện thoại hay email. Bạn có thể ngắt kết nối bất cứ lúc nào.</p>
          </article>
        </div>
        <p class="mt-8">
          <a href="/" class="text-purple-600 hover:underline font-medium">← Quay về trang chủ</a>
        </p>
      </main>
    `
  },
  {
    path: '/dieu-khoan',
    title: 'Điều khoản sử dụng - Hyliya',
    description: 'Điều khoản và điều kiện sử dụng ứng dụng hẹn hò Hyliya. Quy tắc cộng đồng, quyền và nghĩa vụ của người dùng khi tham gia Hyliya.',
    keywords: 'điều khoản sử dụng Hyliya, terms of service, quy định người dùng',
    url: `${baseUrl}/dieu-khoan`,
    changefreq: 'yearly',
    priority: '0.4',
    breadcrumbs: [
      { name: 'Trang chủ', url: `${baseUrl}/` },
      { name: 'Điều khoản sử dụng', url: `${baseUrl}/dieu-khoan` }
    ],
    schemas: [],
    htmlContent: `
      <main class="max-w-3xl mx-auto px-5 py-10 prose prose-slate">
        <nav class="text-sm text-slate-500 mb-4" aria-label="Breadcrumb">
          <a href="/" class="hover:underline text-purple-600">Trang chủ</a> / <span>Điều khoản sử dụng</span>
        </nav>
        <h1 class="text-3xl font-bold mb-4 text-slate-900">Điều khoản sử dụng</h1>
        
        <h2 class="text-2xl font-semibold mt-6 mb-2 text-slate-900">1. Độ tuổi</h2>
        <p class="text-slate-700 leading-relaxed">Người dùng Hyliya phải đủ 18 tuổi trở lên. Chúng tôi có quyền khoá tài khoản không tuân thủ quy định độ tuổi.</p>
        
        <h2 class="text-2xl font-semibold mt-6 mb-2 text-slate-900">2. Hành vi cấm</h2>
        <ul class="list-disc pl-6 space-y-1 text-slate-700">
          <li>Quấy rối, đe doạ, phát tán nội dung nhạy cảm hoặc vi phạm pháp luật.</li>
          <li>Lừa đảo, mạo danh cá nhân, tổ chức hoặc giả mạo hồ sơ.</li>
          <li>Spam, quảng cáo trái phép, thu thập dữ liệu người dùng khác mà không được đồng ý.</li>
        </ul>

        <h2 class="text-2xl font-semibold mt-6 mb-2 text-slate-900">3. Thanh toán &amp; Dịch vụ</h2>
        <p class="text-slate-700 leading-relaxed">Các giao dịch mua Sao donate và gói dịch vụ Premium được xử lý an toàn qua cổng PayOS. Yêu cầu hoàn tiền được tiếp nhận và xem xét trong vòng 7 ngày kể từ khi thực hiện giao dịch.</p>

        <h2 class="text-2xl font-semibold mt-6 mb-2 text-slate-900">4. Chấm dứt dịch vụ</h2>
        <p class="text-slate-700 leading-relaxed">Hyliya có toàn quyền tạm ngưng hoặc chấm dứt vĩnh viễn quyền truy cập của tài khoản vi phạm các quy tắc cộng đồng mà không cần báo trước.</p>

        <p class="mt-8">
          <a href="/" class="text-purple-600 hover:underline font-medium">← Quay về trang chủ</a>
        </p>
      </main>
    `
  },
  {
    path: '/chinh-sach-bao-mat',
    title: 'Chính sách bảo mật - Hyliya',
    description: 'Chính sách bảo mật của Hyliya: cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu người dùng trên ứng dụng hẹn hò và kết nối Hyliya.',
    keywords: 'chính sách bảo mật Hyliya, privacy policy, bảo vệ dữ liệu, hẹn hò an toàn',
    url: `${baseUrl}/chinh-sach-bao-mat`,
    changefreq: 'yearly',
    priority: '0.4',
    breadcrumbs: [
      { name: 'Trang chủ', url: `${baseUrl}/` },
      { name: 'Chính sách bảo mật', url: `${baseUrl}/chinh-sach-bao-mat` }
    ],
    schemas: [],
    htmlContent: `
      <main class="max-w-3xl mx-auto px-5 py-10 prose prose-slate">
        <nav class="text-sm text-slate-500 mb-4" aria-label="Breadcrumb">
          <a href="/" class="hover:underline text-purple-600">Trang chủ</a> / <span>Chính sách bảo mật</span>
        </nav>
        <h1 class="text-3xl font-bold mb-4 text-slate-900">Chính sách bảo mật</h1>
        <p class="text-sm text-slate-500">Cập nhật lần cuối: Tháng 09/2026</p>
        
        <h2 class="text-2xl font-semibold mt-6 mb-2 text-slate-900">1. Thông tin thu thập</h2>
        <p class="text-slate-700 leading-relaxed">Hyliya thu thập thông tin bạn cung cấp khi đăng ký (tên hiển thị, độ tuổi, giới tính, ảnh đại diện), dữ liệu vị trí (chỉ khi bạn chủ động cấp quyền) để phục vụ tính năng “Quanh đây”, và dữ liệu tương tác trong ứng dụng.</p>

        <h2 class="text-2xl font-semibold mt-6 mb-2 text-slate-900">2. Cách sử dụng dữ liệu</h2>
        <p class="text-slate-700 leading-relaxed">Dữ liệu được dùng để: gợi ý ghép đôi phù hợp qua AI matching, hiển thị hồ sơ cho người dùng khác trong phạm vi bạn cho phép, xử lý thanh toán và hỗ trợ kỹ thuật.</p>

        <h2 class="text-2xl font-semibold mt-6 mb-2 text-slate-900">3. Công nghệ bảo mật</h2>
        <p class="text-slate-700 leading-relaxed">Hyliya ứng dụng Supabase với phân quyền cấp hàng (Row Level Security), toàn bộ lưu lượng được bảo vệ bởi HTTPS/SSL, mật khẩu mã hóa chuẩn cao cấp.</p>

        <h2 class="text-2xl font-semibold mt-6 mb-2 text-slate-900">4. Quyền của người dùng</h2>
        <p class="text-slate-700 leading-relaxed">Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa toàn bộ dữ liệu cá nhân bất kỳ lúc nào qua tính năng trong ứng dụng hoặc email <a href="mailto:support@hyliya.com" class="text-purple-600">support@hyliya.com</a>.</p>

        <p class="mt-8">
          <a href="/" class="text-purple-600 hover:underline font-medium">← Quay về trang chủ</a>
        </p>
      </main>
    `
  },
  {
    path: '/dating',
    title: 'Hẹn hò AI - Ghép đôi thông minh | Hyliya',
    description: 'Trải nghiệm ghép đôi thông minh bằng AI trên Hyliya: gợi ý hồ sơ tương thích theo sở thích, tính cách và vị trí địa lý của bạn.',
    keywords: 'hẹn hò AI, ghép đôi thông minh, tìm người yêu online, match hẹn hò Việt Nam',
    url: `${baseUrl}/dating`,
    changefreq: 'weekly',
    priority: '0.8',
    breadcrumbs: [
      { name: 'Trang chủ', url: `${baseUrl}/` },
      { name: 'Hẹn hò AI', url: `${baseUrl}/dating` }
    ],
    schemas: [],
    htmlContent: `
      <main class="max-w-4xl mx-auto px-5 py-10 text-center">
        <nav class="text-sm text-slate-500 mb-6 text-left" aria-label="Breadcrumb">
          <a href="/" class="hover:underline text-purple-600">Trang chủ</a> / <span>Hẹn hò AI</span>
        </nav>
        <h1 class="text-3xl font-bold text-slate-900 mb-4">Ghép đôi thông minh bằng AI</h1>
        <p class="text-slate-600 max-w-xl mx-auto mb-8">
          AI của Hyliya liên tục phân tích hồ sơ và sở thích cá nhân để đề xuất những đối tượng có độ tương thích cao nhất dành cho bạn.
        </p>
        <div class="p-8 bg-purple-50 rounded-2xl max-w-lg mx-auto border border-purple-100">
          <p class="text-purple-900 font-semibold mb-2">Đang tải hồ sơ gợi ý...</p>
          <p class="text-sm text-slate-600">Vui lòng đăng nhập hoặc khám phá để bắt đầu tìm kiếm nửa kia của bạn.</p>
        </div>
      </main>
    `
  },
  {
    path: '/chat',
    title: 'Chat với người lạ ẩn danh - Trò chuyện ngẫu nhiên | Hyliya',
    description: 'Chat với người lạ ẩn danh và an toàn trên Hyliya. Trò chuyện ngẫu nhiên realtime với người dùng khắp Việt Nam.',
    keywords: 'chat với người lạ, chat ẩn danh, trò chuyện ngẫu nhiên, chat online Việt Nam',
    url: `${baseUrl}/chat`,
    changefreq: 'weekly',
    priority: '0.8',
    breadcrumbs: [
      { name: 'Trang chủ', url: `${baseUrl}/` },
      { name: 'Chat với người lạ', url: `${baseUrl}/chat` }
    ],
    schemas: [],
    htmlContent: `
      <main class="max-w-4xl mx-auto px-5 py-10 text-center">
        <nav class="text-sm text-slate-500 mb-6 text-left" aria-label="Breadcrumb">
          <a href="/" class="hover:underline text-purple-600">Trang chủ</a> / <span>Chat với người lạ</span>
        </nav>
        <h1 class="text-3xl font-bold text-slate-900 mb-4">Chat với người lạ ẩn danh an toàn</h1>
        <p class="text-slate-600 max-w-xl mx-auto mb-8">
          Kết nối và trò chuyện ngay lập tức với người lạ trên khắp mọi miền đất nước mà không lo lộ thông tin cá nhân.
        </p>
        <div class="p-8 bg-purple-50 rounded-2xl max-w-lg mx-auto border border-purple-100">
          <p class="text-purple-900 font-semibold mb-2">Đang kết nối phòng chat ngẫu nhiên...</p>
          <p class="text-sm text-slate-600">Đăng nhập hoặc chọn bắt đầu trò chuyện để tìm người bạn mới.</p>
        </div>
      </main>
    `
  },
  {
    path: '/nearby',
    title: 'Tìm bạn quanh đây - Hẹn hò theo vị trí | Hyliya',
    description: 'Tìm bạn quanh đây theo vị trí thời gian thực trên Hyliya. Khám phá những người dùng đang ở gần bạn và kết nối nhanh chóng.',
    keywords: 'tìm bạn quanh đây, hẹn hò gần tôi, kết bạn theo vị trí, nearby dating',
    url: `${baseUrl}/nearby`,
    changefreq: 'weekly',
    priority: '0.8',
    breadcrumbs: [
      { name: 'Trang chủ', url: `${baseUrl}/` },
      { name: 'Tìm bạn quanh đây', url: `${baseUrl}/nearby` }
    ],
    schemas: [],
    htmlContent: `
      <main class="max-w-4xl mx-auto px-5 py-10 text-center">
        <nav class="text-sm text-slate-500 mb-6 text-left" aria-label="Breadcrumb">
          <a href="/" class="hover:underline text-purple-600">Trang chủ</a> / <span>Tìm bạn quanh đây</span>
        </nav>
        <h1 class="text-3xl font-bold text-slate-900 mb-4">Tìm kiếm bạn bè & người yêu ở gần bạn</h1>
        <p class="text-slate-600 max-w-xl mx-auto mb-8">
          Khám phá những người dùng độc thân đang hoạt động trong khu vực xung quanh theo bán kính tùy chọn.
        </p>
        <div class="p-8 bg-purple-50 rounded-2xl max-w-lg mx-auto border border-purple-100">
          <p class="text-purple-900 font-semibold mb-2">Đang quét vị trí người dùng gần bạn...</p>
          <p class="text-sm text-slate-600">Hãy cấp quyền vị trí trình duyệt để xem khoảng cách chính xác.</p>
        </div>
      </main>
    `
  },
  {
    path: '/timeline',
    title: 'Timeline cộng đồng - Chia sẻ khoảnh khắc | Hyliya',
    description: 'Theo dõi bảng tin timeline cộng đồng Hyliya: xem hình ảnh, bài đăng cảm xúc và tương tác tặng sao cho các thành viên.',
    keywords: 'timeline hẹn hò, bảng tin cộng đồng, chia sẻ khoảnh khắc, Hyliya timeline',
    url: `${baseUrl}/timeline`,
    changefreq: 'daily',
    priority: '0.9',
    breadcrumbs: [
      { name: 'Trang chủ', url: `${baseUrl}/` },
      { name: 'Timeline cộng đồng', url: `${baseUrl}/timeline` }
    ],
    schemas: [],
    htmlContent: `
      <main class="max-w-4xl mx-auto px-5 py-10 text-center">
        <nav class="text-sm text-slate-500 mb-6 text-left" aria-label="Breadcrumb">
          <a href="/" class="hover:underline text-purple-600">Trang chủ</a> / <span>Timeline cộng đồng</span>
        </nav>
        <h1 class="text-3xl font-bold text-slate-900 mb-4">Timeline khoảnh khắc cộng đồng</h1>
        <p class="text-slate-600 max-w-xl mx-auto mb-8">
          Khám phá những câu chuyện, hình ảnh và trạng thái mới nhất từ các thành viên trong cộng đồng Hyliya.
        </p>
        <div class="p-8 bg-purple-50 rounded-2xl max-w-lg mx-auto border border-purple-100">
          <p class="text-purple-900 font-semibold mb-2">Đang tải bảng tin bài viết...</p>
          <p class="text-sm text-slate-600">Đăng nhập để like, bình luận và chia sẻ khoảnh khắc của chính bạn.</p>
        </div>
      </main>
    `
  }
];

function prerender() {
  console.log('🚀 Bắt đầu quá trình Static Prerendering (SSG) cho Hyliya...');
  
  const templatePath = path.join(distDir, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error('❌ Không tìm thấy dist/index.html! Hãy chạy `vite build` trước.');
    process.exit(1);
  }

  const baseTemplate = fs.readFileSync(templatePath, 'utf8');

  for (const route of routes) {
    let html = baseTemplate;

    // 1. Title
    html = html.replace(/<title>.*?<\/title>/i, `<title>${route.title}</title>`);
    html = html.replace(/<meta\s+name=["']title["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="title" content="${route.title}" />`);

    // 2. Meta description & keywords
    html = html.replace(/<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="description" content="${route.description}" />`);
    html = html.replace(/<meta\s+name=["']keywords["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="keywords" content="${route.keywords}" />`);

    // 3. Canonical & hreflang
    html = html.replace(/<link\s+rel=["']canonical["']\s+href=["'].*?["']\s*\/?>/i, `<link rel="canonical" href="${route.url}" />`);
    html = html.replace(/<link\s+rel=["']alternate["']\s+hreflang=["']vi-VN["']\s+href=["'].*?["']\s*\/?>/i, `<link rel="alternate" hreflang="vi-VN" href="${route.url}" />`);
    html = html.replace(/<link\s+rel=["']alternate["']\s+hreflang=["']vi["']\s+href=["'].*?["']\s*\/?>/i, `<link rel="alternate" hreflang="vi" href="${route.url}" />`);
    html = html.replace(/<link\s+rel=["']alternate["']\s+hreflang=["']x-default["']\s+href=["'].*?["']\s*\/?>/i, `<link rel="alternate" hreflang="x-default" href="${route.url}" />`);

    // 4. OpenGraph & Twitter
    html = html.replace(/<meta\s+property=["']og:url["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:url" content="${route.url}" />`);
    html = html.replace(/<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:title" content="${route.title}" />`);
    html = html.replace(/<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:description" content="${route.description}" />`);

    html = html.replace(/<meta\s+property=["']twitter:url["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="twitter:url" content="${route.url}" />`);
    html = html.replace(/<meta\s+property=["']twitter:title["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="twitter:title" content="${route.title}" />`);
    html = html.replace(/<meta\s+property=["']twitter:description["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="twitter:description" content="${route.description}" />`);

    // 5. Schema generation
    const allSchemas = [];

    // Add Breadcrumb schema if items > 1
    if (route.breadcrumbs && route.breadcrumbs.length > 0) {
      allSchemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: route.breadcrumbs.map((item, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: item.name,
          item: item.url
        }))
      });
    }

    // Add WebPage schema
    allSchemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: route.title,
      url: route.url,
      description: route.description,
      inLanguage: 'vi-VN',
      isPartOf: {
        '@type': 'WebSite',
        name: 'Hyliya',
        url: baseUrl
      }
    });

    if (route.schemas && route.schemas.length > 0) {
      allSchemas.push(...route.schemas);
    }

    const jsonLdBlock = `
    <!-- Structured Data (Prerendered) -->
    <script type="application/ld+json">
    ${JSON.stringify({ '@context': 'https://schema.org', '@graph': allSchemas }, null, 2)}
    </script>
    `;

    // Replace existing ld+json script in head
    html = html.replace(/<script\s+type=["']application\/ld\+json["']>[\s\S]*?<\/script>/i, jsonLdBlock.trim());

    // 6. Prerender Content inside #root
    html = html.replace(/<div\s+id=["']root["']>[\s\S]*?<\/div>/i, `<div id="root">\n${route.htmlContent.trim()}\n    </div>`);

    // 7. Write to target destination
    let targetFile = path.join(distDir, 'index.html');
    if (route.path !== '/') {
      const folderName = route.path.replace(/^\//, '');
      const targetDir = path.join(distDir, folderName);
      fs.mkdirSync(targetDir, { recursive: true });
      targetFile = path.join(targetDir, 'index.html');
    }

    fs.writeFileSync(targetFile, html, 'utf8');
    console.log(`✅ Prerendered: ${route.path.padEnd(22)} -> ${path.relative(distDir, targetFile)}`);
  }

  console.log('🎉 Toàn bộ các routes đã được Prerender thành công với mã HTML độc lập!');
}

prerender();
