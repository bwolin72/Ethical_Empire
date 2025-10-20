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

// === Service Metadata + Grouping ===
export const serviceCategories = [
  {
    name: "🎤 Entertainment & Hosting",
    id: "entertainment",
    services: [
      {
        name: "Live Band",
        icon: Users,
        description:
          "Experience the soulful rhythms of Eethm_GH’s Live Band. From highlife to contemporary hits, we create unforgettable moments for weddings, parties, and corporate events.",
      },
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
    ],
  },
  {
    name: "🎥 Media Production",
    id: "media",
    services: [
      {
        name: "Photography",
        icon: Camera,
        description:
          "Capture timeless memories with Eethm_GH’s expert photographers. We turn fleeting moments into lasting treasures.",
      },
      {
        name: "Videography",
        icon: Video,
        description:
          "Relive your event in stunning clarity. Our cinematic videography preserves every smile, laugh, and joyful tear.",
      },
    ],
  },
  {
    name: "💡 Event Production",
    id: "production",
    services: [
      {
        name: "Lighting",
        icon: Lightbulb,
        description:
          "Transform any venue with our dynamic lighting solutions, setting the perfect mood from elegant ambience to vibrant energy.",
      },
      {
        name: "Sound Setup",
        icon: Speaker,
        description:
          "Clear, powerful, and perfectly tuned — our sound setup ensures every word and note is heard just right.",
      },
      {
        name: "Event Planning",
        icon: Calendar,
        description:
          "From concept to completion, Eethm_GH designs seamless, stylish events so you can relax and enjoy the celebration.",
      },
    ],
  },
  {
    name: "🌸 Decor & Styling",
    id: "decor",
    services: [
      {
        name: "Event Decor",
        icon: Brush,
        description:
          "We design captivating atmospheres through floral arrangements, stage backdrops, table settings, and venue transformations.",
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
  {
    name: "🍽 Add-On Services",
    id: "addons",
    services: [
      {
        name: "Catering",
        icon: Utensils,
        description:
          "Taste Ghana’s finest flavors with our catering service. From authentic local dishes to gourmet creations, we serve with excellence.",
      },
      {
        name: "Event Coordination",
        icon: Gift,
        description:
          "Ensure your day runs smoothly. Our coordinators handle logistics, timing, and vendor management with precision and care.",
      },
      {
        name: "Special Effects",
        icon: Sparkles,
        description:
          "Elevate your event with fireworks, fog machines, confetti blasts, and lighting effects that wow your audience.",
      },
    ],
  },
];
