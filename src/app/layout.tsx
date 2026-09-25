import type { Metadata, Viewport } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { MobileTabBar } from "@/components/MobileTabBar";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: {
    default: "CupScout — Find your next coffee",
    template: "%s · CupScout",
  },
  description:
    "CupScout is a location-first coffee discovery platform for Luzon (Philippines) and Switzerland. Find cafes near you, decide where to go, and know what to order.",
  applicationName: "CupScout",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icons/icon.svg", apple: "/icons/icon.svg" },
  appleWebApp: { capable: true, title: "CupScout", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f8f6" },
    { media: "(prefers-color-scheme: dark)", color: "#161310" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Set the theme before paint to avoid a flash of the wrong theme.
const themeScript = `(function(){try{var t=localStorage.getItem('cf:theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <AuthProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main" className="mx-auto max-w-content px-4 pb-24 pt-5 md:pb-10 md:pt-7">
            {children}
          </main>
          <SiteFooter />
          <MobileTabBar />
          <ServiceWorkerRegister />
        </AuthProvider>
      </body>
    </html>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-16 hidden border-t border-line bg-surface md:block">
      <div className="mx-auto flex max-w-content flex-col gap-2 px-4 py-8 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          CupScout covers Luzon (Philippines) and Switzerland. Cafe data is a
          curated dataset; ratings and menus appear only when available.
        </p>
        <p>
          Map data ©{" "}
          <a
            className="underline hover:text-ink-soft"
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
          >
            OpenStreetMap
          </a>{" "}
          contributors
        </p>
      </div>
    </footer>
  );
}
