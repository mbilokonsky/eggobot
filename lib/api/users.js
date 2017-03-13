var config = require("./config");
const axios = require('axios');

let url = process.env.EGGHEAD_API_URL;

module.exports.getInstructorByName = name => {
  return axios.get(`${url}/instructors?name=${encodeURIComponent(name)} `, {
    headers: config.headers
  })
}

module.exports.getInstructorByEmail = email => {
  return axios.get(`${url}/instructors?user_email=${encodeURIComponent(email)} `, {
    headers: config.headers
  })
}

module.exports.updateInstructor = (slug, payload) => {
  return axios.put(`${url}/instructors/${slug}`, payload, {headers: config.headers})
}