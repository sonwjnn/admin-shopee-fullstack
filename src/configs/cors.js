const { WHITELIST_DOMAINS } = require("../utilities/constants.js");

const corsOptions = {
  origin: function (origin, callback) {
    console.log(WHITELIST_DOMAINS.indexOf(origin));
    if (origin && WHITELIST_DOMAINS.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`${origin} not allowed by CORS.`));
    }
  },
};

module.exports = { corsOptions };
