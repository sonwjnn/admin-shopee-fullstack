const { WHITELIST_DOMAINS } = require("../utilities/constants.js");

const corsOptions = {
  // origin: function (origin, callback) {
  //   if (origin && WHITELIST_DOMAINS.includes(origin)) {
  //     callback(null, true);
  //   } else {
  //     callback(new Error(`${origin} not allowed by CORS.`));
  //   }
  // },
  origin: function (origin, callback) {
    callback(null, true);
  },
};

module.exports = { corsOptions };
