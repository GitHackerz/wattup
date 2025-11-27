'use client'

const StructuredData = () => {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "WattUP",
    "alternateName": "WattUP Energy Solutions",
    "url": "https://wattup.com",
    "logo": "https://wattup.com/logo.png",
    "description": "Advanced electricity monitoring solutions with real-time insights, predictive analytics, and anomaly detection",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-123-4567",
      "contactType": "customer service",
      "availableLanguage": "English"
    },
    "sameAs": [
      "https://twitter.com/wattup_official",
      "https://linkedin.com/company/wattup",
      "https://github.com/wattup"
    ]
  }

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "WattUP Energy Management System",
    "description": "Smart energy management solution with real-time monitoring, predictive analytics, and cost optimization",
    "brand": {
      "@type": "Brand",
      "name": "WattUP"
    },
    "category": "Energy Management Software",
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "priceValidUntil": "2025-12-31",
      "seller": {
        "@type": "Organization",
        "name": "WattUP"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127"
    }
  }

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Electricity Monitoring and Energy Management",
    "description": "Comprehensive electricity monitoring services including real-time tracking, anomaly detection, and predictive analytics",
    "provider": {
      "@type": "Organization",
      "name": "WattUP"
    },
    "areaServed": "Worldwide",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Energy Management Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Real-time Energy Monitoring"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Predictive Analytics"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Anomaly Detection"
          }
        }
      ]
    }
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is WattUP?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "WattUP is a comprehensive energy monitoring solution that tracks, analyzes, and optimizes electricity consumption in real-time, providing insights to reduce costs and improve energy efficiency."
        }
      },
      {
        "@type": "Question",
        "name": "How much can I save with energy monitoring?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our customers typically see cost reductions of 20-35% within the first year of implementation through optimized energy usage and early detection of inefficiencies."
        }
      },
      {
        "@type": "Question",
        "name": "Is the system suitable for small businesses?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, WattUP is scalable and suitable for businesses of all sizes, from small offices to large industrial facilities."
        }
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  )
}

export default StructuredData
