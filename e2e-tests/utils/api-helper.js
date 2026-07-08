const request = require('supertest');
const app = require('../../backend/app');

function getAgent() {
  return request(app);
}

module.exports = {
  getAgent
};
