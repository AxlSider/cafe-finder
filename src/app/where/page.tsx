import type { Metadata } from "next";
import { WhereExperience } from "./WhereExperience";

export const metadata: Metadata = {
  title: "Where should I go?",
  description:
    "Pick your purpose — study, work, date, quiet — and get explainable cafe recommendations near you in Luzon or Switzerland.",
};

export default function WherePage() {
  return <WhereExperience />;
}
