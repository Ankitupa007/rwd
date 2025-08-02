// app/your-page/page.tsx
import { Suspense } from "react";
import Header from "@/components/common/header";
import Feeds from "./feed";

export const metadata = {
  title: "RWD - Read Without Distractions",
  description:
    "Convert web articles into a beautiful, distraction-free reading experience",
  openGraph: {
    title: "RWD - Read Without Distractions",
    description:
      "Convert web articles into a beautiful, distraction-free reading experience",
    url: "https://readwd.vercel.app",
    siteName: "RWD",
    images: [
      {
        url: "https://readwd.vercel.app/og.png", // Replace with your actual Open Graph image URL
        width: 800,
        height: 600,
      },
      {
        url: "https://readwd.vercel.app/og.png", // Replace with your actual Open Graph image URL
        width: 1800,
        height: 1600,
        alt: "RWD - Read Without Distractions Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image", // Changed to a more common card type for websites
    title: "RWD - Read Without Distractions",
    description:
      "Convert web articles into a beautiful, distraction-free reading experience",
    siteId: "", // Replace with your Twitter site ID (e.g., your website's Twitter account ID)
    creator: "@yourTwitterHandle", // Replace with your Twitter handle (e.g., @ReadWD)
    creatorId: "", // Replace with your Twitter account ID
    images: {
      url: "https://readwd.vercel.app/og.png", // Replace with your actual Twitter image URL
      alt: "RWD Logo",
    },
    app: {
      name: "RWD",
      id: {
        iphone: "", // Replace with your iPhone app ID (e.g., App Store ID)
        ipad: "", // Replace with your iPad app ID (e.g., App Store ID)
        googleplay: "", // Replace with your Google Play Store app ID
      },
      url: {
        iphone: "", // Replace with your iPhone app deep link
        ipad: "", // Replace with your iPad app deep link
      },
    },
  },
  itunes: {
    appId: "", // Replace with your iTunes App Store ID
    appArgument: "https://readwd.vercel.app", // Optional: URL to pass to the app
  },
  appleWebApp: {
    title: "RWD",
    statusBarStyle: "black-translucent",
    startupImage: [
      "/assets/startup/apple-touch-startup-image-768x1004.png", // Replace with your startup image path
      {
        url: "/assets/startup/apple-touch-startup-image-1536x2008.png", // Replace with your startup image path
        media: "(device-width: 768px) and (device-height: 1024px)",
      },
    ],
  },
};

export default async function Page() {
  return (
    <div>
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        <Feeds />
      </Suspense>
    </div>
  );
}
