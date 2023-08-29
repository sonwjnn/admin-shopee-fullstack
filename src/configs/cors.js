const { WHITELIST_DOMAINS } = require("../utilities/constants.js");

const corsOptions = {
  origin: function (origin, callback) {
    const check = WHITELIST_DOMAINS.some((item) => item === origin);
    if (!origin || check) {
      callback(null, true);
    } else {
      callback(new Error(`${origin} not allowed by CORS.`));
    }
  },
};

module.exports = { corsOptions };
