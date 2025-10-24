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

// === Service Metadata + Grouping (matched to backend categories) ===
export const serviceCategories = [
  // ==========================
  // 🎧 Multimedia & Hosting
  // ==========================
  {
    name: "Multimedia & Hosting",
    id: "multimedia-hosting",
    services: [
      {
        name: "DJ",
        icon: Music,
        description:
          "Our professional DJs keep the energy high and the dance floor alive, blending Ghanaian beats with global favorites for non-stop vibes.",
      },
      {
        name: "MC/Host",
        icon: Mic,
        description:
          "Keep your guests entertained with our charismatic MCs and hosts, delivering personality, flow, and professionalism.",
      },
      {
        name: "Photography",
        icon: Camera,
        description:
          "Capture timeless memories with expert photographers. We turn fleeting moments into lasting treasures.",
      },
      {
        name: "Videography",
        icon: Video,
        description:
          "Relive your event in stunning clarity. Our cinematic videography preserves every smile, laugh, and joyful tear.",
      },
      {
        name: "Lighting",
        icon: Lightbulb,
        description:
          "Dynamic lighting solutions that set the perfect mood from elegant ambience to vibrant energy.",
      },
      {
        name: "Sound Setup",
        icon: Speaker,
        description:
          "Clear, powerful, and perfectly tuned — our sound setup ensures every word and note is heard just right.",
      },
      {
        name: "Stage Setup",
        icon: Tent,
        description:
          "Professional stage construction and design, ensuring your performances and presentations shine from every angle.",
      },
      {
        name: "LED Screens & Projectors",
        icon: Tv,
        description:
          "High-definition visual displays, projectors, and LED walls that bring your content and presentations to life.",
      },
      {
        name: "Special Effects",
        icon: Sparkles,
        description:
          "Elevate your event with fireworks, fog machines, confetti blasts, and lighting effects that wow your audience.",
      },
    ],
  },

  // ==========================
  // 🎸 Live Band
  // ==========================
  {
    name: "Live Band",
    id: "live-band",
    services: [
      {
        name: "Live Band Performance",
        icon: Users,
        description:
          "Energetic live band performances featuring skilled musicians, vocalists, and instrumentalists for unforgettable entertainment.",
      },
      {
        name: "Instrumentalists",
        icon: Guitar,
        description:
          "Professional instrumentalists including guitarists, drummers, keyboardists, and horn players to complement any music style.",
      },
      {
        name: "Backup Singers",
        icon: Mic,
        description:
          "Talented background vocalists who enhance live performances with harmony and stage presence.",
      },
      {
        name: "Live Sound Engineering",
        icon: Speaker,
        description:
          "Expert live sound mixing and monitoring for crystal-clear audio during live music and performances.",
      },
      {
        name: "Rehearsal & Setup",
        icon: Drum,
        description:
          "Comprehensive pre-show rehearsals and stage arrangements ensuring flawless live shows and audience engagement.",
      },
    ],
  },

  // ==========================
  // 🍽️ Catering
  // ==========================
  {
    name: "Catering",
    id: "catering",
    services: [
      {
        name: "Full-Service Catering",
        icon: Utensils,
        description:
          "Delicious meals and beverages tailored for every occasion, with full on-site service and menu customization.",
      },
      {
        name: "Buffet Setup",
        icon: Soup,
        description:
          "Beautifully presented buffet arrangements with diverse menu options for large or small gatherings.",
      },
      {
        name: "Finger Foods & Appetizers",
        icon: Cake,
        description:
          "Tasty small bites and snacks — perfect for cocktail events, receptions, or pre-event socials.",
      },
      {
        name: "Bar & Beverage Service",
        icon: Beer,
        description:
          "Professional bartenders serving cocktails, mocktails, wines, and custom beverages for guests of all ages.",
      },
      {
        name: "Cake & Pastries",
        icon: Cake,
        description:
          "Custom-designed cakes, cupcakes, and pastries for weddings, birthdays, and celebrations.",
      },
      {
        name: "Chef On-site",
        icon: ChefHat,
        description:
          "Professional chefs providing live cooking stations and personalized culinary experiences for premium events.",
      },
    ],
  },

  // ==========================
  // 📋 Event Management
  // ==========================
  {
    name: "Event Management",
    id: "event-management",
    services: [
      {
        name: "Event Planning",
        icon: Calendar,
        description:
          "Professional event planning, logistics, and on-site coordination to ensure a seamless experience from concept to completion.",
      },
      {
        name: "Event Coordination",
        icon: Gift,
        description:
          "Ensure your day runs smoothly. Our coordinators handle logistics, timing, and vendor management with precision and care.",
      },
      {
        name: "Vendor Management",
        icon: ClipboardList,
        description:
          "We coordinate and communicate with all vendors — from catering to decor — ensuring everyone aligns with your event vision.",
      },
      {
        name: "Logistics & Scheduling",
        icon: Clock,
        description:
          "We manage the timeline, deliveries, and transportation to keep your event running right on schedule.",
      },
      {
        name: "Budgeting & Cost Control",
        icon: Briefcase,
        description:
          "Transparent budgeting and cost optimization to help you achieve excellence without overspending.",
      },
      {
        name: "Guest Management",
        icon: Bell,
        description:
          "Guest invitation handling, RSVPs, seating arrangements, and guest experience planning.",
      },
      {
        name: "Venue Sourcing",
        icon: Map,
        description:
          "Helping you find and book the perfect venue that matches your event size, theme, and budget.",
      },
    ],
  },

  // ==========================
  // 🎨 Decor & Styling
  // ==========================
  {
    name: "Decor & Styling",
    id: "decor-styling",
    services: [
      {
        name: "Event Decor",
        icon: Brush,
        description:
          "Elegant event decoration, floral arrangements, and thematic styling that bring your vision to life with creative detail.",
      },
      {
        name: "Thematic Styling",
        icon: Palette,
        description:
          "From traditional aesthetics to luxury modern themes, we curate cohesive, immersive experiences.",
      },
      {
        name: "Rentals & Setup",
        icon: Tent,
        description:
          "We provide event essentials — tents, chairs, carpets, and custom installations — with professional delivery and setup.",
      },
      {
        name: "Floral Design",
        icon: Flower2,
        description:
          "Fresh floral arrangements, centerpieces, and bouquets that add life and elegance to any occasion.",
      },
      {
        name: "Table & Seating Styling",
        icon: Sofa,
        description:
          "Custom tablescapes, chair decor, linens, and centerpieces tailored to your theme and color palette.",
      },
      {
        name: "Backdrop & Photo Booth Design",
        icon: Image,
        description:
          "Creative backdrops and interactive photo booths for stylish guest photo experiences.",
      },
      {
        name: "Balloon & Ribbon Art",
        icon: Ribbon,
        description:
          "Custom balloon garlands, arches, and ribbon art installations for parties, weddings, and celebrations.",
      },
      {
        name: "Stage & Entrance Styling",
        icon: PartyPopper,
        description:
          "Decorative stage and entrance setups designed to make a grand impression and photo-worthy experience.",
      },
    ],
  },
];

// === Aliases (so multiple category names map to one main group) ===
export const categoryAliases = {
  "Audio & Lighting": "Multimedia & Hosting",
  Media: "Multimedia & Hosting",
  Decoration: "Decor & Styling",
};

// === Helper Function (optional) ===
export const getCategoryByName = (name) => {
  const resolvedName = categoryAliases[name] || name;
  return serviceCategories.find(
    (category) => category.name.toLowerCase() === resolvedName.toLowerCase()
  );
};
