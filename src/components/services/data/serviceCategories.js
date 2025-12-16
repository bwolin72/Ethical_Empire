import {
  Utensils,
  Music,
  Camera,
  Video,
  Calendar,
  Lightbulb,
  Mic,
  Speaker,
  Users,
  Brush,
  Sparkles,
  Tent,
  Palette,
  Gift,
  Monitor,
  Tv,
  Drum,
  Guitar,
  Soup,
  Beer,
  Wine,
  Cake,
  ChefHat,
  ClipboardList,
  Map,
  Bell,
  Briefcase,
  Clock,
  Flower2,
  Sofa,
  Scissors,
  Ribbon,
  Image,
  PartyPopper,
} from "lucide-react";

// === Service Metadata + Grouping with proper theme integration ===
export const serviceCategories = [
  // ==========================
  // 🎥 Multimedia & Hosting (Multimedia Theme)
  // ==========================
  {
    name: "Multimedia & Hosting",
    id: "multimedia-hosting",
    slug: "multimedia-hosting",
    description: "Professional audio-visual production and hosting services for unforgettable events",
    services: [
      {
        name: "DJ",
        icon: Music,
        category: "Multimedia",
        description: "Our professional DJs keep the energy high and the dance floor alive, blending Ghanaian beats with global favorites for non-stop vibes.",
      },
      {
        name: "MC/Host",
        icon: Mic,
        category: "Multimedia",
        description: "Keep your guests entertained with our charismatic MCs and hosts, delivering personality, flow, and professionalism.",
      },
      {
        name: "Photography",
        icon: Camera,
        category: "Multimedia",
        description: "Capture timeless memories with expert photographers. We turn fleeting moments into lasting treasures.",
      },
      {
        name: "Videography",
        icon: Video,
        category: "Multimedia",
        description: "Relive your event in stunning clarity. Our cinematic videography preserves every smile, laugh, and joyful tear.",
      },
      {
        name: "Lighting",
        icon: Lightbulb,
        category: "Multimedia",
        description: "Dynamic lighting solutions that set the perfect mood from elegant ambience to vibrant energy.",
      },
      {
        name: "Sound Setup",
        icon: Speaker,
        category: "Multimedia",
        description: "Clear, powerful, and perfectly tuned — our sound setup ensures every word and note is heard just right.",
      },
      {
        name: "Stage Setup",
        icon: Tent,
        category: "Multimedia",
        description: "Professional stage construction and design, ensuring your performances and presentations shine from every angle.",
      },
      {
        name: "LED Screens & Projectors",
        icon: Tv,
        category: "Multimedia",
        description: "High-definition visual displays, projectors, and LED walls that bring your content and presentations to life.",
      },
      {
        name: "Special Effects",
        icon: Sparkles,
        category: "Multimedia",
        description: "Elevate your event with fireworks, fog machines, confetti blasts, and lighting effects that wow your audience.",
      },
    ],
  },

  // ==========================
  // 🎸 Live Band (Live Band Theme)
  // ==========================
  {
    name: "Live Band",
    id: "live-band",
    slug: "live-band",
    description: "Energetic live performances and musical entertainment for all occasions",
    services: [
      {
        name: "Live Band Performance",
        icon: Users,
        category: "Live Band",
        description: "Energetic live band performances featuring skilled musicians, vocalists, and instrumentalists for unforgettable entertainment.",
      },
      {
        name: "Instrumentalists",
        icon: Guitar,
        category: "Live Band",
        description: "Professional instrumentalists including guitarists, drummers, keyboardists, and horn players to complement any music style.",
      },
      {
        name: "Backup Singers",
        icon: Mic,
        category: "Live Band",
        description: "Talented background vocalists who enhance live performances with harmony and stage presence.",
      },
      {
        name: "Live Sound Engineering",
        icon: Speaker,
        category: "Live Band",
        description: "Expert live sound mixing and monitoring for crystal-clear audio during live music and performances.",
      },
      {
        name: "Rehearsal & Setup",
        icon: Drum,
        category: "Live Band",
        description: "Comprehensive pre-show rehearsals and stage arrangements ensuring flawless live shows and audience engagement.",
      },
    ],
  },

  // ==========================
  // 🍽️ Catering (Catering Theme)
  // ==========================
  {
    name: "Catering",
    id: "catering",
    slug: "catering",
    description: "Delicious meals and beverages tailored for every occasion",
    services: [
      {
        name: "Full-Service Catering",
        icon: Utensils,
        category: "Catering",
        description: "Delicious meals and beverages tailored for every occasion, with full on-site service and menu customization.",
      },
      {
        name: "Buffet Setup",
        icon: Soup,
        category: "Catering",
        description: "Beautifully presented buffet arrangements with diverse menu options for large or small gatherings.",
      },
      {
        name: "Finger Foods & Appetizers",
        icon: Cake,
        category: "Catering",
        description: "Tasty small bites and snacks — perfect for cocktail events, receptions, or pre-event socials.",
      },
      {
        name: "Bar & Beverage Service",
        icon: Beer,
        category: "Catering",
        description: "Professional bartenders serving cocktails, mocktails, wines, and custom beverages for guests of all ages.",
      },
      {
        name: "Cake & Pastries",
        icon: Cake,
        category: "Catering",
        description: "Custom-designed cakes, cupcakes, and pastries for weddings, birthdays, and celebrations.",
      },
      {
        name: "Chef On-site",
        icon: ChefHat,
        category: "Catering",
        description: "Professional chefs providing live cooking stations and personalized culinary experiences for premium events.",
      },
    ],
  },

  // ==========================
  // 📋 Event Management (Travel Theme)
  // ==========================
  {
    name: "Event Management",
    id: "event-management",
    slug: "event-management",
    description: "Complete event planning and coordination services",
    services: [
      {
        name: "Event Planning",
        icon: Calendar,
        category: "Event Management",
        description: "Professional event planning, logistics, and on-site coordination to ensure a seamless experience from concept to completion.",
      },
      {
        name: "Event Coordination",
        icon: Gift,
        category: "Event Management",
        description: "Ensure your day runs smoothly. Our coordinators handle logistics, timing, and vendor management with precision and care.",
      },
      {
        name: "Vendor Management",
        icon: ClipboardList,
        category: "Event Management",
        description: "We coordinate and communicate with all vendors — from catering to decor — ensuring everyone aligns with your event vision.",
      },
      {
        name: "Logistics & Scheduling",
        icon: Clock,
        category: "Event Management",
        description: "We manage the timeline, deliveries, and transportation to keep your event running right on schedule.",
      },
      {
        name: "Budgeting & Cost Control",
        icon: Briefcase,
        category: "Event Management",
        description: "Transparent budgeting and cost optimization to help you achieve excellence without overspending.",
      },
      {
        name: "Guest Management",
        icon: Bell,
        category: "Event Management",
        description: "Guest invitation handling, RSVPs, seating arrangements, and guest experience planning.",
      },
      {
        name: "Venue Sourcing",
        icon: Map,
        category: "Event Management",
        description: "Helping you find and book the perfect venue that matches your event size, theme, and budget.",
      },
    ],
  },

  // ==========================
  // 🎨 Decor & Styling (Decor Theme)
  // ==========================
  {
    name: "Decor & Styling",
    id: "decor-styling",
    slug: "decor-styling",
    description: "Elegant event decoration and thematic styling",
    services: [
      {
        name: "Event Decor",
        icon: Brush,
        category: "Decor & Styling",
        description: "Elegant event decoration, floral arrangements, and thematic styling that bring your vision to life with creative detail.",
      },
      {
        name: "Thematic Styling",
        icon: Palette,
        category: "Decor & Styling",
        description: "From traditional aesthetics to luxury modern themes, we curate cohesive, immersive experiences.",
      },
      {
        name: "Rentals & Setup",
        icon: Tent,
        category: "Decor & Styling",
        description: "We provide event essentials — tents, chairs, carpets, and custom installations — with professional delivery and setup.",
      },
      {
        name: "Floral Design",
        icon: Flower2,
        category: "Decor & Styling",
        description: "Fresh floral arrangements, centerpieces, and bouquets that add life and elegance to any occasion.",
      },
      {
        name: "Table & Seating Styling",
        icon: Sofa,
        category: "Decor & Styling",
        description: "Custom tablescapes, chair decor, linens, and centerpieces tailored to your theme and color palette.",
      },
      {
        name: "Backdrop & Photo Booth Design",
        icon: Image,
        category: "Decor & Styling",
        description: "Creative backdrops and interactive photo booths for stylish guest photo experiences.",
      },
      {
        name: "Balloon & Ribbon Art",
        icon: Ribbon,
        category: "Decor & Styling",
        description: "Custom balloon garlands, arches, and ribbon art installations for parties, weddings, and celebrations.",
      },
      {
        name: "Stage & Entrance Styling",
        icon: PartyPopper,
        category: "Decor & Styling",
        description: "Decorative stage and entrance setups designed to make a grand impression and photo-worthy experience.",
      },
    ],
  },
];

// === Helper functions for category access ===
export const getCategoryByName = (name) => {
  return serviceCategories.find(
    (category) => category.name.toLowerCase() === name.toLowerCase()
  );
};

export const getCategoryBySlug = (slug) => {
  return serviceCategories.find(
    (category) => category.slug === slug
  );
};

export const getServicesByCategory = (categoryName) => {
  const category = getCategoryByName(categoryName);
  return category ? category.services : [];
};

// === Quick access for common categories ===
export const multimediaServices = getServicesByCategory("Multimedia & Hosting");
export const liveBandServices = getServicesByCategory("Live Band");
export const cateringServices = getServicesByCategory("Catering");
export const decorServices = getServicesByCategory("Decor & Styling");
export const eventManagementServices = getServicesByCategory("Event Management");

// === Aliases for backward compatibility ===
export const categoryAliases = {
  "Audio & Lighting": "Multimedia & Hosting",
  "Media": "Multimedia & Hosting",
  "Decoration": "Decor & Styling",
  "Food & Beverage": "Catering",
  "Entertainment": "Live Band",
};
