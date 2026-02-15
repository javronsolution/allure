import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Allure — Boutique Management",
    short_name: "Allure",
    description: "Manage customers, orders, and deliveries for your boutique",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0a0a0a",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-152.png",
        sizes: "152x152",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
