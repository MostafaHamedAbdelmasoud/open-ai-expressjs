
const express = require('express');
const passport = require('passport');

const router = express.Router();

require("../src/config/google");
require("../src/config/passport");

router.get(
    "/",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })
);

router.get(
    "/callback",
    passport.authenticate("google", {
        failureRedirect: "/",
        successRedirect: "/",
        failureFlash: true,
        failWithError: true,
        successFlash: "Successfully logged in!",
    })
);

module.exports = router