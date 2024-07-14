const jsonwebtoken = require("jsonwebtoken");

const JwtPrivateKey = process.env.JwtPrivateKey;

// Creates a returns a json web token.
function issueJWT(user) {
  const _id = user._id;

  // const expiresIn = "1 day"; // 1 day
  const expiresIn = "10 min"; // 10 minutes
  // const expiresIn = "1 min"; // 1 minute - For testing
  // const expiresIn = "20s"; // 20 seconds - For testing

  const payload = {
    sub: _id,
    // iat: Date.now(),   // Do not include Date.now(). It messes up the expiresIn.
  };

  const signedToken = jsonwebtoken.sign(payload, JwtPrivateKey, {
    expiresIn: expiresIn,
  });

  return {
    token: "Bearer " + signedToken,
    expires: expiresIn,
  };
}

module.exports.issueJWT = issueJWT;
