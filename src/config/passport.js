const passport = require("passport");
const UserModel = require("../../models/user");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const currentUser = await UserModel.findOne({
    id,
  });
  done(null, currentUser);
});