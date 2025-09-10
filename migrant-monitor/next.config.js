/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Отключаем ESLint ошибки при сборке
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Отключаем TypeScript ошибки при сборке для any типов
    ignoreBuildErrors: false,
  },
  experimental: {
    // Включаем экспериментальные фичи если нужно
  },
}

module.exports = nextConfig