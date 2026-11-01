export const workCategories = [
  "All",
  "Websites",
  "Business Solutions",
  "UI/UX",
  "Creative & Branding",
  "Social Media",
] as const;
export type WorkCategory = typeof workCategories[number];
export type ProjectCategory = Exclude<WorkCategory, "All">;
export const ownershipCategories = ["Professional Experience", "Freelance Project", "PROSPERA Project"] as const;
export type ProjectOwnership = typeof ownershipCategories[number];

export type ProjectScreenshot = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
};
export type WorkProject = {
  slug: string;
  title: string;
  industry: string;
  categories: readonly ProjectCategory[];
  description: string;
  challenge: string | null;
  solution: string | null;
  features: readonly string[];
  technologies: readonly string[];
  screenshots: readonly ProjectScreenshot[];
  liveUrl: string | null;
  ownership: ProjectOwnership | null;
  contribution: string | null;
  coverImage?: string;
  mediaNote?: string;
  monogram: string;
  accent: string;
};

// Project names and capabilities come from user-supplied briefs and screenshots.
// Nulls and empty arrays keep unverified details out of public copy.
// Employment work retains its employer/client ownership: document only the
// founder's contribution and use screenshots approved for public display.
// The owner confirmed this shared stack and end-to-end role for every project.
const projectDefaults = {
  challenge: null, solution: null, screenshots: [],
  liveUrl: null, ownership: null,
  technologies: ["Next.js", "Firebase", "Meta integrations"],
  contribution: "End-to-end development, including frontend implementation, application workflows, Firebase integration and Meta integrations.",
} as const;

