/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // This is the magic line
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;