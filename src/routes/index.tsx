import { createFileRoute } from "@tanstack/react-router";
import { Portal } from "@/components/portal/Portal";

const TITLE = "Aetheria — Ձեր կայքը 6 քայլում · Сайт за 6 шагов · Your website in 6 steps";
const DESC = "Aetheria digital studio: choose project type, style, features and timeline — get an instant price in ֏, ₽ or $.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Portal,
});
