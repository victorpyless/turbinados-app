/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        // !! ATENÇÃO !!
        // Perigoso em projetos grandes, mas útil para deploy rápido de MVP.
        ignoreBuildErrors: true,
    },
    eslint: {
        // Ignora avisos de linting durante o build.
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.supabase.co',
            },
        ],
    },
};
export default nextConfig;
