const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models/User");

const JwtPrivateKey = process.env.JwtPrivateKey;

// Options for JWT
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JwtPrivateKey,
};

const jwtStrategy = new JwtStrategy(options, (payload, done) => {
  User.findOne({ _id: payload.sub })
    .then((user) => {
      if (user) {
        // Returns (no error, user found)
        return done(null, user);
      } else {
        // Returns (no error, no user found)
        return done(null, false);
      }
    })
    // Catches error (error, no user found)
    .catch((err) => done(err, null));
});

module.exports = (passport) => {
  passport.use(jwtStrategy);
};
