import type { Metadata } from "next";
import { OrderExperience } from "./OrderExperience";

export const metadata: Metadata = {
  title: "What should I order?",
  description:
    "Get coffee drink recommendations based on your taste — sweet, bitter, strong, milk-based, matcha, and more.",
};

export default function OrderPage() {
  return <OrderExperience />;
}
