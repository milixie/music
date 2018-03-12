'use strict';

const config = {
  development: {
    host: 'http://localhost:9003',
    gzid: 4,
  },
  test: {
    host: 'http://www.weather.com.cn',
    gzid: 4,
  },
  beta: {
    host: 'http://beta.weapp.5wei.com',
    gzid: 4,
  },
  production: {
    host: 'https://weapp.5wei.com',
    gzid: 4,
  }
};

//const node_env = process.env.NODE_ENV || 'development';
module.exports = config.test;
