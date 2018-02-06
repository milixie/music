'use strict';

const Resource = require('./resource');
const request_interceptors = require('./request_interceptors');

class Request extends Resource {
  constructor(request_url, block_others) {
    super(request_url, block_others);
    this.interceptors = request_interceptors;
  }
}
module.exports = Request;
