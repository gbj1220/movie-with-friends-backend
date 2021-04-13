const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const User = require("../model/User");
const mongoDBErrorHelper = require("../../lib/mongoDBErrorHelper");

module.exports = {
  signUp: async (req, res) => {
    try {
      let salted = await bcrypt.genSalt(10);
      let hashedPassword = await bcrypt.hash(req.body.password, salted);

      let createdUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPassword,
      });

      let savedUser = await createdUser.save();

      res.json({
        data: savedUser,
      });
    } catch (e) {
      res.status(500).json(mongoDBErrorHelper(e));
    }
  },
  login: async (req, res) => {
    try {
      let foundUser = await User.findOne({ email: req.body.email });

      if (!foundUser) {
        throw { message: "Email is not registered, please go sign up!" };
      }

      let comparedPassword = await bcrypt.compare(
        req.body.password,
        foundUser.password
      );

      if (!comparedPassword) {
        throw { message: "Check your email and password!" };
      } else {
        let jwtToken = jwt.sign(
          {
            email: foundUser.email,
          },
          process.env.JWT_VERY_SECRET,
          { expiresIn: "4h" }
        );

        res.json({
          jwtToken: jwtToken,
        });
      }
    } catch (e) {
      res.status(500).json(mongoDBErrorHelper(e));
    }
  },

  updateUserPassword: async (req, res) => {
    try {
      /* Finding the user by their email address */
      let foundUser = await User.findOne({ email: req.body.email });
      console.log(req.body);

      if (!foundUser) {
        throw { message: "User not found!" };
      }

      /* Using bcrypt to compare the password typed in and the password in the database */
      let comparedPassword = await bcrypt.compare(
        req.body.oldPassword,
        foundUser.password
      );
      /* If the password do not match, throw the error code below */
      if (!comparedPassword) {
        throw { message: "Cannot update your password, check again!" };
      }

      /* Setting up the encryption for the user. Once the password is submitted it will be encrypted with bcrypt. */
      let salted = await bcrypt.genSalt(10);
      let hashedNewPassword = await bcrypt.hash(req.body.newPassword, salted);

      await User.findOneAndUpdate(
        { email: req.body.email },
        { password: hashedNewPassword },
        { new: true }
      );

      res.json({
        message: "success",
        payload: true,
      });
    } catch (e) {
      res.status(500).json(mongoDBErrorHelper(e));
    }
  },

  sendSMSTwilio: async (req, res) => {
    console.log(req.body);

    try {
      let sentSMS = await client.messages.create({
        body: `Hey ${req.body.targetUser.nickName}, 
        I found this cool movie called ${req.body.title} and here's the plot: ${req.body.plot}
        Here's the imdb link: "https://www.imdb.com/title/${req.body.imdbID}
        `,

        from: "+14159961551",
        to:
          "+14128628882" /* req.body.targetUser.mobileUser (We are not using the paid version of app so we can't actually do this step) */,
      });
      res.json(sentSMS);
    } catch (e) {
      console.log(e);
      res.status(500).json(mongoDBErrorHelper(e));
    }
  },
};
