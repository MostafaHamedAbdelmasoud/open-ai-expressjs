const passport = require("passport");
const User = require("../../models/user");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const UserService = require('../user')

const callbackURL = "http://localhost:81/auth/google/callback";
passport.use(
  new GoogleStrategy(
    {
      callbackURL: callbackURL,
      clientID: process.env.google_client_id,
      clientSecret: process.env.google_client_secret,
    },
    async (accessToken, refreshToken, profile, done) => {
      const id = profile.id;
      const email = profile.emails[0].value;
      const firstName = profile.name.givenName;
      const lastName = profile.name.familyName;
      const profilePhoto = profile.photos[0].value;
      const source = "google";

      const currentUser = await UserService.getUserByEmail({
        email,
      });

      if (!currentUser) {
        const newUser = await UserService.addGoogleUser({
          id,
          email,
          firstName,
          lastName,
          profilePhoto,
          source
        });
        return done(null, newUser);
      }

      if (currentUser.source != "google") {
        //return error
        return done(null, false, {
          message: `You have previously signed up with a different signin method`,
        });
      }

      currentUser.lastVisited = new Date();
      return done(null, currentUser);
    }
  )
);