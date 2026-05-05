import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { ServicesEditorial } from "@/components/sections/ServicesEditorial";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { CaseStudy } from "@/components/sections/CaseStudy";
import { TestimonialsEditorial } from "@/components/sections/TestimonialsEditorial";
import { PhotoGallery } from "@/components/sections/PhotoGallery";
import { FAQv2 } from "@/components/sections/FAQv2";
import { LeadMagnetV2 } from "@/components/sections/LeadMagnetV2";
import { ServiceAreaWidget } from "@/components/sections/ServiceAreaWidget";
import { siteConfig } from "@/lib/config";

/**
 * Photography flagship funnel order (per brief, locked):
 *   hero → services → trust → process → testimonial → gallery → faq → footer-cta
 *
 * footer-cta = LeadMagnetV2 (newsletter / "How to choose a wedding photographer" guide).
 * CaseStudy + ServiceAreaWidget appended after the locked funnel — they enrich the
 * page without breaking the brief order.
 */
export default function HomePage() {
  return (
    <>
      {/* 1. Hero */}
      <Hero />

      {/* 2. Services — editorial 3-col (rhythm: generous) */}
      <ServicesEditorial />

      {/* 3. Trust Strip — press + equipment row (rhythm: normal) */}
      <TrustStrip />

      {/* 4. Process Timeline — 4-step (rhythm: generous) */}
      <ProcessTimeline />

      {/* 5. Testimonials — 3-card editorial (rhythm: normal) */}
      <TestimonialsEditorial />

      {/* 6. Gallery — categorized portfolio (rhythm: generous) */}
      {(siteConfig.modules?.photo_gallery !== false) && <PhotoGallery />}

      {/* 7. FAQ — 8 accordion (rhythm: normal) */}
      {(siteConfig.modules?.faq !== false) && <FAQv2 />}

      {/* 8. Footer CTA — Lead Magnet block (rhythm: generous) */}
      <LeadMagnetV2 />

      {/* Below-funnel enrichment (does not break locked order) */}
      <CaseStudy />
      {(siteConfig.modules?.service_area_map !== false) && <ServiceAreaWidget />}
    </>
  );
}
