/* eslint-disable */

import axios from 'axios';

module.exports = async function () {
  // Configure axios for tests to use.
  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ?? '5000';
  const version = 'v1'
  axios.defaults.baseURL = `http://${host}:${port}/api/${version}`;
};
