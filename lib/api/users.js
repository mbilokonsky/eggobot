var config = require("./config");
const axios = require('axios');

let url = process.env.EGGHEAD_API_URL;

module.exports.getInstructorByName = name => 
  axios.get(`${url}/instructors?name=${encodeURIComponent(name)} `, { headers: config.headers });

module.exports.getInstructorByEmail = email => 
  axios.get(`${url}/instructors?user_email=${encodeURIComponent(email)} `, { headers: config.headers });

module.exports.updateInstructor = (slug, payload) => {
  let endpoint = `${url}/instructors/${slug}`;
  console.log('Posting data to endpoint:', endpoint, 'payload:');
  console.dir(payload);
  return axios.put(`${url}/instructors/${slug}`, payload, { headers: config.headers });
}
  
