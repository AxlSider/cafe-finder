import Link from "next/link";
import { CupScoutMark } from "@/components/Brand";
import { ArrowRight } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <CupScoutMark size={44} className="mx-auto opacity-60" />
      <h1 className="mt-4 font-display text-2xl font-extrabold">Page not found</h1>
      <p className="mt-1 text-ink-muted">
        We couldn&apos;t find what you were looking for.
      </p>
      <Link href="/" className="btn-primary mt-5">
        Back to Discover <ArrowRight size={16} />
      </Link>
    </div>
  );
}
