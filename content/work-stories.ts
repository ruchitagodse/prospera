export type ProjectJourney = { shot: number; label: string; audience: string; title: string; description: string; details: readonly string[] };
export type ProjectStory = {
  lead: string; purpose: string; approach: string;
  first: { label: string; tasks: readonly string[] }; second: { label: string; tasks: readonly string[] };
  hero: readonly [number, number]; heroLabel: string; mediaLabel: string; accent: string; dark: string;
  cta: string; journeys: readonly ProjectJourney[];
};
const steps = (items: readonly (readonly [number, string, string, string])[]): ProjectJourney[] => items.map(([shot, label, audience, description]) => ({ shot, label, audience, title: label, description, details: [] }));

export const projectStories: Record<string, ProjectStory> = {
  'school-attendance-management': {
    lead: 'A welcoming public presence. A connected school workspace.', purpose: 'Public information. Daily administration.',
    approach: 'The public website explains the trust’s work, while the administration portal organises student records and content. Each side supports a different audience within the same organisation.',
    first: { label: 'Public website', tasks: ['Explore the trust', 'Find student information', 'Make an enquiry'] }, second: { label: 'School workspace', tasks: ['Organise records', 'Manage galleries', 'Review daily operations'] },
    hero: [0,1], heroLabel: 'Website + administration', mediaLabel: 'Restyled concepts · demo content', accent: '#c0afd9', dark: '#24202d', cta: 'Discuss your school platform',
    journeys: steps([
      [0,'Discover the trust','For visitors','The public homepage brings the trust’s purpose and education information into a single starting point.'],
      [1,'Manage galleries','For administrators','Gallery-management forms and year-wise collections connect content preparation with the public website.'],
      [2,'Access the portal','For administrators','The sign-in concept introduces the student-record, attendance and gallery workspace.'],
      [3,'Present progress','For visitors','The progress-page concept organises illustrative learner records and activity information. Figures are demo content, not results.'],
      [4,'Support enquiries','For supporters','The donation concept shows how supporter details and contribution intent can be collected. Payment details are hidden and the preview cannot process payments.'],
      [5,'Review a student profile','For administrators','The student-information layout uses fictional imagery and hides personal details.'],
    ]),
  },
  'hrms': {
    lead: 'People, attendance and communication. In one workspace.', purpose: 'Employee clarity. HR coordination.',
    approach: 'Employee self-service and HR administration share the same workflow: record the workday, request leave and keep people informed as decisions move through review.',
    first: { label: 'Employee side', tasks: ['Record work sessions','Request leave','Find personal records'] }, second: { label: 'HR side', tasks: ['Review attendance','Coordinate approvals','Keep employees informed'] },
    hero: [0,6], heroLabel: 'Employee workspace + HR communication', mediaLabel: 'Restyled project visuals · demo data', accent: '#8ba9ff', dark: '#141c2b', cta: 'Discuss your HR workspace',
    journeys: steps([
      [0,'Start the workday','For employees','The dashboard combines announcements, work modes, session controls and review information.'],
      [1,'Enter the workspace','For employees','The sign-in interface presents email, Google and Microsoft entry points for the employee workspace.'],
      [2,'Review attendance','For employees and HR','A calendar overview connects attendance dates with individual session details.'],
      [3,'Request leave','For employees and reviewers','Leave type, dates, balances and approval information appear together before a request moves through manager and HR review.'],
      [4,'Find employee records','For employees','The profile groups employee information with employment, schedule, document and payslip access.'],
      [5,'Stay informed in-app','For employees','The notification centre brings announcements and task-review updates into the employee experience.'],
      [6,'Receive email updates','For employees','The automated leave-status email illustrates request details and review information using a fictional employee record.'],
    ]),
  },
  'sales-crm-webhooks': {
    lead: 'From the first enquiry to the right vehicle.', purpose: 'Customer conversations. Dealership operations.',
    approach: 'Vehicle discovery, enquiry handling and dealership administration are connected through lead records, stock information, follow-ups and communication workflows.',
    first: { label: 'Customer side', tasks: ['Explore a vehicle','Review specifications','Start an enquiry'] }, second: { label: 'Dealership side', tasks: ['Track leads','Manage inventory','Coordinate follow-ups'] },
    hero: [2,0], heroLabel: 'Vehicle discovery + dealership CRM', mediaLabel: 'Restyled project visuals · demo data', accent: '#8accc1', dark: '#142b28', cta: 'Discuss your sales platform',
    journeys: steps([
      [0,'Review the pipeline','For dealership teams','Lead tables, source charts and operational modules bring enquiry activity into the dealership dashboard.'],
      [1,'Access the CRM','For dealership teams','The sign-in experience introduces inventory, enquiries, finance, insurance and RTO management.'],
      [2,'Explore a vehicle','For customers','Vehicle photographs and specifications sit alongside call, WhatsApp and enquiry actions.'],
      [3,'Share vehicle details','For sales teams','Saved-contact selection and manual-number entry support sending a vehicle-details link through WhatsApp.'],
      [4,'Follow up automatically','For sales teams','Automated enquiry replies and webhook integrations connect customer communication to the sales workflow. The restyled conversation uses fictional demo content.'],
    ]),
  },
  'business-referral-listing': {
    lead: 'Discover a business. Build a connection. Follow the referral.', purpose: 'Business discovery. Referral visibility.',
    approach: 'A directory helps members find services; stories and posts give businesses a way to be seen. Separate commission and contribution-point views keep referral activity understandable.',
    first: { label: 'Member side', tasks: ['Discover services','Explore updates','Pass a referral'] }, second: { label: 'Business side', tasks: ['Present the offering','Follow referral activity','Review commissions and points'] },
    hero: [1,0], heroLabel: 'Business discovery + member network', mediaLabel: 'Restyled project visuals · demo data', accent: '#b0b4ef', dark: '#1b2036', cta: 'Discuss your business network',
    journeys: steps([
      [0,'Explore the network','For members','The home experience brings business updates, referral entry points and a network overview together.'],
      [1,'Find a business','For members','Search and filters help members explore listings and service information. Public visuals use fictional businesses.'],
      [2,'View a story','For businesses and members','The story-style viewer gives a business update its own visual space and enquiry entry point.'],
      [3,'Engage with a post','For businesses and members','Business posts combine imagery with likes, comments, sharing and referral controls.'],
      [4,'Review commissions','For members','The wallet presents commission balances, transaction context and withdrawal-request interfaces using sample values.'],
      [5,'Track contribution points','For members','Points, category totals and redemption controls are separate from monetary commissions. No conversion rate or earning guarantee is claimed.'],
    ]),
  },
  'fitness-application': {
    lead: 'One connected experience. From the gym floor to the front desk.', purpose: 'Two different needs. One considered experience.',
    approach: 'The approach connects the member journey with the work happening behind it. Each screen has a clear task, whether that is planning a session or reviewing a class schedule.',
    first: { label: 'Member side', tasks: ['Plan training','Book classes','Review activity'] }, second: { label: 'Gym side', tasks: ['Coordinate schedules','Organise memberships','Prepare reminders'] },
    hero: [0,1], heroLabel: 'Member app + gym administration', mediaLabel: 'Concept UI · sample data', accent: '#ee8d58', dark: '#171d18', cta: 'Discuss your fitness platform',
    journeys: steps([
      [2,'Plan a workout','For members','Workout plans and exercise logging put the training session in one focused mobile view.'],
      [3,'Book a class','For members','Members can explore dates, review available places and choose reminder preferences in the booking concept.'],
      [4,'Review activity','For members','Activity history and session goals bring previous training into one readable overview.'],
      [0,'Manage schedules','For gym teams','The admin workspace brings class schedules, coaches, bookings and capacity into a shared operational view.'],
      [5,'Organise memberships','For gym teams','A focused member workspace presents plans and renewal dates alongside the member record.'],
      [6,'Prepare reminders','Communication concept','Message templates explore class reminders, membership renewals and birthday offers in one workspace. These previews do not send messages.'],
    ]),
  },
  'salon-booking-automation': {
    lead: 'A smoother booking journey. A clearer day behind the chair.', purpose: 'Customer convenience. Salon coordination.',
    approach: 'The mobile booking journey is paired with a workspace for appointments, inventory and communication. The concepts show how the customer’s choice can fit the salon’s day.',
    first: { label: 'Customer side', tasks: ['Choose a service','Find a stylist and time','Review the booking'] }, second: { label: 'Salon side', tasks: ['Organise appointments','Review stock','Prepare customer messages'] },
    hero: [0,1], heroLabel: 'Customer booking + salon workspace', mediaLabel: 'Concept UI · sample data', accent: '#e9b0bc', dark: '#302127', cta: 'Discuss your salon platform',
    journeys: steps([
      [1,'Discover services','For customers','The mobile home introduces salon services and a clear entry point into booking.'],
      [2,'Choose an appointment','For customers','The booking concept connects stylist selection with dates and available times.'],
      [5,'Review a booking','For customers','The confirmation concept summarises the appointment and provides rescheduling entry points.'],
      [0,'Coordinate the day','For salon teams','A calendar workspace brings customer bookings and selected appointment details into one view.'],
      [3,'Manage inventory','For salon teams','The inventory concept presents product quantities, low-stock indicators and reorder details.'],
      [4,'Prepare automation','Communication concept','Confirmation, reminder and birthday-offer rules are shown with template and opt-in controls.'],
      [6,'Preview a message','Communication concept','A fictional WhatsApp conversation illustrates confirmation and birthday-offer messages. The preview does not send messages.'],
    ]),
  },
  'clothing-online-store': {
    lead: 'From finding a style to preparing the order.', purpose: 'A considered storefront. An organised order journey.',
    approach: 'The collection, product and shopping-bag concepts share a consistent journey. The staff-side order view carries selected sizes and colours into fulfilment planning.',
    first: { label: 'Shopper side', tasks: ['Explore the collection','Choose size and colour','Review the shopping bag'] }, second: { label: 'Store side', tasks: ['Review order details','Check selected variants','Prepare fulfilment'] },
    hero: [0,3], heroLabel: 'Fashion storefront + mobile shopping bag', mediaLabel: 'Concept UI · demo products', accent: '#9db4ff', dark: '#19243a', cta: 'Discuss your online store',
    journeys: steps([
      [0,'Discover the collection','For shoppers','The storefront introduces the clothing range through editorial imagery and product entry points.'],
      [1,'Find the right product','For shoppers','Category, size, colour and price filters narrow the collection around the shopper’s preferences.'],
      [2,'Choose the details','For shoppers','Garment imagery appears alongside size, colour and quantity selection.'],
      [3,'Review the shopping bag','For shoppers','The mobile bag presents chosen products, variants, quantities and an illustrative order summary.'],
      [4,'Explore checkout','For shoppers','Contact and shipping forms show the next step. The payment preview is disabled.'],
      [5,'Prepare an order','For store teams','The admin concept presents order records, garment variants and fulfilment details using fictional data.'],
    ]),
  },
  'branding-festival-creatives': {
    lead: 'Create with consistency. Plan with context.', purpose: 'Creative expression. Campaign organisation.',
    approach: 'Posts, stories and brochures share a creative library. Calendar and message-preparation concepts place the asset alongside its audience and planned send time.',
    first: { label: 'Creative side', tasks: ['Organise brand assets','Prepare posts and stories','Review creative material'] }, second: { label: 'Campaign side', tasks: ['Plan dates','Select an audience','Prepare scheduled messages'] },
    hero: [0,3], heroLabel: 'Creative workspace + campaign planning', mediaLabel: 'Design concepts · demo campaigns', accent: '#e3ca7e', dark: '#28261c', cta: 'Discuss your creative workflow',
    journeys: steps([
      [0,'Open the creative desk','For creative teams','The dashboard brings creative assets, recent material and upcoming campaign information together.'],
      [1,'Explore the library','For creative teams','The library groups sample posts, stories and brochure designs with their asset details.'],
      [2,'Plan the calendar','For campaign teams','The calendar connects illustrative campaign dates with a selected message and schedule.'],
      [3,'Prepare a message','Scheduling concept','Creative selection, WhatsApp or email, audience, timezone and preview controls are presented together.'],
      [4,'Review message activity','Scheduling concept','Simulated queued, draft and skipped records show how preparation could be reviewed. No messages are sent.'],
    ]),
  },
  'stock-market-analyzer': {
    lead: 'A clearer view of a complex market.', purpose: 'Market context. Focused analysis.',
    approach: 'The supplied project visuals bring charting and analytical views into one experience. Additional concepts explore a watchlist, instrument view and heatmap, separately from verified project features.',
    first: { label: 'Overview', tasks: ['Explore market panels','Compare chart views','Keep activity in context'] }, second: { label: 'Detail exploration', tasks: ['Review an instrument','Organise a watchlist','Explore sector patterns'] },
    hero: [0,2], heroLabel: 'Market dashboard + analytical views', mediaLabel: 'Restyled visuals · simulated data', accent: '#79d8b7', dark: '#122b23', cta: 'Discuss your analytics interface',
    journeys: steps([
      [0,'Explore the dashboard','Restyled project visual','Candlestick and volume charts appear alongside market panels. All displayed values are simulated.'],
      [1,'Introduce the product','Restyled project visual','The supplied landing-page design introduces the PROSPERA Markets identity and chart imagery.'],
      [2,'Compare analytical views','Restyled project visual','Area, line, bar and allocation views present different analytical perspectives using simulated data.'],
      [3,'Review a watchlist','Additional design concept','The watchlist exploration groups fictional instruments, sample changes and sparklines.'],
      [4,'Focus on an instrument','Additional design concept','The detail exploration shows a dedicated analysis view for a fictional demonstration security.'],
      [5,'Explore the heatmap','Additional design concept','Fictional ticker tiles and simulated sector data explore a wider view. These additional screens are not verified shipped features.'],
    ]),
  },
  'coffee-beans-online-store': {
    lead: 'From discovering the blend to starting the cart.', purpose: 'Product discovery. A consistent shopping journey.',
    approach: 'The supplied Brew Theory homepage and product cards anchor the story. Additional catalogue, product and mobile-cart concepts explore the next steps without presenting them as verified delivered pages.',
    first: { label: 'Coffee discovery', tasks: ['Explore the storefront','Compare product cards','Find a blend'] }, second: { label: 'Shopping exploration', tasks: ['Review product options','Choose a quantity','Review a sample cart'] },
    hero: [0,5], heroLabel: 'Coffee storefront + mobile cart concept', mediaLabel: 'Supplied screenshots + concepts', accent: '#e3b77f', dark: '#30231a', cta: 'Discuss your coffee storefront',
    journeys: steps([
      [0,'Discover the storefront','Supplied screenshot','The supplied homepage introduces Brew Theory through its coffee hero and storefront navigation.'],
      [1,'Explore featured products','Supplied screenshot','The homepage section introduces the range under the From Bean to Bliss heading.'],
      [2,'Compare product cards','Supplied screenshot','The supplied cards show Midnight Roast, Caramel Cloud and Velvet Mocha with add-to-cart entry points.'],
      [3,'Explore a collection','Additional design concept','The collection exploration adds product browsing and filters with matching visual language and demo values.'],
      [4,'Review product options','Additional design concept','The product-page exploration shows sample size, grind and quantity controls.'],
      [5,'Review the mobile cart','Additional design concept','Sample products and an illustrative summary show a mobile cart. No payment or shipping outcome is claimed.'],
    ]),
  },
};
