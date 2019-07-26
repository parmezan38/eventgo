require('dotenv').config();
const argv = require('minimist')(process.argv.slice(2));
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const config = require('./server/config');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';
const extensions = ['.vue'];
const aliases = {
  '@': path.resolve(__dirname, './client')
};

const devServer = {
  headers: {
    'X-Powered-By': 'Webpack DevSever'
  },
  proxy: {
    // TODO: set the assets in client side public folder
    '/sw.js': {
      target: `http://${config.ip}:${config.port}`
    },
    '/api': {
      target: `http://${config.ip}:${config.port}`
    }
  },
  // Override using: `npm run dev:client -- --ort <number>`
  port: 8081,
  hot: true,
  hotEntries: ['admin', 'main']
};

module.exports = {
  envs: {
    VUE_APP_IP: config.ip,
    VUE_APP_VAPID_KEY_PUBLIC: config.vapidKeyPublic,
    VUE_APP_VAPID_KEY_PRIVATE: config.vapidKeyPrivate,
    VUE_APP_PORT: config.port
  },
  plugins: [
    '@poi/eslint'
  ],
  pages: {
    admin: {
      filename: 'admin/index.html',
      entry: './client/admin/main.js'
    },
    main: {
      filename: 'index.html',
      entry: './client/main/index.js'
    }
  },
  output: {
    dir: 'dist',
    sourceMap: !isProduction
  },
  chainWebpack(config) {
    configureModuleResolution(config);
    config.resolve.alias.merge(aliases);
    config.resolve.extensions.merge(extensions);
    // config.output.publicPath('/dist/');
  },
  configureWebpack(config) {
    if (!argv._.includes('--bundle-report')) return;
    config.plugins.push(new BundleAnalyzerPlugin());
  },
  devServer
};

// NOTE: Remove absolute path to local `node_modules` from configuration
// https://github.com/webpack/webpack/issues/6538#issuecomment-367324775
function configureModuleResolution(config) {
  const localModules = path.join(__dirname, 'node_modules');
  config.resolve.modules.delete(localModules);
  config.resolveLoader.modules.delete(localModules);
}
