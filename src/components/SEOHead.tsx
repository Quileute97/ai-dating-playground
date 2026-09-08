import React from 'react';
import { Helmet } from 'react-helmet-async';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  breadcrumbs?: BreadcrumbItem[];
  jsonLd?: object | object[];
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = "Hyliya - Hẹn hò AI & kết nối thông minh cho người Việt",
  description = "Hyliya là ứng dụng hẹn hò AI cho người Việt với ghép đôi thông minh, chat an toàn, tìm bạn quanh đây và timeline chia sẻ khoảnh khắc.",
  keywords = "hẹn hò AI, app hẹn hò Việt Nam, ghép đôi thông minh, chat với người lạ, tìm bạn quanh đây, Hyliya",
  image = "https://hyliya.com/og-image.jpg",
  url = "https://hyliya.com/",
  type = "website",
  breadcrumbs,
  jsonLd,
}) => {
  const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  } : null;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Language / Alternate tags */}
      <link rel="alternate" hrefLang="vi-VN" href={url} />
      <link rel="alternate" hrefLang="vi" href={url} />
      <link rel="alternate" hrefLang="x-default" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Hyliya" />
      <meta property="og:locale" content="vi_VN" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Breadcrumb Schema */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}

      {/* Custom Schema */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;

