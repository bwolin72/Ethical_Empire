import React from "react";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Facebook, Youtube, Music, Phone } from "lucide-react";
import QRCode from "react-qr-code";
import "./SocialMediaPage.css";

const socialLinks = [
  {
    name: "Facebook",
    url: "https://www.facebook.com/share/16nQGbE7Zk/",
    icon: <Facebook className="w-6 h-6 text-blue-600" />,
    color: "bg-blue-100",
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@eethm_gh?_t=ZM-8zwTexRZBbn&_r=1",
    icon: <Music className="w-6 h-6 text-black" />,
    color: "bg-gray-100",
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@ethicalmultimediagh",
    icon: <Youtube className="w-6 h-6 text-red-600" />,
    color: "bg-red-100",
  },
  {
    name: "WhatsApp",
    url: "https://wa.me/+233552988735",
    icon: <Phone className="w-6 h-6 text-green-600" />,
    color: "bg-green-100",
  },
];

export default function SocialMediaPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Connect with Eethm_GH Multimedia
      </h1>

      {/* Social Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {socialLinks.map((link, index) => (
          <Card
            key={index}
            className={`flex items-center justify-between p-4 shadow-md rounded-2xl ${link.color}`}
          >
            <div className="flex items-center gap-3">
              {link.icon}
              <h2 className="text-lg font-semibold">{link.name}</h2>
            </div>
            <Button asChild>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                Visit
              </a>
            </Button>
          </Card>
        ))}
      </div>

      {/* Linktree QR Section */}
      <div className="mt-10 p-6 bg-white rounded-2xl shadow-lg text-center">
        <h2 className="text-xl font-semibold mb-4">Scan Our Linktree</h2>
        <QRCode
          value="https://linktr.ee/ethicalmultimediagh"
          size={160}
          fgColor="#000000"
        />
        <p className="mt-2 text-gray-600">All our links in one place</p>
      </div>
    </div>
  );
}
