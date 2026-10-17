import type { NextConfig } from 'next';
const isPages=process.env.GITHUB_PAGES==='true';
const nextConfig:NextConfig={
 reactStrictMode:true,
 poweredByHeader:false,
 output:'export',
 trailingSlash:true,
 basePath:isPages?'/DATOS-ABIERTOS':undefined,
 assetPrefix:isPages?'/DATOS-ABIERTOS/':undefined,
 images:{unoptimized:true},
};
export default nextConfig;
