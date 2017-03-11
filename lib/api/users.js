var config = require("./config");

module.exports.getInstructorByName = name => {
  return axios.get(`${process.env.EGGHEAD_API_URL}/instructors?name=${encodeURIComponent(name)} `, {
    headers: config.headers
  })
}

module.exports.getInstructorByEmail = email => {
  return axios.get(`${process.env.EGGHEAD_API_URL}/instructors?user_email=${encodeURIComponent(email)} `, {
    headers: config.headers
  })
}