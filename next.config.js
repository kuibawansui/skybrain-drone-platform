/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true
  },
  experimental: {
    esmExternals: false
  },
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  webpack: (config, { isServer }) => {
    // 修复Three.js和相关库的构建问题
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    
    // 处理Three.js模块
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    
    return config;
  },
  // 静态导出配置
  exportPathMap: async function () {
    return {
      '/': { page: '/' },
    };
  }
};

module.exports = nextConfig;