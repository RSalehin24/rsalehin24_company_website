export type Lang = "en" | "bn";
export const pageKeys = ["home", "services", "products", "about", "contact", "privacy"] as const;
export type PageKey = typeof pageKeys[number];
export const company = {
  "name": "RSalehin24",
  "domain": "https://www.rsalehin24.me",
  "email": "mail@rsalehin24.me",
  "phone": "+8801608537383",
  "address": {
    "en": "FLAT 2A, HOUSE 112, ARMAN KHAN GOLI, ROAD 9/A, SANKAR, WEST DHANMONDI, DHANMONDI, DHAKA - 1209",
    "bn": "ফ্ল্যাট ২এ, হাউস ১১২, আরমান খান গলি, রোড ৯/এ, শংকর, পশ্চিম ধানমন্ডি, ধানমন্ডি, ঢাকা - ১২০৯"
  },
  "readerUrl": "https://ereader.rsalehin24.me"
} as const;
export const content = {
  "en": {
    "nav": {
      "home": "Home",
      "services": "Services",
      "products": "Products",
      "about": "About",
      "contact": "Contact",
      "privacy": "Privacy"
    },
    "meta": {
      "home": [
        "Websites, software & automation in Dhaka | RSalehin24",
        "RSalehin24 builds business websites, custom web applications and workflow automation for clients in Dhaka and across Bangladesh. Discuss your project."
      ],
      "services": [
        "Business websites & custom software services | RSalehin24",
        "Business websites, custom web applications and workflow automation built around your work. Explore RSalehin24 software services in Dhaka, Bangladesh."
      ],
      "products": [
        "EPUB Reader, eLibrary & upcoming products | RSalehin24",
        "Explore the RSalehin24 EPUB Reader, Bengali eLibrary in deployment, and planned Personal Financial Management product. See features and current stages."
      ],
      "about": [
        "About our Dhaka software business | RSalehin24",
        "RSalehin24 is a Dhaka-based software business creating websites, reading tools and workflow automation. Learn about our products and approach to development."
      ],
      "contact": [
        "Discuss your website or software project | RSalehin24",
        "Contact RSalehin24 in Dhaka for a business website, custom software or workflow automation. Email mail@rsalehin24.me or call +8801608537383."
      ],
      "privacy": [
        "Inquiry privacy notice | RSalehin24",
        "Learn how RSalehin24 uses project inquiry details and attachments, how email delivery providers process submissions, and how to ask about your data."
      ]
    },
    "ui": {
      "skip": "Skip to content",
      "menu": "Menu",
      "closeMenu": "Close menu",
      "navLabel": "Main navigation",
      "language": "বাংলা — এই পাতার বাংলা সংস্করণ",
      "footerText": "Thoughtful websites, software and automation. Built in Dhaka, for businesses across Bangladesh.",
      "footerContact": "Start a conversation",
      "footerLocation": "Dhaka, Bangladesh",
      "copyright": "RSalehin24",
      "servicesLink": "Explore services",
      "productsLink": "Explore all products",
      "discuss": "Discuss your project",
      "learn": "Learn more",
      "readerLink": "Open EPUB Reader",
      "inquiry": "Discuss this service",
      "planned": "Planned capabilities",
      "features": "Features",
      "processLabel": "OUR PROCESS",
      "serviceLabel": "WHAT WE DO",
      "productLabel": "OUR PRODUCTS",
      "aboutLabel": "ABOUT RSALEHIN24",
      "contactLabel": "LET’S TALK",
      "privacyLabel": "YOUR INFORMATION",
      "photoCredit": "Photography: Clayton Chase / Unsplash",
      "photoAlt": "A quiet lake bordered by dense evergreen forest climbing a green hillside.",
      "notfoundTitle": "This page took a different path.",
      "notfoundText": "The page you’re looking for could not be found. You can return home or contact us about your project.",
      "backHome": "Return home",
      "notfoundMeta": "Page not found | RSalehin24"
    },
    "home": {
      "eyebrow": "SOFTWARE, WITH PURPOSE",
      "title": "Built for the way",
      "accent": "your business works.",
      "intro": "Business websites, custom software and workflow automation. Thoughtfully built in Dhaka, for businesses across Bangladesh.",
      "secondary": "Explore our services",
      "note": "From the first conversation to a practical handover.",
      "imageNote": "Clarity. Care. Room to grow.",
      "servicesTitle": "Good technology starts with",
      "servicesAccent": "a real business need.",
      "servicesIntro": "Make your business easier to find, your information easier to use, and everyday work easier to manage.",
      "productsTitle": "Ideas, put into practice.",
      "productsIntro": "Our own products reflect the same care we bring to your project: useful features, considered interfaces and a clear purpose.",
      "processTitle": "A clear path from",
      "processAccent": "idea to everyday use."
    },
    "services": {
      "title": "Software that makes",
      "accent": "work work better.",
      "intro": "Whether you need a clearer online presence or a better way to run daily operations, we start with the work your business needs to do.",
      "benefitLabel": "What this can help you do",
      "fitLabel": "A good fit for",
      "ctaTitle": "Tell us what’s getting in your way.",
      "ctaText": "An idea, a repeated task or a system you’ve outgrown is a useful place to start."
    },
    "serviceItems": [
      {
        "id": "websites",
        "title": "Business websites",
        "short": "A clear, credible home for your business online.",
        "description": "Give customers a straightforward way to understand your business, explore your services and get in touch. We build responsive websites with clear content and a foundation for search visibility.",
        "benefits": [
          "Present your services clearly on phones and desktops",
          "Turn interest into inquiries with direct contact paths",
          "Keep core content readable and easy to update"
        ],
        "fit": "Service businesses, company websites and product introductions."
      },
      {
        "id": "applications",
        "title": "Custom web applications",
        "short": "Software shaped around how your business operates.",
        "description": "Bring information, tasks and access into one application designed for your workflow. From searchable catalogs to internal tools, the interface follows your business process.",
        "benefits": [
          "Organize business information in one place",
          "Give people the access and tools their role needs",
          "Replace disconnected spreadsheets with a defined workflow"
        ],
        "fit": "Internal operations, catalogs, portals and business management tools."
      },
      {
        "id": "automation",
        "title": "Workflow automation",
        "short": "Less repetition. More time for the work that matters.",
        "description": "Connect the steps you repeat every day. We design automation around your existing process, including data processing, document creation and background tasks.",
        "benefits": [
          "Reduce repeated data entry and manual processing",
          "Move routine jobs into consistent background workflows",
          "Make progress and exceptions easier to track"
        ],
        "fit": "Recurring data tasks, document workflows and connected business systems."
      }
    ],
    "products": {
      "title": "Small ideas.",
      "accent": "Practical possibilities.",
      "intro": "Reading, knowledge and everyday finance. Explore our products and see where each one stands.",
      "stageNote": "Product stages are shown openly. Planned capabilities describe the intended direction of a product.",
      "ctaTitle": "Have a different problem to solve?",
      "ctaText": "We can bring the same practical approach to a website or application for your business."
    },
    "productItems": [
      {
        "id": "epub-reader",
        "name": "EPUB Reader",
        "category": "READING, MADE PERSONAL",
        "status": "Available online",
        "stage": "live",
        "description": "Open EPUB books directly in your browser, find your place with chapter navigation, and make the reading experience your own.",
        "features": [
          "Chapter navigation and a table of contents",
          "Adjustable text size and White, Sepia or Night themes",
          "Keyboard and touch controls for desktop and mobile"
        ],
        "note": "Read on your phone, tablet or desktop."
      },
      {
        "id": "elibrary",
        "name": "eLibrary",
        "category": "A HOME FOR BENGALI BOOKS",
        "status": "Deployment in progress",
        "stage": "deployment",
        "description": "A Bengali ebook platform for creating and organizing EPUB and HTML books, finding titles and reading in the browser.",
        "features": [
          "Ebook creation with chapters and table of contents",
          "Searchable catalog and category organization",
          "Browser reading and per-book access management"
        ],
        "note": "Deployment is in progress. A public link will be added when it is ready."
      },
      {
        "id": "personal-finance",
        "name": "Personal Financial Management",
        "category": "EVERYDAY FINANCE, CONNECTED",
        "status": "Inception stage",
        "stage": "inception",
        "description": "A planned product intended to bring automatic transaction tracking, personal financial management and tax tracking and calculation into one place.",
        "features": [
          "Planned automatic transaction tracking and reconciliation",
          "Planned organization of income, expenses, accounts and savings",
          "Planned tax tracking, calculation and planning tools"
        ],
        "note": "At inception stage. These capabilities are intended and are not yet available."
      }
    ],
    "process": [
      {
        "title": "Discovery",
        "text": "Understand your business, your users and the problem worth solving."
      },
      {
        "title": "Design",
        "text": "Shape the content, interface and workflow before building the details."
      },
      {
        "title": "Development",
        "text": "Build the agreed solution and check how it works across real use cases."
      },
      {
        "title": "Handover",
        "text": "Walk through the finished work and explain how to use and maintain it."
      }
    ],
    "about": {
      "title": "Rooted in Dhaka.",
      "accent": "Focused on useful work.",
      "intro": "RSalehin24 is a software business based in Dhaka, Bangladesh. We build business websites, custom applications and automation with a practical question in mind: how will this help someone do their work?",
      "heading": "Built on hands-on product work.",
      "text": "Our projects include a browser-based EPUB Reader and a Bengali eLibrary platform. They bring together reading interfaces, searchable information, access management and automated processing. That work informs how we approach business software.",
      "heading2": "Clear decisions. Considered details.",
      "text2": "A good project begins with understanding the people who will use it. We work from a defined problem, keep the scope understandable, and give content and usability the same attention as the code.",
      "principles": [
        {
          "title": "Start with the problem",
          "text": "Understand what needs to change before deciding what to build."
        },
        {
          "title": "Make it usable",
          "text": "Give people clear content, straightforward navigation and accessible interfaces."
        },
        {
          "title": "Plan for handover",
          "text": "Make the finished work understandable for the people who will use and maintain it."
        }
      ],
      "link": "See our product work",
      "ctaTitle": "Let’s build something useful.",
      "ctaText": "Tell us about your business and what you want your website or software to help you do."
    },
    "contact": {
      "title": "Your next chapter",
      "accent": "starts with a conversation.",
      "intro": "Tell us about your business, the work you want to improve, or the idea you’re ready to explore.",
      "directTitle": "Contact us directly",
      "emailLabel": "Email",
      "phoneLabel": "Phone",
      "addressLabel": "Address",
      "formTitle": "Send us an email",
      "formIntro": "Write to mail@rsalehin24.me directly from this form. You can attach a document or image.",
      "unconfiguredTitle": "Let’s start by email or phone.",
      "unconfiguredText": "Send a little about your business, the service you’re interested in, and what you’d like to achieve.",
      "emailCta": "Open your email app",
      "gmailCta": "Open Gmail",
      "gmailNewTab": "(opens in a new tab)",
      "emailSubject": "RSalehin24 project inquiry",
      "phoneCta": "Call us",
      "copyEmail": "Copy email",
      "emailHelp": "Or copy our email address.",
      "emailCopied": "Email address copied. Paste it into your email service to send your project details.",
      "copyEmailError": "Copying is unavailable. The email address is selected; copy it manually and paste it into your email service.",
      "required": "Fields marked * are required.",
      "name": "Name",
      "email": "Your email (for replies)",
      "company": "Company (optional)",
      "phone": "Phone (optional)",
      "service": "Service interest",
      "servicePlaceholder": "Choose a service",
      "otherService": "Something else / Not sure yet",
      "subject": "Subject",
      "message": "Message",
      "messageHint": "What do you want to build or improve? Please avoid sharing passwords or sensitive financial information.",
      "attachment": "Attachment (optional)",
      "attachmentHint": "One document, Excel spreadsheet, text/Markdown file or image. Maximum 5 MB.",
      "attachmentArchiveHint": "Some file types or filenames arrive inside a ZIP attachment, preserving the original filename and contents.",
      "attachmentLinks": "Your file will be shared with us as a download link.",
      "fileSizeError": "Choose a file no larger than 5 MB.",
      "fileTypeError": "Choose a supported document, Excel, text/Markdown or image file with a simple filename.",
      "fileEmptyError": "This file is empty. Please choose another file.",
      "challengeLabel": "Spam protection",
      "challengeError": "Please complete the spam check. If it cannot load, contact us by email or phone.",
      "rateError": "Too many attempts. Please wait a moment and try again. Your message and attachment are still here.",
      "submit": "Send email",
      "privacyBefore": "We use your details to respond to your inquiry.",
      "brevoNotice": "Cloudflare and Brevo process the message and attachment. Read our",
      "formspreeNotice": "Formspree processes the message and file. Read our",
      "privacyLink": "privacy notice",
      "privacyAfter": ".",
      "nojs": "This form also works without JavaScript. Formspree will show its confirmation page after submission.",
      "nojsBrevo": "Sending from this form needs JavaScript for the spam check. You can email mail@rsalehin24.me or call +8801608537383 instead.",
      "invalid": "Please check the highlighted fields before sending.",
      "requiredError": "Please complete this field.",
      "emailError": "Please enter a valid email address.",
      "tooLongError": "Please shorten this field to the allowed length.",
      "progress": "Sending your inquiry…",
      "success": "Your inquiry was accepted. Thank you for getting in touch.",
      "referenceLabel": "Inquiry reference",
      "error": "We could not confirm your email was sent. Your message and attachment are still here. Please try again, or contact us by email or phone.",
      "sending": "Sending…"
    },
    "privacy": {
      "title": "Your information,",
      "accent": "handled with care.",
      "intro": "This notice explains what happens when you contact RSalehin24 about a project.",
      "sections": [
        {
          "heading": "Information you share",
          "text": "When the contact form is available, it asks for your name, reply email, service interest, email subject and message. Company, phone and one attachment are optional. We receive the filename and contents of a file you choose to submit. If you email or call directly, we receive the information you choose to share through that channel."
        },
        {
          "heading": "Why we use it",
          "text": "We use your inquiry details to respond, understand your project and communicate about potential work. We do not use the inquiry form to subscribe you to a marketing list."
        },
        {
          "heading": "Hosting, cookies and analytics",
          "text": "This static website is hosted on GitHub Pages. The hosting provider may process request information to serve and protect the site. We do not add analytics, advertising trackers or browser storage in this release. If you visit a linked product or external service, its own practices apply."
        },
        {
          "heading": "Keeping and removing inquiries",
          "text": "Inquiry correspondence is kept for responding and following up on a project. You can email us to ask about your information or request its correction or deletion. We will consider the request alongside any records that need to be retained for ongoing work."
        },
        {
          "heading": "Contact about privacy",
          "text": "For questions about this notice or your inquiry information, email mail@rsalehin24.me."
        }
      ],
      "processingHeading": "How the form is processed",
      "brevoProcessing": "When enabled with Cloudflare and Brevo, the form sends your message and optional attachment through a Cloudflare Worker to Brevo, which sends an email to mail@rsalehin24.me. Cloudflare stores a daily count to generate your dated inquiry reference; it does not save your name, email, message or attachment in that counter. Brevo and our email provider may retain message data under their own policies. Cloudflare Turnstile processes technical information, such as IP addresses and browser information, to prevent spam. Message text and file contents are sent only when you submit the form.",
      "formspreeProcessing": "When enabled with Formspree, the form sends your message and optional file to Formspree. It forwards the message and a file download link to our email and stores submissions and files under its account settings. Its service may process technical information, such as IP addresses, for delivery and spam prevention. Message text and file contents are sent only when you submit the form.",
      "providerLabel": "Formspree privacy policy",
      "brevoLabel": "Brevo privacy policy",
      "cloudflareLabel": "Cloudflare privacy policy",
      "hostLabel": "GitHub privacy statement"
    }
  },
  "bn": {
    "nav": {
      "home": "হোম",
      "services": "সেবা",
      "products": "পণ্য",
      "about": "আমাদের সম্পর্কে",
      "contact": "যোগাযোগ",
      "privacy": "গোপনীয়তা"
    },
    "meta": {
      "home": [
        "ঢাকায় ওয়েবসাইট, সফটওয়্যার ও অটোমেশন | RSalehin24",
        "ঢাকা ও বাংলাদেশের ব্যবসার জন্য ওয়েবসাইট, কাস্টম ওয়েব অ্যাপ্লিকেশন এবং কাজের অটোমেশন তৈরি করে RSalehin24। আপনার প্রকল্প নিয়ে কথা বলুন।"
      ],
      "services": [
        "ব্যবসায়িক ওয়েবসাইট ও কাস্টম সফটওয়্যার সেবা | RSalehin24",
        "আপনার ব্যবসার কাজ অনুযায়ী ওয়েবসাইট, কাস্টম ওয়েব অ্যাপ্লিকেশন এবং অটোমেশন। ঢাকা, বাংলাদেশে RSalehin24-এর সফটওয়্যার সেবা সম্পর্কে জানুন।"
      ],
      "products": [
        "EPUB Reader, eLibrary ও আসন্ন পণ্য | RSalehin24",
        "RSalehin24-এর EPUB Reader, স্থাপনের কাজ চলমান বাংলা eLibrary এবং পরিকল্পনাধীন ব্যক্তিগত অর্থ ব্যবস্থাপনা পণ্যের বৈশিষ্ট্য ও বর্তমান অবস্থা জানুন।"
      ],
      "about": [
        "ঢাকাভিত্তিক সফটওয়্যার ব্যবসা সম্পর্কে | RSalehin24",
        "RSalehin24 ঢাকাভিত্তিক একটি সফটওয়্যার ব্যবসা। আমরা ওয়েবসাইট, বই পড়ার সরঞ্জাম এবং কাজের অটোমেশন তৈরি করি। আমাদের পণ্য ও কাজের পদ্ধতি জানুন।"
      ],
      "contact": [
        "আপনার ওয়েবসাইট বা সফটওয়্যার প্রকল্প নিয়ে কথা বলুন | RSalehin24",
        "ব্যবসায়িক ওয়েবসাইট, কাস্টম সফটওয়্যার বা অটোমেশনের জন্য ঢাকায় RSalehin24-এর সঙ্গে যোগাযোগ করুন। ইমেইল mail@rsalehin24.me অথবা ফোন +8801608537383।"
      ],
      "privacy": [
        "প্রকল্পের অনুসন্ধান ও গোপনীয়তা | RSalehin24",
        "প্রকল্পের অনুসন্ধান ও সংযুক্তি কীভাবে ব্যবহার করে RSalehin24, ইমেইল সেবাদাতার ভূমিকা এবং তথ্য সম্পর্কে যোগাযোগের উপায় জানুন।"
      ]
    },
    "ui": {
      "skip": "মূল বিষয়বস্তুতে যান",
      "menu": "মেনু",
      "closeMenu": "মেনু বন্ধ করুন",
      "navLabel": "মূল নেভিগেশন",
      "language": "English — read this page in English",
      "footerText": "সুযত্নে তৈরি ওয়েবসাইট, সফটওয়্যার ও অটোমেশন। ঢাকা থেকে, বাংলাদেশের ব্যবসার জন্য।",
      "footerContact": "কথা শুরু করুন",
      "footerLocation": "ঢাকা, বাংলাদেশ",
      "copyright": "RSalehin24।",
      "servicesLink": "সেবাগুলো দেখুন",
      "productsLink": "সব পণ্য দেখুন",
      "discuss": "আপনার প্রকল্প নিয়ে কথা বলুন",
      "learn": "আরও জানুন",
      "readerLink": "EPUB Reader খুলুন",
      "inquiry": "এই সেবা নিয়ে কথা বলুন",
      "planned": "পরিকল্পিত সুবিধা",
      "features": "বৈশিষ্ট্য",
      "processLabel": "আমাদের কাজের ধাপ",
      "serviceLabel": "আমাদের সেবা",
      "productLabel": "আমাদের পণ্য",
      "aboutLabel": "RSALEHIN24 সম্পর্কে",
      "contactLabel": "আসুন কথা বলি",
      "privacyLabel": "আপনার তথ্য",
      "photoCredit": "ছবি: Clayton Chase / Unsplash",
      "photoAlt": "সবুজ পাহাড়ের ঢালজুড়ে ঘন চিরসবুজ বন, তার পাশে শান্ত একটি হ্রদ।",
      "notfoundTitle": "পাতাটি খুঁজে পাওয়া যায়নি।",
      "notfoundText": "আপনি যে পাতাটি খুঁজছেন তা পাওয়া যায়নি। হোমে ফিরে যেতে পারেন বা আপনার প্রকল্প নিয়ে আমাদের সঙ্গে যোগাযোগ করতে পারেন।",
      "backHome": "হোমে ফিরুন",
      "notfoundMeta": "পাতাটি পাওয়া যায়নি | RSalehin24"
    },
    "home": {
      "eyebrow": "প্রয়োজন বুঝে সফটওয়্যার",
      "title": "আপনার ব্যবসার কাজ",
      "accent": "যেভাবে এগিয়ে চলে।",
      "intro": "ব্যবসায়িক ওয়েবসাইট, কাস্টম সফটওয়্যার ও কাজের অটোমেশন। ঢাকা থেকে সুযত্নে তৈরি, বাংলাদেশের ব্যবসার জন্য।",
      "secondary": "আমাদের সেবা দেখুন",
      "note": "প্রথম আলোচনা থেকে ব্যবহার বুঝিয়ে দেওয়া পর্যন্ত।",
      "imageNote": "স্বচ্ছতা। যত্ন। এগিয়ে যাওয়ার সুযোগ।",
      "servicesTitle": "ভালো প্রযুক্তির শুরু",
      "servicesAccent": "ব্যবসার প্রকৃত প্রয়োজন থেকে।",
      "servicesIntro": "ব্যবসাকে খুঁজে পাওয়া, তথ্য ব্যবহার করা এবং প্রতিদিনের কাজ পরিচালনা করা সহজ করুন।",
      "productsTitle": "ভাবনা থেকে বাস্তব কাজে।",
      "productsIntro": "নিজেদের পণ্যেও আমরা একই যত্ন রাখি: দরকারি সুবিধা, ভেবেচিন্তে তৈরি ইন্টারফেস এবং পরিষ্কার উদ্দেশ্য।",
      "processTitle": "ভাবনা থেকে নিয়মিত ব্যবহারে",
      "processAccent": "একটি পরিষ্কার পথ।"
    },
    "services": {
      "title": "সফটওয়্যার, যা কাজকে",
      "accent": "আরও সহজ করে।",
      "intro": "অনলাইনে ব্যবসাকে স্পষ্টভাবে তুলে ধরা হোক বা দৈনন্দিন কাজের উন্নতি—আপনার ব্যবসার প্রয়োজন বুঝে আমরা কাজ শুরু করি।",
      "benefitLabel": "যে কাজে সাহায্য করতে পারে",
      "fitLabel": "যাদের জন্য উপযোগী",
      "ctaTitle": "কোথায় কাজ আটকে যাচ্ছে, বলুন।",
      "ctaText": "একটি ভাবনা, বারবার করা কোনো কাজ বা পুরোনো হয়ে যাওয়া একটি সিস্টেম—যেকোনোটি দিয়ে আলোচনা শুরু করা যায়।"
    },
    "serviceItems": [
      {
        "id": "websites",
        "title": "ব্যবসায়িক ওয়েবসাইট",
        "short": "অনলাইনে আপনার ব্যবসার পরিষ্কার ও বিশ্বাসযোগ্য পরিচয়।",
        "description": "গ্রাহককে আপনার ব্যবসা বুঝতে, সেবা দেখতে এবং যোগাযোগ করতে সহজ পথ দিন। আমরা মোবাইল ও ডেস্কটপের উপযোগী ওয়েবসাইট তৈরি করি, যেখানে স্পষ্ট বিষয়বস্তু ও সার্চে খুঁজে পাওয়ার ভিত্তি থাকে।",
        "benefits": [
          "মোবাইল ও ডেস্কটপে সেবা স্পষ্টভাবে তুলে ধরুন",
          "সহজ যোগাযোগের মাধ্যমে আগ্রহকে অনুসন্ধানে রূপ দিন",
          "মূল বিষয়বস্তু সহজপাঠ্য ও হালনাগাদের উপযোগী রাখুন"
        ],
        "fit": "সেবাভিত্তিক ব্যবসা, কোম্পানির পরিচিতি ও পণ্যের উপস্থাপনা।"
      },
      {
        "id": "applications",
        "title": "কাস্টম ওয়েব অ্যাপ্লিকেশন",
        "short": "আপনার ব্যবসার কাজ অনুযায়ী তৈরি সফটওয়্যার।",
        "description": "তথ্য, কাজ ও ব্যবহারকারীর অনুমতি এক অ্যাপ্লিকেশনে আনুন। সার্চযোগ্য ক্যাটালগ থেকে অভ্যন্তরীণ টুল—ইন্টারফেস তৈরি হবে আপনার ব্যবসার কাজের ধাপ অনুযায়ী।",
        "benefits": [
          "ব্যবসার তথ্য এক জায়গায় গুছিয়ে রাখুন",
          "দায়িত্ব অনুযায়ী ব্যবহারকারীর সুবিধা ও অনুমতি দিন",
          "ছড়িয়ে থাকা স্প্রেডশিটের বদলে নির্দিষ্ট কাজের ধাপ তৈরি করুন"
        ],
        "fit": "অভ্যন্তরীণ পরিচালনা, ক্যাটালগ, পোর্টাল ও ব্যবসা ব্যবস্থাপনার সরঞ্জাম।"
      },
      {
        "id": "automation",
        "title": "কাজের অটোমেশন",
        "short": "একই কাজের পুনরাবৃত্তি কমিয়ে দরকারি কাজে সময় দিন।",
        "description": "প্রতিদিন বারবার করা কাজের ধাপগুলো যুক্ত করুন। আপনার চলমান প্রক্রিয়া অনুযায়ী তথ্য প্রক্রিয়াকরণ, নথি তৈরি ও পেছনে চলা নিয়মিত কাজের অটোমেশন তৈরি করি।",
        "benefits": [
          "বারবার তথ্য লেখা ও হাতে প্রক্রিয়াকরণ কমান",
          "নিয়মিত কাজ নির্দিষ্ট পদ্ধতিতে স্বয়ংক্রিয়ভাবে চালান",
          "কাজের অগ্রগতি ও ব্যতিক্রম সহজে অনুসরণ করুন"
        ],
        "fit": "নিয়মিত তথ্যের কাজ, নথি তৈরির প্রক্রিয়া ও সংযুক্ত ব্যবসায়িক সিস্টেম।"
      }
    ],
    "products": {
      "title": "ছোট ভাবনা।",
      "accent": "বাস্তব সম্ভাবনা।",
      "intro": "পড়া, জ্ঞান ও প্রতিদিনের অর্থ ব্যবস্থাপনা। আমাদের পণ্যগুলো দেখুন এবং প্রতিটির বর্তমান অবস্থা জানুন।",
      "stageNote": "পণ্যের বর্তমান অবস্থা স্পষ্টভাবে দেখানো হয়েছে। পরিকল্পিত সুবিধাগুলো পণ্যের ভবিষ্যৎ উদ্দেশ্য বোঝায়।",
      "ctaTitle": "অন্য কোনো সমস্যার সমাধান খুঁজছেন?",
      "ctaText": "একই বাস্তবমুখী পদ্ধতিতে আপনার ব্যবসার ওয়েবসাইট বা অ্যাপ্লিকেশন তৈরি করা যেতে পারে।"
    },
    "productItems": [
      {
        "id": "epub-reader",
        "name": "EPUB Reader",
        "category": "নিজের মতো করে পড়ুন",
        "status": "অনলাইনে ব্যবহারযোগ্য",
        "stage": "live",
        "description": "ব্রাউজারেই EPUB বই খুলুন, অধ্যায়ের তালিকা থেকে পছন্দের অংশে যান এবং পড়ার পরিবেশ নিজের মতো সাজিয়ে নিন।",
        "features": [
          "অধ্যায়ে যাওয়ার সুবিধা ও সূচিপত্র",
          "লেখার আকার পরিবর্তন এবং White, Sepia বা Night থিম",
          "ডেস্কটপ ও মোবাইলে কিবোর্ড এবং টাচ নিয়ন্ত্রণ"
        ],
        "note": "ফোন, ট্যাবলেট বা ডেস্কটপে পড়ুন।"
      },
      {
        "id": "elibrary",
        "name": "eLibrary",
        "category": "বাংলা বইয়ের ঠিকানা",
        "status": "স্থাপনের কাজ চলমান",
        "stage": "deployment",
        "description": "অধ্যায়সহ EPUB ও HTML বই তৈরি, বই গুছিয়ে রাখা, খুঁজে পাওয়া ও ব্রাউজারে পড়ার জন্য একটি বাংলা ইবুক প্ল্যাটফর্ম।",
        "features": [
          "অধ্যায় ও সূচিপত্রসহ ইবুক তৈরি",
          "সার্চযোগ্য ক্যাটালগ ও বিভাগ অনুযায়ী বিন্যাস",
          "ব্রাউজারে পড়া এবং বইভিত্তিক ব্যবহারের অনুমতি"
        ],
        "note": "স্থাপনের কাজ চলছে। প্রস্তুত হলে ব্যবহারের লিংক যোগ করা হবে।"
      },
      {
        "id": "personal-finance",
        "name": "ব্যক্তিগত অর্থ ব্যবস্থাপনা",
        "category": "প্রতিদিনের অর্থের হিসাব একসঙ্গে",
        "status": "প্রাথমিক ভাবনা পর্যায়ে",
        "stage": "inception",
        "description": "স্বয়ংক্রিয় লেনদেনের হিসাব, ব্যক্তিগত অর্থ ব্যবস্থাপনা এবং করের হিসাব রাখা ও গণনা এক জায়গায় আনার উদ্দেশ্যে পরিকল্পনাধীন একটি পণ্য।",
        "features": [
          "পরিকল্পিত স্বয়ংক্রিয় লেনদেনের হিসাব ও মিল যাচাই",
          "পরিকল্পিত আয়, ব্যয়, অ্যাকাউন্ট ও সঞ্চয় ব্যবস্থাপনা",
          "পরিকল্পিত করের হিসাব, গণনা ও পরিকল্পনার সুবিধা"
        ],
        "note": "এখন প্রাথমিক ভাবনা পর্যায়ে। এই সুবিধাগুলো পরিকল্পিত; এখনো ব্যবহারযোগ্য নয়।"
      }
    ],
    "process": [
      {
        "title": "প্রয়োজন বোঝা",
        "text": "আপনার ব্যবসা, ব্যবহারকারী ও যে সমস্যার সমাধান দরকার তা বুঝি।"
      },
      {
        "title": "নকশা",
        "text": "তৈরির আগে বিষয়বস্তু, ইন্টারফেস ও কাজের ধাপ সাজাই।"
      },
      {
        "title": "তৈরি ও যাচাই",
        "text": "সম্মত সমাধান তৈরি করি এবং বাস্তব ব্যবহারের পরিস্থিতিতে যাচাই করি।"
      },
      {
        "title": "হস্তান্তর",
        "text": "সম্পূর্ণ কাজ দেখিয়ে ব্যবহার ও রক্ষণাবেক্ষণের পদ্ধতি বুঝিয়ে দিই।"
      }
    ],
    "about": {
      "title": "ভিত্তি ঢাকায়।",
      "accent": "মনোযোগ দরকারি কাজে।",
      "intro": "RSalehin24 ঢাকা, বাংলাদেশভিত্তিক একটি সফটওয়্যার ব্যবসা। ব্যবসায়িক ওয়েবসাইট, কাস্টম অ্যাপ্লিকেশন ও অটোমেশন তৈরি করি একটি বাস্তব প্রশ্ন সামনে রেখে: এটি কীভাবে কারও কাজে সাহায্য করবে?",
      "heading": "নিজেদের পণ্য তৈরির অভিজ্ঞতা থেকে।",
      "text": "আমাদের কাজের মধ্যে রয়েছে ব্রাউজারভিত্তিক EPUB Reader এবং একটি বাংলা eLibrary প্ল্যাটফর্ম। এসব কাজে পড়ার ইন্টারফেস, সার্চযোগ্য তথ্য, ব্যবহারের অনুমতি ও স্বয়ংক্রিয় প্রক্রিয়াকরণ একসঙ্গে এসেছে। ব্যবসায়িক সফটওয়্যার তৈরিতেও এই অভিজ্ঞতা কাজে লাগাই।",
      "heading2": "পরিষ্কার সিদ্ধান্ত। যত্নে রাখা খুঁটিনাটি।",
      "text2": "যাঁরা ব্যবহার করবেন তাঁদের বোঝা দিয়ে ভালো প্রকল্পের শুরু হয়। নির্দিষ্ট সমস্যা নিয়ে কাজ করি, কাজের পরিধি বোধগম্য রাখি এবং কোডের পাশাপাশি বিষয়বস্তু ও ব্যবহারযোগ্যতায় সমান গুরুত্ব দিই।",
      "principles": [
        {
          "title": "সমস্যা থেকে শুরু",
          "text": "কী তৈরি হবে ঠিক করার আগে কী বদলানো দরকার তা বুঝি।"
        },
        {
          "title": "ব্যবহার সহজ করা",
          "text": "স্পষ্ট বিষয়বস্তু, সহজ নেভিগেশন ও সবার ব্যবহারযোগ্য ইন্টারফেস দিই।"
        },
        {
          "title": "হস্তান্তরের প্রস্তুতি",
          "text": "যাঁরা ব্যবহার ও রক্ষণাবেক্ষণ করবেন তাঁদের জন্য সম্পূর্ণ কাজ বোধগম্য রাখি।"
        }
      ],
      "link": "আমাদের পণ্যের কাজ দেখুন",
      "ctaTitle": "দরকারি কিছু তৈরি করি, একসঙ্গে।",
      "ctaText": "আপনার ব্যবসা সম্পর্কে বলুন এবং ওয়েবসাইট বা সফটওয়্যার দিয়ে কোন কাজে সাহায্য চান তা জানান।"
    },
    "contact": {
      "title": "পরের অধ্যায়ের শুরু",
      "accent": "একটি কথোপকথনে।",
      "intro": "আপনার ব্যবসা, যে কাজে উন্নতি চান বা যে ভাবনা নিয়ে এগোতে প্রস্তুত—আমাদের জানান।",
      "directTitle": "সরাসরি যোগাযোগ করুন",
      "emailLabel": "ইমেইল",
      "phoneLabel": "ফোন",
      "addressLabel": "ঠিকানা",
      "formTitle": "আমাদের ইমেইল পাঠান",
      "formIntro": "এই ফর্ম থেকেই mail@rsalehin24.me-এ লিখুন। চাইলে একটি নথি বা ছবি সংযুক্ত করতে পারেন।",
      "unconfiguredTitle": "ইমেইল বা ফোনে কথা শুরু করি।",
      "unconfiguredText": "আপনার ব্যবসা, যে সেবায় আগ্রহী এবং কী অর্জন করতে চান তা সংক্ষেপে জানান।",
      "emailCta": "আপনার ইমেইল অ্যাপ খুলুন",
      "gmailCta": "Gmail খুলুন",
      "gmailNewTab": "(নতুন ট্যাবে খুলবে)",
      "emailSubject": "RSalehin24 প্রকল্পের অনুসন্ধান",
      "phoneCta": "ফোন করুন",
      "copyEmail": "ইমেইল কপি করুন",
      "emailHelp": "অথবা আমাদের ইমেইল ঠিকানা কপি করুন।",
      "emailCopied": "ইমেইল ঠিকানা কপি হয়েছে। আপনার ইমেইল সেবায় পেস্ট করে প্রকল্পের বিস্তারিত পাঠান।",
      "copyEmailError": "কপি করা যাচ্ছে না। ইমেইল ঠিকানা নির্বাচন করা আছে; নিজে কপি করে আপনার ইমেইল সেবায় পেস্ট করুন।",
      "required": "* চিহ্ন দেওয়া ঘরগুলো পূরণ করতে হবে।",
      "name": "নাম",
      "email": "আপনার ইমেইল (উত্তর দেওয়ার জন্য)",
      "company": "কোম্পানি (ঐচ্ছিক)",
      "phone": "ফোন (ঐচ্ছিক)",
      "service": "কোন সেবায় আগ্রহী",
      "servicePlaceholder": "একটি সেবা বেছে নিন",
      "otherService": "অন্য কিছু / এখনো নিশ্চিত নই",
      "subject": "বিষয়",
      "message": "বার্তা",
      "messageHint": "কী তৈরি করতে বা উন্নত করতে চান? পাসওয়ার্ড বা সংবেদনশীল আর্থিক তথ্য দেবেন না।",
      "attachment": "সংযুক্তি (ঐচ্ছিক)",
      "attachmentHint": "একটি নথি, Excel স্প্রেডশিট, টেক্সট/Markdown ফাইল বা ছবি। সর্বোচ্চ ৫ MB।",
      "attachmentArchiveHint": "কিছু ফাইলের ধরন বা নামের কারণে ফাইল ZIP সংযুক্তিতে পৌঁছায়। ফাইলের মূল নাম ও বিষয়বস্তু অক্ষত থাকে।",
      "attachmentLinks": "আপনার ফাইলটি ডাউনলোড লিংক হিসেবে আমাদের কাছে পৌঁছাবে।",
      "fileSizeError": "৫ MB বা তার কম আকারের ফাইল বেছে নিন।",
      "fileTypeError": "সহজ নামের সমর্থিত নথি, Excel, টেক্সট/Markdown ফাইল বা ছবি বেছে নিন।",
      "fileEmptyError": "এই ফাইলটি খালি। অন্য একটি ফাইল বেছে নিন।",
      "challengeLabel": "স্প্যাম প্রতিরোধ",
      "challengeError": "স্প্যাম যাচাই সম্পন্ন করুন। এটি চালু না হলে ইমেইল বা ফোনে যোগাযোগ করুন।",
      "rateError": "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ অপেক্ষা করে আবার চেষ্টা করুন। আপনার বার্তা ও সংযুক্তি এখানেই আছে।",
      "submit": "ইমেইল পাঠান",
      "privacyBefore": "আপনার অনুসন্ধানের উত্তর দিতে তথ্য ব্যবহার করি।",
      "brevoNotice": "Cloudflare ও Brevo বার্তা এবং সংযুক্তি প্রক্রিয়া করে। পড়ুন আমাদের",
      "formspreeNotice": "Formspree বার্তা ও ফাইল প্রক্রিয়া করে। পড়ুন আমাদের",
      "privacyLink": "গোপনীয়তার নোটিশ",
      "privacyAfter": "।",
      "nojs": "জাভাস্ক্রিপ্ট ছাড়াও এই ফর্ম কাজ করে। পাঠানোর পর Formspree নিশ্চিতকরণের পাতা দেখাবে।",
      "nojsBrevo": "স্প্যাম যাচাইয়ের জন্য এই ফর্মে জাভাস্ক্রিপ্ট প্রয়োজন। বিকল্প হিসেবে mail@rsalehin24.me-এ ইমেইল বা +8801608537383 নম্বরে ফোন করতে পারেন।",
      "invalid": "পাঠানোর আগে চিহ্নিত ঘরগুলো ঠিক করুন।",
      "requiredError": "এই ঘরটি পূরণ করুন।",
      "emailError": "সঠিক ইমেইল ঠিকানা লিখুন।",
      "tooLongError": "অনুমোদিত দৈর্ঘ্যের মধ্যে লিখুন।",
      "progress": "আপনার অনুসন্ধান পাঠানো হচ্ছে…",
      "success": "আপনার অনুসন্ধান গ্রহণ করা হয়েছে। যোগাযোগের জন্য ধন্যবাদ।",
      "referenceLabel": "অনুসন্ধানের রেফারেন্স",
      "error": "আপনার ইমেইল পাঠানো হয়েছে কি না নিশ্চিত হওয়া যায়নি। বার্তা ও সংযুক্তি এখানেই আছে। আবার চেষ্টা করুন অথবা ইমেইল বা ফোনে যোগাযোগ করুন।",
      "sending": "পাঠানো হচ্ছে…"
    },
    "privacy": {
      "title": "আপনার তথ্য,",
      "accent": "যত্নের সঙ্গে।",
      "intro": "প্রকল্প নিয়ে RSalehin24-এর সঙ্গে যোগাযোগ করলে আপনার তথ্য কীভাবে ব্যবহৃত হয়, এই নোটিশে তা জানানো হয়েছে।",
      "sections": [
        {
          "heading": "আপনি যে তথ্য দেন",
          "text": "যোগাযোগ ফর্ম চালু থাকলে এতে নাম, উত্তর দেওয়ার ইমেইল, আগ্রহের সেবা, ইমেইলের বিষয় ও বার্তা চাওয়া হয়। কোম্পানি, ফোন এবং একটি সংযুক্তি ঐচ্ছিক। জমা দেওয়া ফাইলের নাম ও বিষয়বস্তু আমরা পাই। সরাসরি ইমেইল বা ফোন করলে আপনি সেই মাধ্যমে যে তথ্য দেন আমরা তা পাই।"
        },
        {
          "heading": "কেন ব্যবহার করি",
          "text": "উত্তর দেওয়া, আপনার প্রকল্প বোঝা এবং সম্ভাব্য কাজ নিয়ে যোগাযোগের জন্য অনুসন্ধানের তথ্য ব্যবহার করি। এই ফর্মের মাধ্যমে আপনাকে কোনো বিপণনের তালিকায় যুক্ত করি না।"
        },
        {
          "heading": "হোস্টিং, কুকি ও অ্যানালিটিক্স",
          "text": "এই স্ট্যাটিক ওয়েবসাইট GitHub Pages-এ হোস্ট করা। সাইট দেখানো ও সুরক্ষার জন্য হোস্টিং সেবাদাতা রিকোয়েস্টের তথ্য প্রক্রিয়া করতে পারে। এই সংস্করণে আমরা অ্যানালিটিক্স, বিজ্ঞাপনের ট্র্যাকার বা ব্রাউজার স্টোরেজ যোগ করি না। লিংক করা পণ্য বা বাইরের সেবায় গেলে তাদের নিজস্ব নিয়ম প্রযোজ্য।"
        },
        {
          "heading": "অনুসন্ধান রাখা ও মুছে ফেলা",
          "text": "উত্তর দেওয়া এবং প্রকল্পের পরবর্তী যোগাযোগের জন্য অনুসন্ধানের বার্তা রাখা হয়। আপনার তথ্য সম্পর্কে জানতে বা সংশোধন কিংবা মুছে ফেলার অনুরোধ করতে ইমেইল করতে পারেন। চলমান কাজের জন্য প্রয়োজনীয় নথি রাখার বিষয়টি বিবেচনা করে অনুরোধ দেখা হবে।"
        },
        {
          "heading": "গোপনীয়তা নিয়ে যোগাযোগ",
          "text": "এই নোটিশ বা আপনার অনুসন্ধানের তথ্য নিয়ে প্রশ্ন থাকলে mail@rsalehin24.me-এ ইমেইল করুন।"
        }
      ],
      "providerLabel": "Formspree-এর গোপনীয়তা নীতি",
      "processingHeading": "ফর্মের তথ্য প্রক্রিয়াকরণ",
      "brevoProcessing": "Cloudflare ও Brevo দিয়ে চালু থাকলে ফর্মের বার্তা ও ঐচ্ছিক সংযুক্তি Cloudflare Worker-এর মাধ্যমে Brevo-এ যায়। Brevo তা mail@rsalehin24.me-এ ইমেইল হিসেবে পাঠায়। তারিখসহ অনুসন্ধানের রেফারেন্স তৈরির জন্য Cloudflare দৈনিক সংখ্যা সংরক্ষণ করে; এই হিসাবে আপনার নাম, ইমেইল, বার্তা বা সংযুক্তি রাখা হয় না। Brevo ও আমাদের ইমেইল সেবাদাতা নিজেদের নীতি অনুযায়ী বার্তার তথ্য রাখতে পারে। স্প্যাম প্রতিরোধে Cloudflare Turnstile আইপি ঠিকানা ও ব্রাউজারের তথ্যের মতো প্রযুক্তিগত তথ্য প্রক্রিয়া করে। বার্তা ও ফাইলের বিষয়বস্তু শুধু ফর্ম জমা দেওয়ার সময় পাঠানো হয়।",
      "formspreeProcessing": "Formspree দিয়ে চালু থাকলে ফর্মের বার্তা ও ঐচ্ছিক ফাইল Formspree-এ যায়। তারা বার্তা ও ফাইলের ডাউনলোড লিংক আমাদের ইমেইলে পাঠায় এবং অ্যাকাউন্টের সেটিংস অনুযায়ী তথ্য ও ফাইল সংরক্ষণ করে। পাঠানো ও স্প্যাম প্রতিরোধে তাদের সেবা আইপি ঠিকানার মতো প্রযুক্তিগত তথ্য প্রক্রিয়া করতে পারে। বার্তা ও ফাইলের বিষয়বস্তু শুধু ফর্ম জমা দেওয়ার সময় পাঠানো হয়।",
      "brevoLabel": "Brevo-এর গোপনীয়তা নীতি",
      "cloudflareLabel": "Cloudflare-এর গোপনীয়তা নীতি",
      "hostLabel": "GitHub-এর গোপনীয়তা বিবৃতি"
    }
  }
} as const;
export function pagePath(lang: Lang, page: PageKey): string { return `${lang === "bn" ? "/bn/" : "/"}${page === "home" ? "" : `${page}/`}`; }
