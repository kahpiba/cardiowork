/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  transpilePackages: ['@cardiowork/shared'],
  
  experimental: {
    serverComponentsExternalPackages: ['onnxruntime-node'],
    outputFileTracingIncludes: {
      '/api/inference': ['./public/models/**/*.onnx'],
      '/api/mcu': ['./public/models/**/*.onnx'],
      '/api/dcu': ['./public/models/**/*.onnx']
    }
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('onnxruntime-node');
    } else {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        'onnxruntime-node': false,
      };
    }
    return config;
  },

  // Security Headers (CSP, HSTS, X-Frame-Options, Referrer-Policy)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
        ]
      }
    ];
  }
};

export default nextConfig;
