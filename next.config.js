/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/feed.xml",
        headers: [{ key: "Content-Type", value: "application/xml; charset=utf-8" }],
      },
    ];
  },
};

module.exports = nextConfig;
