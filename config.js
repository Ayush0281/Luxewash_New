/**
 * LuxeWash Application Configuration
 * Modular settings and EmailJS credentials
 */
const APP_CONFIG = {
  EMAILJS: {
    PUBLIC_KEY: (typeof window !== "undefined" && window.__ENV?.EMAILJS_PUBLIC_KEY) || "w31DfD4b3031VhNWF",
    SERVICE_ID: (typeof window !== "undefined" && window.__ENV?.EMAILJS_SERVICE_ID) || "service_5lpj7kg",
    TEMPLATE_ID: (typeof window !== "undefined" && window.__ENV?.EMAILJS_TEMPLATE_ID) || "template_32gi9fm"
  },
  PRICING: {
    FREE_DELIVERY_THRESHOLD: 499,
    STANDARD_DELIVERY_FEE: 50,
    EXPRESS_SURCHARGE: 99
  }
};
