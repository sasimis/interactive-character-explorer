import { createFileRoute } from "@tanstack/react-router";
import { Game } from "../components/game/Game";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Robot Meadow — Interactive 3D Character" },
      {
        name: "description",
        content:
          "An interactive 3D robot that follows your cursor, then walks, runs, jumps and dances around a low-poly meadow. Built with Three.js.",
      },
      { property: "og:title", content: "Robot Meadow — Interactive 3D Character" },
      {
        property: "og:description",
        content:
          "Watch the robot track your cursor, then explore a low-poly meadow with WASD. A Three.js playground.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Game,
});
