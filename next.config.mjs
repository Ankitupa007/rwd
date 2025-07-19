import nextPWA from "next-pwa";

const withPWA = nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // Disable in dev to avoid conflicts with Turbopack
});

const nextConfig = {
  // Add any other Next.js config options here
};

export default withPWA(nextConfig);
