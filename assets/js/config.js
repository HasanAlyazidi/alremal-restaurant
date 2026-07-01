/* =====================================================================
   SITE CONFIG — the ONE file to edit per client.
   Change these values (+ swap the logo/cover images and menu.json),
   and the whole site rebrands. Loaded before everything else.
   ===================================================================== */
window.SITE_CONFIG = {

  // ---- Identity ----
  name:      { ar: "مطاعم الرمال", en: "ALREMAL RESTAURANT" },
  brandSub:  "ALREMAL",                       // small latin line under the logo
  eyebrow:   { ar: "مطبخ شعبي على الحطب والتنور", en: "Traditional fire & clay-oven kitchen" },
  tagline:   { ar: "نكهات يمنية وسعودية أصيلة في قلب جدة — مندي، مضغوط، مظبي، ومعصوب على أصوله.",
               en: "Authentic Yemeni & Saudi flavors in the heart of Jeddah — mandi, madghout, mathbi & ma'soub done right." },

  // ---- Brand assets ----
  logo:  "assets/images/brand/logo.jpg",
  cover: "assets/images/brand/cover.jpg",

  // ---- Brand colours (CSS variables — restyle the whole site here) ----
  colors: {
    "ember": "#c0142b", "ember-dark": "#a11123", "ember-soft": "#e7a9b1",
    "maroon": "#531417", "maroon-deep": "#3a0d10",
    "gold": "#c8a24c", "gold-soft": "#e7cf93",
    "sand-50": "#fbf5ea", "sand-100": "#f6ead6", "sand-200": "#eddcc1",
    "ink": "#2a1e16", "muted": "#836f5c"
  },

  // ---- Trust / stats ----
  rating: { value: "4.4", count: 444 },

  // ---- Contact ----
  whatsapp: "966500549144",                   // international format, no + (used for wa.me links)
  phones:   ["0126033003", "0500549144", "0537703005"],
  email:    "",
  address:  { ar: "جدة — حي الورود (غرناطة سابقاً)، قرب جامع الهباش.",
              en: "Jeddah — Al-Wurood district (formerly Granada), near Habash Mosque." },
  map:      { query: "Alremal Restaurant Al Wurud Jeddah",
              link:  "https://maps.app.goo.gl/AbrVd1vJABMHLxi37" },

  // ---- Hours (Sunday → Saturday) ----
  hours: [
    { ar: "الأحد",   en: "Sunday",    time: "11:00 AM – 2:00 AM" },
    { ar: "الإثنين",  en: "Monday",    time: "11:00 AM – 2:00 AM" },
    { ar: "الثلاثاء", en: "Tuesday",   time: "11:00 AM – 2:00 AM" },
    { ar: "الأربعاء", en: "Wednesday", time: "11:30 AM – 2:00 AM" },
    { ar: "الخميس",  en: "Thursday",  time: "11:00 AM – 2:00 AM" },
    { ar: "الجمعة",  en: "Friday",    time: "12:30 PM – 2:00 AM" },
    { ar: "السبت",   en: "Saturday",  time: "11:00 AM – 2:00 AM" }
  ],

  // ---- Social (use "#" to hide-as-placeholder) ----
  social: {
    instagram: "https://www.instagram.com/restaurant_alrmal",
    snapchat:  "https://www.snapchat.com/add/restaurant_alrmal",
    facebook:  "https://www.facebook.com/restaurant_alrmal"
  },

  // ---- Delivery platform links ----
  delivery: {
    keeta:         "#",
    hungerstation: "https://hungerstation.com/sa-ar/restaurant/%D8%AC%D8%AF%D8%A9/%D8%A7%D9%84%D9%88%D8%B1%D9%88%D8%AF/44241",
    mrsool:        "#",
    jahez:         "#"
  },

  // ---- App store links ----
  apps: { googlePlay: "#", appStore: "#" },

  // ---- Ordering ----
  deliveryFee: 8,

  // ---- "Made by" demo popup (set enabled:false for a live client site) ----
  demo: {
    enabled: true,
    dev:      { ar: "المهندس حسن اليزيدي", en: "Eng. Hasan Al-Yazidi" },
    whatsapp: "966545482824",
    email:    "info@highestweb.com"
  }
};
