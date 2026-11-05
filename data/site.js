/* PostalNook site facts. ONE place for phone, email, address, hours, customer count and social links.
   Text blocks can use tokens such as {{phone}}. Change a value here and every page follows. */
window.SITE = {
  name: "PostalNook",
  baseUrl: "https://www.postalnook.com",

  phone: "(512) 358-1060",
  phoneHref: "tel:+15123581060",
  email: "contact@postalnook.com",

  // TODO: confirm. The live site shows two addresses:
  //   "12856 N HIGHWAY 183 (RESEARCH BLVD) AUSTIN, TX 78750" (contact section)
  //   "12856B RESEARCH BLVD AUSTIN, TX 78750" (footer)
  address: "12856 N HIGHWAY 183 (RESEARCH BLVD) AUSTIN, TX 78750",

  // TODO: confirm. Home page says "over 1000 satisfied customers", the Our Story text says "over 100 customers".
  customers: "1000",

  hours: [
    "Monday - Friday: 9am - 7pm",
    "Saturday: 9am - 1.30pm",
    "Sunday: Closed"
  ],

  urls: {
    signup: "https://www.postalnook.com/signup",
    signupPricing: "https://www.postalnook.com/signup?step=pricing",
    login: "https://www.postalnook.com/login",
    terms: "https://www.postalnook.com/terms",
    conditions: "https://www.postalnook.com/conditions"
  },

  // Each icon kind matches its own link.
  // (The live site shows a Reddit icon that opens Yelp. Not copied.)
  social: {
    facebook:  "https://m.facebook.com/postalnook",
    whatsapp:  "https://api.whatsapp.com/message/FKPR3UIJW6HDG1?autoload=1&app_absent=0",
    x:         "https://twitter.com/postalnook",
    linkedin:  "https://www.linkedin.com/company/postalnook",
    instagram: "https://www.instagram.com/postalnook",
    youtube:   "https://www.youtube.com/@PostalNook",
    google:    "https://www.google.com/search?q=postalnook",
    yelp:      "https://www.yelp.com/biz/postalnook-austin"
  }
};

/* Token values used by {{token}} in block text. */
window.SITE.tokens = function () {
  var s = window.SITE;
  var t = {
    phone: s.phone,
    email: s.email,
    address: s.address,
    customers: s.customers,
    hours: s.hours.join("<br>"),
    hours1: s.hours[0], hours2: s.hours[1], hours3: s.hours[2],
    phoneHref: s.phoneHref
  };
  Object.keys(s.urls).forEach(function (k) { t["url_" + k] = s.urls[k]; });
  Object.keys(s.social).forEach(function (k) { t["social_" + k] = s.social[k]; });
  return t;
};
