const { WHITELIST_DOMAINS } = require("../utilities/constants.js");

const corsOptions = {
  origin: function (origin, callback) {
    WHITELIST_DOMAINS.map((item) =>
      console.log(origin, item, typeof origin, typeof item, origin === item)
    );
    if (origin && WHITELIST_DOMAINS.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`${origin} not allowed by CORS.`));
    }
  },
};

module.exports = { corsOptions };
