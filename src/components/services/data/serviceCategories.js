// frontend/src/components/Services/data/serviceCategories.js

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
} from "lucide-react";

// === Service Metadata + Grouping (matched to backend categories) ===
export const serviceCategories = [
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
        name: "Special Effects",
        icon: Sparkles,
        description:
          "Elevate your event with fireworks, fog machines, confetti blasts, and lighting effects that wow your audience.",
      },
    ],
  },
  {
    name: "Live Band",
    id: "live-band",
    services: [
      {
        name: "Live Band",
        icon: Users,
        description:
          "Energetic live band performances featuring skilled musicians, vocalists, and instrumentalists for unforgettable entertainment.",
      },
    ],
  },
  {
    name: "Catering",
    id: "catering",
    services: [
      {
        name: "Catering",
        icon: Utensils,
        description:
          "Delicious food, snacks, and beverages tailored for every occasion. We provide full-service catering with customized menus and on-site support.",
      },
    ],
  },
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
    ],
  },
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
          "Bring your vision to life — from traditional Ghanaian aesthetics to luxury modern themes, we curate cohesive, immersive experiences.",
      },
      {
        name: "Rentals & Setup",
        icon: Tent,
        description:
          "We provide event essentials — tents, chairs, carpets, and custom installations — with professional delivery and setup.",
      },
    ],
  },
];
