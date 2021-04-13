var express = require("express");
var router = express.Router();
const {
  createFriend,
  getAllFriends,
} = require("./controller/friendsController");
const { checkIfUserHasValidJwtToken } = require("../lib/authChecker");

/* GET home page. */
router.get("/get-all-friends", checkIfUserHasValidJwtToken, getAllFriends);

router.post("/create-friend", checkIfUserHasValidJwtToken, createFriend);

module.exports = router;
