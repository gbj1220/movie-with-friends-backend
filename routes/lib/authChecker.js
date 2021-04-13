const jwt = require("jsonwebtoken");
const mongoDBErrorHelper = require("./mongoDBErrorHelper");

const checkIfUserHasValidJwtToken = async (req, res, next) => {
  try {
    console.log(req.headers);
    if (req.headers && req.headers.authorization) {
      const jwtToken = req.headers.authorization.slice(7);
      const decodedJWT = jwt.verify(jwtToken, process.env.JWT_VERY_SECRET);
      if (decodedJWT) {
        next();
      }
    } else {
      throw { message: "You don't have permission!" };
    }
  } catch (e) {
    res.status(500).json(mongoDBErrorHelper(e));
  }
};

module.exports = {
  checkIfUserHasValidJwtToken,
};
