const { defineConfig } = require('cypress');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

dotenvExpand.expand(dotenv.config({ path: '../.env' }));

let GATEWAY_BASEURL = 'http://localhost:8080';
if (process.env.GATEWAY_URL) {
  const apiUrl = new URL(process.env.GATEWAY_URL);
  GATEWAY_BASEURL = `${apiUrl.protocol}//${apiUrl.host}`;
}

module.exports = defineConfig({
  viewportWidth: 1200,
  viewportHeight: 1200,
  defaultCommandTimeout: 10000,
  env: {
    GATEWAY_BASEURL,
  },
  e2e: {
    baseUrl: process.env.LANDLORD_APP_URL || 'http://localhost:8080/landlord',
  },
});
