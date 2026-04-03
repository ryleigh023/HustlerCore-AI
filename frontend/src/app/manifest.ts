import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HustlerCore AI",
    short_name: "HustlerCore",
    description:
      "Parametric income insurance for Zomato / Swiggy partners — weekly tiers ₹49 / ₹99 / ₹149.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#020617",
    orientation: "portrait",
    icons: [
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
