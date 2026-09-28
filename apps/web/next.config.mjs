/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  
  // Memastikan berkas model ONNX dan binary runtime disertakan ke Vercel Serverless Function
  experimental: {
    outputFileTracingIncludes: {
      '/api/inference': ['./public/models/**/*.onnx'],
      '/api/mcu': ['./public/models/**/*.onnx'],
      '/api/dcu': ['./public/models/**/*.onnx']
    }
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
