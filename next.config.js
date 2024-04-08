/** @type {import('next').NextConfig} */



const path = require('path');

const nextConfig = {
  env: {
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASS: process.env.DB_PASS,
    DB_NAME: process.env.DB_NAME,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias['core'] = path.join(__dirname, 'core');
    return config;
  },
};

module.exports = nextConfig;