export const workProjects: readonly WorkProject[] = [
  {
    ...projectDefaults, ownership: "PROSPERA Project", slug: "school-attendance-management",
    title: "School Management", industry: "Education / Charitable trust",
    categories: ["Websites", "Business Solutions"],
    description: "A public trust website and school portal connecting student information, attendance and daily administration.",
    challenge: "Give visitors access to the trust’s work while helping administrators organise student records, attendance and public content in one place.",
    solution: "Paired a public website with a school administration portal. Visitors can explore trust information, student achievements and donation or enquiry interfaces; staff have a workspace for admissions, attendance, leave, reports and year-wise galleries. The portfolio uses restyled concepts to present these workflows without exposing student information.",
    features: ["Public trust website", "Admissions and student records", "Attendance and leave management", "Student achievements and reports", "Year-wise gallery management", "Donation and enquiry interfaces", "Admin management portal"],
    liveUrl: "https://www.noormeher.org/",
    coverImage: "/work/noormeher/cover-editorial.webp",
    mediaNote: "Concept visuals based on the supplied school-management project screens. Brightfield Trust is a fictional demo identity; all photos, student imagery, colours and sample content have been changed for this portfolio. These are not screenshots of the live school website. Demo figures are not project results. The live preview opens the original website, whose appearance differs from these concepts.",
    screenshots: [
      { src: "/work/noormeher/home-concept.webp", width: 1874, height: 839, alt: "Fictional education trust homepage concept with AI-generated classroom imagery and sample branding", caption: "Public website / Concept design, fictional imagery" },
      { src: "/work/noormeher/gallery-concept.webp", width: 1852, height: 849, alt: "School gallery-management concept with year-wise collection forms and clearly labelled demo data", caption: "Gallery management / Concept UI, demo data" },
      { src: "/work/noormeher/login-concept.webp", width: 1761, height: 893, alt: "Fictional trust administration sign-in concept with student-record, attendance and gallery overview", caption: "Admin portal sign-in / Concept UI" },
      { src: "/work/noormeher/progress-concept.webp", width: 1864, height: 843, alt: "Fictional progress-page concept with sample learner records, activity counts and gallery collections", caption: "Progress and achievements / Fictional demo content" },
      { src: "/work/noormeher/donation-concept.webp", width: 1839, height: 855, alt: "Donation-form concept with payment details hidden and no functional payment code", caption: "Donation interface / Concept UI, payments disabled" },
      { src: "/work/noormeher/student-concept.webp", width: 1835, height: 857, alt: "Fictional student-profile concept with illustrated avatar and all personal information hidden", caption: "Student profile / Fictional illustration, details hidden" },
    ],
    monogram: "NM", accent: "#b9b2ce",
  },
  {
    ...projectDefaults, ownership: "Professional Experience", slug: "hrms", title: "HRMS",
    industry: "Human resources / Cross-industry",
    categories: ["Business Solutions"],
    description: "An HR workspace for employee self-service, attendance, leave approvals and automated communication.",
    challenge: "Give employees and HR a connected view of work sessions, leave requests and employee information, with clear updates as requests move through review.",
    solution: "Built an HRMS with employee profiles, attendance calendars, session and break tracking, and leave requests routed through manager and HR review. In-app notifications and automated leave-status emails keep communication alongside the workflow. Performance-review overviews and document access support employee self-service.",
    features: ["Tenant sign-in interfaces", "Work-mode, session and break tracking", "Attendance calendar and daily session details", "Leave requests and approval flows", "Employee profiles, documents and payslip access", "Performance-review overview", "In-app notification centre", "Automated leave-status email integration"],
    coverImage: "/work/hrms/cover-editorial.webp",
    mediaNote: "Graphite-and-electric-blue concept visuals based on the supplied HRMS screens. WORKSPACE HR and Demo Employee are fictional portfolio identities. Personal information, avatars, dates, session values and review figures have been replaced with demo content. These are restyled concepts, not unedited production screenshots or evidence of real employee performance. In-app notifications and automated email integration are project capabilities confirmed by the supplied screens and brief.",
    screenshots: [
      { src: "/work/hrms/dashboard-blue.webp", width: 1869, height: 842, alt: "Graphite and blue HRMS employee dashboard concept with demo attendance controls, announcements and sample review data", caption: "Employee dashboard / Concept UI, demo data" },
      { src: "/work/hrms/login-blue.webp", width: 1778, height: 885, alt: "HRMS tenant sign-in concept with email, Google and Microsoft options and fictional workspace identity", caption: "Tenant sign-in / Concept UI" },
      { src: "/work/hrms/attendance-blue.webp", width: 1871, height: 840, alt: "Blue HRMS attendance calendar concept with sample attendance statistics and fictional session details", caption: "Attendance overview / Demo session data" },
      { src: "/work/hrms/leave-blue.webp", width: 1974, height: 797, alt: "HRMS leave-request concept showing leave type, date range, day selectors, approval flow and demo leave balances", caption: "Leave requests and approval flow / Concept UI" },
      { src: "/work/hrms/profile-blue.webp", width: 1882, height: 836, alt: "HRMS employee-profile concept with fictional employee identity and hidden personal details", caption: "Employee profile / Fictional identity" },
      { src: "/work/hrms/notifications-blue.webp", width: 1290, height: 1219, alt: "In-app HRMS notification centre concept with unread announcement and task-review demo notifications", caption: "In-app notifications / Demo notification content" },
      { src: "/work/hrms/email-blue.webp", width: 1394, height: 1128, alt: "Automated HR leave-status email concept addressed to a fictional demo employee with pending sample request", caption: "Automated email integration / Fictional leave-status email" },
    ],
    monogram: "HR", accent: "#2962ff",
  },
  {
    ...projectDefaults, ownership: "Professional Experience", slug: "sales-crm-webhooks",
    title: "Sales CRM with Webhooks", industry: "Automotive / Dealership management",
    categories: ["Business Solutions", "Websites"],
    description: "A dealership CRM connecting vehicle stock, sales enquiries, follow-ups and WhatsApp communication.",
    challenge: "Help dealership teams connect enquiries to available vehicles, track follow-ups and share vehicle information without moving between disconnected tools.",
    solution: "Built a dealership workspace with lead-source dashboards, vehicle inventory, follow-ups and finance, insurance and RTO modules. Public vehicle-detail pages support enquiries, while WhatsApp sharing, automated replies and webhook integrations connect customer communication to the sales workflow.",
    features: ["Lead dashboard and source breakdown", "Vehicle inventory and public vehicle-detail pages", "Customer follow-ups", "Finance, insurance and RTO management", "Vehicle-detail sharing by WhatsApp", "Automated enquiry replies", "Webhook integrations"],
    coverImage: "/work/sales-crm/cover-editorial.webp",
    mediaNote: "Portfolio visuals are restyled from supplied original project screenshots. Branding, visual styling and sample data have been modified for presentation; these are not unedited production screenshots. Figures shown are demo data, not project results.",
    screenshots: [
      { src: "/work/sales-crm/dashboard-restyled.webp", width: 1857, height: 847, alt: "Restyled dealership CRM dashboard showing lead tables, source charts and operational modules with demo data", caption: "Dealership dashboard / Restyled UI, demo data" },
      { src: "/work/sales-crm/login-restyled.webp", width: 1877, height: 838, alt: "Restyled Dealer CRM sign-in screen with inventory, enquiry, finance, insurance and RTO overview", caption: "Sign-in experience / Restyled UI" },
      { src: "/work/sales-crm/vehicle-restyled.webp", width: 1848, height: 851, alt: "Restyled public vehicle-detail page with photographs, specifications and enquiry actions", caption: "Vehicle details and enquiry / Restyled UI, demo data" },
      { src: "/work/sales-crm/sharing-restyled.webp", width: 1359, height: 1157, alt: "Restyled WhatsApp vehicle-sharing modal with saved-contact search and masked manual numbers", caption: "Vehicle-detail sharing / Restyled UI, demo data" },
      { src: "/work/sales-crm/whatsapp-restyled.webp", width: 858, height: 1833, alt: "Restyled demo WhatsApp conversation illustrating automated vehicle enquiry replies and website links", caption: "Automated enquiry replies / Restyled demo conversation" },
    ],
    monogram: "SC", accent: "#348c85",
  },
  {
    ...projectDefaults, ownership: "Professional Experience", slug: "business-referral-listing",
    title: "Business Referral & Listing Platform", industry: "Business networking / Social commerce",
    categories: ["Business Solutions"],
    description: "A business network for discovering services, sharing updates and tracking referrals, commissions and points.",
    challenge: "Connect service discovery and community activity with a clear referral journey, while keeping monetary commission balances separate from contribution points.",
    solution: "Built a platform with searchable business listings, story-style updates, social posts and referral entry points. A commission wallet presents balances and withdrawal requests; a separate points dashboard presents contribution activity and redemption options. The portfolio uses fictional businesses and sample balances to illustrate the experience.",
    features: ["Business listings and service discovery", "Story-style business updates", "Posts, likes, comments and sharing interfaces", "Prospect and referral entry points", "Referral commission balances and withdrawal requests", "Contribution points and redemption interface", "Community network overview and events"],
    coverImage: "/work/business-network/cover-editorial.webp",
    mediaNote: "Restyled concepts based on supplied project screens. CONNECT NETWORK, its businesses, imagery and member identities are fictional portfolio content. All balances, commissions, points and engagement counts are sample data, not actual earnings or project results. Commissions and points are separate; no earning guarantee, commission rate or point-to-cash conversion is claimed. Withdrawal and reward actions shown here are visual previews. This project is professional experience and is not represented as a PROSPERA-owned client engagement.",
    screenshots: [
      { src: "/work/business-network/home-restyled.webp", width: 886, height: 1776, alt: "Restyled business networking home with demo stories, referral actions and separate commission and points summaries", caption: "Network overview / Restyled UI, demo data" },
      { src: "/work/business-network/directory-restyled.webp", width: 863, height: 1823, alt: "Business directory concept with fictional listings, search, filters and referral actions", caption: "Business listings / Fictional demo businesses" },
      { src: "/work/business-network/story-restyled.webp", width: 862, height: 1825, alt: "Business story viewer concept with fictional cafe imagery, profile and enquiry actions", caption: "Story-style updates / Restyled concept" },
      { src: "/work/business-network/post-restyled.webp", width: 863, height: 1823, alt: "Business post concept with sample image, likes, comments, sharing and referral controls", caption: "Social posts and engagement / Demo activity" },
      { src: "/work/business-network/wallet-restyled.webp", width: 863, height: 1823, alt: "Commission wallet concept with sample available and pending amounts, referral transactions and withdrawal preview", caption: "Commission wallet / Sample balances, no real earnings" },
      { src: "/work/business-network/points-restyled.webp", width: 864, height: 1821, alt: "Contribution points concept with sample category totals, activity history and reward preview", caption: "Contribution points / Demo points, separate from commissions" },
    ],
    monogram: "BR", accent: "#343a77",
  },
  {
    ...projectDefaults, ownership: "PROSPERA Project", slug: "fitness-application",
    title: "Fitness Application", industry: "Fitness & wellness",
    categories: ["UI/UX", "Business Solutions"],
    description: "A member app and gym dashboard concept for workout planning, class bookings and membership administration.",
    challenge: "Make training and class booking clear for members while giving gym staff a coordinated view of schedules, capacity, memberships and reminders.",
    solution: "Designed connected member and staff workflows: mobile workout logging, class selection and activity history, paired with administration screens for coach schedules, class capacity and membership renewals. Reminder and birthday-message concepts show how communication could fit the journey; the visuals do not establish a live messaging integration.",
    features: ["Mobile workout plans and exercise logging", "Class booking and reminder preferences", "Activity history and session goals", "Admin class schedules and capacity", "Member records and membership renewals", "WhatsApp and email reminder concepts", "Birthday offer templates"],
    coverImage: "/work/fitness/cover-concept.webp",
    mediaNote: "Generated portfolio UI concepts for the fictional FORM FITNESS demo identity. All members, workouts, bookings, memberships and activity figures are sample content. These visuals illustrate proposed workflows; they are not production screenshots, health or performance results, or evidence of a live app or connected messaging service. No messages are sent from these previews.",
    screenshots: [
      { src: "/work/fitness/schedule-concept.webp", width: 1586, height: 992, alt: "Fitness admin class schedule concept with sample coaches, bookings and capacity", caption: "Admin class scheduling / Concept UI, demo data" },
      { src: "/work/fitness/home-concept.webp", width: 887, height: 1774, alt: "Charcoal and orange fitness mobile dashboard concept with sample workout and upcoming class", caption: "Member home / Concept UI" },
      { src: "/work/fitness/workout-concept.webp", width: 863, height: 1823, alt: "Mobile workout concept with exercise sets, weights and repetition logging", caption: "Workout plans and logging / Sample workout" },
      { src: "/work/fitness/booking-concept.webp", width: 864, height: 1821, alt: "Fitness class booking concept with dates, available places and reminder preferences", caption: "Class booking / Demo schedule" },
      { src: "/work/fitness/progress-concept.webp", width: 863, height: 1823, alt: "Fitness activity concept with illustrative session chart, history and monthly goal", caption: "Activity and goals / Illustrative data" },
      { src: "/work/fitness/members-concept.webp", width: 1586, height: 992, alt: "Gym member administration concept with fictional records, plans and renewal dates", caption: "Membership administration / Fictional member records" },
      { src: "/work/fitness/automation-concept.webp", width: 1586, height: 992, alt: "Fitness member communication concept with class reminders, renewal messages and birthday templates", caption: "Member communication / Demo automation templates" },
    ],
    monogram: "FT", accent: "#f47b42",
  },
  {
    ...projectDefaults, ownership: "PROSPERA Project", slug: "salon-booking-automation",
    title: "Salon Admin Panel and Booking Automation", industry: "Salon & beauty",
    categories: ["UI/UX", "Business Solutions"],
    description: "A salon booking and operations concept covering appointments, inventory, reminders and birthday offers.",
    challenge: "Connect customer appointment choices with the salon’s daily schedule, stock needs and follow-up communication.",
    solution: "Designed a mobile journey from service, stylist and time selection to booking confirmation and rescheduling. A matching admin workspace brings together appointments, inventory and reorder controls. WhatsApp templates, reminder rules and opt-in settings illustrate proposed customer communication rather than a verified live messaging service.",
    features: ["Mobile service selection and appointment booking", "Stylist, date and time selection", "Booking confirmation and rescheduling interfaces", "Admin appointment calendar", "Inventory, low-stock and reorder interfaces", "WhatsApp confirmation and reminder concepts", "Birthday offer templates and opt-in settings"],
    coverImage: "/work/salon/cover-concept.webp",
    mediaNote: "Generated portfolio UI concepts for the fictional MIRA SALON demo identity. All customer names, appointments, prices, stock quantities and offers are sample data. These visuals illustrate the requested booking, inventory and automation workflows; they are not production screenshots or evidence of a live application, connected WhatsApp service or messages sent to customers.",
    screenshots: [
      { src: "/work/salon/appointments-concept.webp", width: 1586, height: 992, alt: "Salon admin appointment calendar concept with demo customer bookings and selected appointment details", caption: "Admin appointments / Concept UI, demo data" },
      { src: "/work/salon/home-concept.webp", width: 862, height: 1825, alt: "MIRA SALON mobile home concept with service selection, sample prices and salon interior imagery", caption: "Mobile service selection / Concept UI" },
      { src: "/work/salon/booking-concept.webp", width: 864, height: 1821, alt: "Mobile salon booking concept with stylist selection, available dates and time slots", caption: "Book an appointment / Concept UI, demo data" },
      { src: "/work/salon/inventory-concept.webp", width: 1586, height: 992, alt: "Salon inventory concept with sample products, stock levels, low-stock indicators and reorder details", caption: "Inventory and stock control / Demo product data" },
      { src: "/work/salon/automation-concept.webp", width: 1586, height: 992, alt: "WhatsApp automation concept showing confirmation, reminder and birthday offer rules with a template editor", caption: "WhatsApp automation and birthday offers / Concept UI" },
      { src: "/work/salon/confirmation-concept.webp", width: 863, height: 1823, alt: "Mobile booking confirmation concept with sample appointment summary and rescheduling actions", caption: "Booking confirmation / Demo appointment" },
      { src: "/work/salon/whatsapp-concept.webp", width: 863, height: 1823, alt: "Demo WhatsApp conversation preview with a booking confirmation and birthday offer", caption: "Customer message previews / Fictional demo conversation" },
    ],
    monogram: "SB", accent: "#a45f6b",
  },
  {
    ...projectDefaults, ownership: "PROSPERA Project", slug: "clothing-online-store",
    title: "Clothing Online Store", industry: "E-commerce / Fashion & apparel",
    categories: ["Websites", "UI/UX"],
    description: "A fashion e-commerce concept connecting product discovery, size selection, a shopping bag and order administration.",
    challenge: "Design a clear fashion-shopping journey from browsing clothing and choosing variants to reviewing a cart and preparing orders for fulfilment.",
    solution: "Designed a storefront and collection journey with category, size, colour and price filters, followed by product options, a mobile shopping bag and checkout preview. An order-management concept carries selected variants into the staff workflow. These screens demonstrate the shopping and fulfilment journey without claiming connected payments or actual orders.",
    features: ["Clothing storefront and collection browsing", "Category, size, colour and price filters", "Product gallery and variant selection", "Mobile cart with quantities and order summary", "Checkout and shipping form concept", "Admin order review and fulfilment interface"],
    coverImage: "/work/clothing/cover-concept.webp",
    mediaNote: "Generated portfolio concepts for the fictional THREAD / FORM demo identity. Garment imagery, products, prices, customers and orders are illustrative content. These are not screenshots of a live store or evidence of actual sales, connected payments or shipments. Checkout and order actions are visual previews only.",
    screenshots: [
      { src: "/work/clothing/home-concept.webp", width: 1586, height: 992, alt: "Minimal clothing storefront concept with fictional apparel photography and new-arrival products", caption: "Fashion storefront / Concept UI, demo products" },
      { src: "/work/clothing/collection-concept.webp", width: 1586, height: 992, alt: "Clothing collection concept with category, size, colour and price filters", caption: "Clothing collection / Fictional product catalogue" },
      { src: "/work/clothing/product-concept.webp", width: 1586, height: 992, alt: "Shirt product-detail concept with garment gallery, size, colour and quantity selectors", caption: "Product details / Demo variants and pricing" },
      { src: "/work/clothing/cart-concept.webp", width: 863, height: 1823, alt: "Mobile clothing cart concept with sample shirt and tee, selected sizes and order total", caption: "Mobile shopping bag / Demo cart" },
      { src: "/work/clothing/checkout-concept.webp", width: 1586, height: 992, alt: "Clothing checkout concept with empty contact and shipping fields and a disabled payment preview", caption: "Checkout / Visual preview, payments disabled" },
      { src: "/work/clothing/orders-concept.webp", width: 1586, height: 992, alt: "Clothing admin order-management concept with fictional customers, selected variants and fulfilment details", caption: "Order administration / Demo order records" },
    ],
    monogram: "CL", accent: "#405bea",
  },
  {
    ...projectDefaults, ownership: "PROSPERA Project", slug: "branding-festival-creatives",
    title: "Branding and Festival Creatives", industry: "Brand communication / Creative operations",
    categories: ["Creative & Branding", "UI/UX"],
    description: "Brand and festival creative concepts supported by an asset library, campaign calendar and message-scheduler design.",
    challenge: "Keep branded assets, campaign dates and customer messages organised so creative preparation and scheduling can be reviewed together.",
    solution: "Created a portfolio concept for managing posts, stories and brochures in one creative library. A campaign calendar and message-scheduler design connect asset selection, audience, preview, timezone and send time. Simulated activity records illustrate how drafts and queued messages could be reviewed; the previews do not send messages.",
    features: ["Branding, brochure and festival creative design", "Creative dashboard and asset library concept", "Social post, story and brochure organisation", "Campaign content calendar", "WhatsApp and email message scheduler concept", "Audience selection and message previews", "Timezone and scheduling controls", "Simulated message activity and status tracking"],
    coverImage: "/work/creatives/cover-concept.webp",
    mediaNote: "Generated portfolio concepts for the fictional CREATIVE DESK workspace. Creative thumbnails, campaigns, contacts, counts, dates and activity records are illustrative demo content. The dashboard and scheduler are design explorations, not production screenshots or evidence of deployed automation. No messaging accounts are connected and no messages are sent from these previews.",
    screenshots: [
      { src: "/work/creatives/dashboard-concept.webp", width: 1586, height: 992, alt: "Creative dashboard concept with sample asset counts, upcoming campaigns and recent festival creatives", caption: "Creative workspace / Concept UI, demo content" },
      { src: "/work/creatives/library-concept.webp", width: 1586, height: 992, alt: "Creative library concept with original demo posts, stories and brochure thumbnails and asset details", caption: "Creative library / Generated sample assets" },
      { src: "/work/creatives/calendar-concept.webp", width: 1586, height: 992, alt: "Content calendar concept showing illustrative campaign dates and a selected scheduled message", caption: "Campaign calendar / Demo schedules" },
      { src: "/work/creatives/scheduler-concept.webp", width: 1586, height: 992, alt: "Message scheduler concept with creative selection, WhatsApp and email options, audience, timezone and message preview", caption: "Automated message scheduler / Visual concept" },
      { src: "/work/creatives/activity-concept.webp", width: 1586, height: 992, alt: "Simulated message activity concept with queued, draft and skipped records and event details", caption: "Message activity / Simulated records, no messages sent" },
    ],
    monogram: "BC", accent: "#d4b44c",
  },
  {
    ...projectDefaults, ownership: "PROSPERA Project", slug: "stock-market-analyzer",
    title: "Stock Market Analyzer", industry: "Financial technology / Market analytics",
    categories: ["UI/UX"],
    description: "A market-analysis interface bringing price charts, trading activity and analytical views into one dashboard.",
    challenge: "Help users navigate several chart types and market summaries without losing the context of the instrument or view they are exploring.",
    solution: "Presented a landing page, candlestick and volume dashboard, and analytical chart views based on supplied project images. Additional watchlist, instrument-detail and heatmap concepts explore related journeys and are labelled separately from the supplied work. All displayed market data is simulated.",
    features: ["Market-analysis dashboard interface", "Candlestick and volume chart views", "Area, line, bar and allocation chart views", "Market overview panels"],
    coverImage: "/work/stock-market/cover-editorial.webp",
    mediaNote: "The first three visuals are enhanced restylings of supplied project images. The watchlist, instrument-detail and heatmap visuals are additional generated concepts, not verified shipped features. All displayed market prices, charts and changes are simulated, including any familiar ticker labels. They are neither live market information nor evidence of investment or project performance.",
    screenshots: [
      { src: "/work/stock-market/dashboard-restyled.webp", width: 1586, height: 992, alt: "Restyled stock analyzer dashboard with candlestick chart, volume bars, market panels and simulated data", caption: "Market dashboard / Restyled project visual, simulated data" },
      { src: "/work/stock-market/landing-restyled.webp", width: 1586, height: 992, alt: "Restyled PROSPERA Markets landing page with silver bull and emerald chart graphics", caption: "Product introduction / Restyled project visual" },
      { src: "/work/stock-market/analytics-restyled.webp", width: 1586, height: 992, alt: "Restyled market analytics interface with movement, allocation, comparison and activity charts using simulated data", caption: "Analytics overview / Restyled project visual, simulated data" },
      { src: "/work/stock-market/watchlist-concept.webp", width: 1586, height: 992, alt: "Additional generated watchlist concept with fictional instruments, sparklines and simulated market data", caption: "Watchlist / Additional generated concept" },
      { src: "/work/stock-market/instrument-concept.webp", width: 1586, height: 992, alt: "Additional generated instrument-detail concept for a fictional demonstration security", caption: "Instrument detail / Additional generated concept" },
      { src: "/work/stock-market/heatmap-concept.webp", width: 1586, height: 992, alt: "Additional generated market heatmap concept with fictional ticker tiles and simulated sector data", caption: "Market heatmap / Additional generated concept" },
    ],
    monogram: "SM", accent: "#23c795",
  },
  {
    ...projectDefaults, ownership: "PROSPERA Project", slug: "coffee-beans-online-store",
    title: "Coffee Beans Online Store", industry: "E-commerce / Coffee & beverages",
    categories: ["Websites", "UI/UX"],
    description: "A coffee storefront for discovering products and adding them to a cart, shown through supplied Brew Theory screens.",
    challenge: "Help shoppers move from discovering coffee to comparing products and starting a cart through a consistent storefront experience.",
    solution: "Presented the supplied Brew Theory homepage and product cards to show product discovery and add-to-cart entry points. Matching collection, product-option and mobile-cart concepts extend the visual journey and are identified as additional designs. Sales, payments and shipping outcomes have not been verified.",
    features: ["Coffee storefront and product discovery", "Product cards and add-to-cart entry points", "Matching catalogue-filter concept", "Product options and quantity-selection concept", "Mobile cart and order-summary concept"],
    coverImage: "/work/coffee/brew-theory/cover-supplied.webp",
    mediaNote: "The first three images are supplied Brew Theory screenshots, preserved at their original resolution. The collection, product-detail and mobile-cart images are additional generated design concepts based on those references, not verified delivered pages. Options, prices and totals in the additional concepts are demo values. The cover is a typeset composition using the supplied homepage screenshot. No sales, payment or shipping results are claimed.",
    screenshots: [
      { src: "/work/coffee/brew-theory/supplied-home.webp", width: 603, height: 375, alt: "Supplied Brew Theory homepage screenshot with coffee hero and navigation", caption: "Brew Theory homepage / Supplied screenshot" },
      { src: "/work/coffee/brew-theory/supplied-products-overview.webp", width: 563, height: 318, alt: "Supplied Brew Theory product-section screenshot with From Bean to Bliss heading", caption: "Homepage product section / Supplied screenshot" },
      { src: "/work/coffee/brew-theory/supplied-product-cards.webp", width: 564, height: 331, alt: "Supplied Brew Theory product cards showing Midnight Roast, Caramel Cloud and Velvet Mocha", caption: "Product cards / Supplied screenshot" },
      { src: "/work/coffee/brew-theory/catalogue-additional.webp", width: 1586, height: 992, alt: "Additional Brew Theory catalogue concept with matching products, filters and demo prices", caption: "Collection page / Additional concept, demo values" },
      { src: "/work/coffee/brew-theory/product-additional.webp", width: 1586, height: 992, alt: "Additional Midnight Roast product-page concept with sample size, grind and quantity controls", caption: "Product details / Additional concept, sample options" },
      { src: "/work/coffee/brew-theory/mobile-cart-additional.webp", width: 863, height: 1823, alt: "Additional Brew Theory mobile-cart concept with two products and an illustrative order summary", caption: "Mobile cart / Additional concept, payments disabled" },
    ],
    monogram: "CB", accent: "#b78a4b",
  },
];
export const ownershipLabel = (project: WorkProject) => project.ownership ?? "Ownership to be confirmed";
export const inCategory = (project: WorkProject, category: WorkCategory) => category === "All" || project.categories.includes(category);
// The existing gallery and case-study media slots share approved screenshots.
export const workAsset = (slug: string, view: "cover" | "desktop" | "mobile" = "cover") => {
  const project = workProjects.find(project => project.slug === slug);
  const index = view === "desktop" ? 1 : view === "mobile" ? 2 : 0;
  return (view === "cover" ? project?.coverImage : undefined) ?? project?.screenshots[index]?.src ?? project?.screenshots[0]?.src ?? "/work/screenshot-pending.svg";
};
