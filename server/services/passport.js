const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const TwitterStrategy = require("passport-twitter").Strategy;
const mongoose = require("mongoose");
const keys = require("../config/keys");

const User = mongoose.model("users"); // fetching out of mongoose
const Settings = mongoose.model("settings");

// first arg is user model, second is done
passport.serializeUser((user, done) => {
  done(null, user.id); // user.id is identifying piece of information for identifying user in followup requests; this id is NOT the profile id, it is generated by MongoDB (_id property); can not assume that user has google id, could be facebook or something else; everyone will have an idea generated by mongo; after oauth authentication, we only care about this user.id, not the profile.id
});

passport.deserializeUser((id, done) => {
  // query our collection looking for a user with the id we have
  User.findById(id).then(user => {
    done(null, user);
  });
});

var setPassportStrategies = () => {
  Settings.find({}, function(err, settings) {}).then(existingSettings => {
    existingSettings[0].signInMethods.map(signInMethod => {
      if (signInMethod.type === "google" && signInMethod.enabled) {
        passport.use(
          new GoogleStrategy(
            {
              clientID: signInMethod.clientID,
              clientSecret: signInMethod.clientSecret,
              callbackURL: "/auth/google/callback",
              proxy: true
            },
            (accessToken, refreshToken, profile, done) => {
              // console.log("profile", profile);

              // initiate a search over all records in collection
              // returns a promise (async)
              // findOne grabs an instance from the User collection
              User.findOne({ googleId: profile.id }).then(existingUser => {
                if (existingUser) {
                  // we already have a record with the given profile id
                  done(null, existingUser); // first argument is error
                } else {
                  // we don't have a user record with this ID, make a new record
                  User.count({}, function(err, count) {
                    let newUserRole;
                    if (count === 0) {
                      newUserRole = "owner";
                    } else {
                      newUserRole = existingSettings[0].defaultUserRole
                        ? existingSettings[0].defaultUserRole
                        : "member";
                    }
                    new User({
                      googleId: profile.id,
                      displayName: profile.displayName,
                      email: profile.email,
                      isApproved: existingSettings[0].requireInviteCodes
                        ? false
                        : true,
                      photoURL: profile.photoURL,
                      role: newUserRole
                    })
                      .save()
                      .then(user => done(null, user)); // new instance of a user, then save to db
                  });
                }
              });
            }
          )
        ); // new instance of google strategy, pass in config
      } else if (signInMethod.type === "github" && signInMethod.enabled) {
        passport.use(
          new GitHubStrategy(
            {
              clientID: signInMethod.clientID,
              clientSecret: signInMethod.clientSecret,
              callbackURL: "/auth/github/callback"
            },
            function(accessToken, refreshToken, profile, done) {
              User.findOne({ githubId: profile.id }).then(existingUser => {
                if (existingUser) {
                  done(null, existingUser);
                } else {
                  User.count({}, function(err, count) {
                    let newUserRole;
                    if (count === 0) {
                      newUserRole = "owner";
                    } else {
                      newUserRole = existingSettings[0].defaultUserRole
                        ? existingSettings[0].defaultUserRole
                        : "member";
                    }
                    new User({
                      githubId: profile.id,
                      displayName: profile.displayName,
                      email: profile._json.email,
                      isApproved: existingSettings[0].requireInviteCodes
                        ? false
                        : true,
                      photoURL: profile._json.avatar_url,
                      role: newUserRole
                    })
                      .save()
                      .then(user => done(null, user));
                  });
                }
              });
            }
          )
        );
      } else if (signInMethod.type === "facebook" && signInMethod.enabled) {
        passport.use(
          new FacebookStrategy(
            {
              clientID: signInMethod.clientID,
              clientSecret: signInMethod.clientSecret,
              callbackURL: "/auth/facebook/callback",
              profileFields: ["id", "displayName", "email", "profile_pic"]
            },
            function(accessToken, refreshToken, profile, done) {
              User.findOne({ facebookId: profile.id }).then(existingUser => {
                if (existingUser) {
                  done(null, existingUser);
                } else {
                  User.count({}, function(err, count) {
                    let newUserRole;
                    if (count === 0) {
                      newUserRole = "owner";
                    } else {
                      newUserRole = existingSettings[0].defaultUserRole
                        ? existingSettings[0].defaultUserRole
                        : "member";
                    }
                    new User({
                      facebookId: profile.id,
                      displayName: profile.displayName,
                      email: profile.email,
                      photoURL: profile.profile_pic,
                      isApproved: existingSettings[0].requireInviteCodes
                        ? false
                        : true,
                      role: newUserRole
                    })
                      .save()
                      .then(user => done(null, user));
                  });
                }
              });
            }
          )
        );
      } else if (signInMethod.type === "twitter" && signInMethod.enabled) {
        passport.use(
          new TwitterStrategy(
            {
              clientID: signInMethod.clientID,
              clientSecret: signInMethod.clientSecret,
              callbackURL: "/auth/twitter/callback"
            },
            function(accessToken, refreshToken, profile, done) {
              User.findOne({ twitterId: profile.id }).then(existingUser => {
                if (existingUser) {
                  done(null, existingUser);
                } else {
                  User.count({}, function(err, count) {
                    let newUserRole;
                    if (count === 0) {
                      newUserRole = "owner";
                    } else {
                      newUserRole = existingSettings[0].defaultUserRole
                        ? existingSettings[0].defaultUserRole
                        : "member";
                    }
                    new User({
                      twitterId: profile.id,
                      displayName: profile.name,
                      email: profile.email,
                      photoURL: profile.profile_image_url_https,
                      isApproved: existingSettings[0].requireInviteCodes
                        ? false
                        : true,
                      role: newUserRole
                    })
                      .save()
                      .then(user => done(null, user));
                  });
                }
              });
            }
          )
        );
      }
    });
  });
};

setPassportStrategies();
