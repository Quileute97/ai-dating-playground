import { Helmet } from 'react-helmet-async';

interface TabSEOProps {
  activeTab: string;
}

const TabSEO = ({ activeTab }: TabSEOProps) => {
  const baseUrl = "https://hyliya.com";
  
  const tabData: Record<string, { path: string; label: string }> = {
    chat: { path: '/', label: 'Chat với người lạ' },
    dating: { path: '/dating', label: 'Hẹn hò' },
    nearby: { path: '/nearby', label: 'Quanh đây' },
    timeline: { path: '/timeline', label: 'Timeline' },
    messages: { path: '/messages', label: 'Tin nhắn' },
    notifications: { path: '/notifications', label: 'Thông báo' }
  };

  const currentTab = tabData[activeTab] || tabData.chat;
  const canonicalUrl = `${baseUrl}${currentTab.path}`;

  // Breadcrumb structured data
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Trang chủ",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": currentTab.label,
        "item": canonicalUrl
      }
    ]
  };

  // WebPage structured data for current page
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": currentTab.label,
    "url": canonicalUrl,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Hyliya",
      "url": baseUrl
    },
    "primaryImageOfPage": {
      "@type": "ImageObject",
      "url": `${baseUrl}/og-image.jpg`
    },
    "breadcrumb": breadcrumbSchema
  };

  return (
    <Helmet>
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Alternate URLs for language/region variations */}
      <link rel="alternate" hrefLang="vi-VN" href={canonicalUrl} />
      <link rel="alternate" hrefLang="vi" href={canonicalUrl} />
      
      {/* Open Graph meta tags */}
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      
      {/* Twitter Card meta tags */}
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(webPageSchema)}
      </script>
    </Helmet>
  );
};

export default TabSEO;
