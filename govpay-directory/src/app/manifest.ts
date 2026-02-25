import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GovPay.Directory — Federal Employee Salary Database",
    short_name: "GovPay",
    description:
      "Searchable database of 2M+ federal and state government employee salaries with pay scale tools and cost-of-living comparisons.",
    start_url: "/",
    display: "standalone",
    theme_color: "#0F1B2D",
    background_color: "#0F1B2D",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
