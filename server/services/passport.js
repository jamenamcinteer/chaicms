const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github").Strategy;
// const LocalStrategy = require("passport-local").Strategy;
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
      if (signInMethod.type === "google") {
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
                      newUserRole = "member";
                    }
                    new User({
                      googleId: profile.id,
                      displayName: profile.displayName,
                      email: profile.email,
                      isApproved: true,
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
      }
    });
  });
};

setPassportStrategies();

passport.use(
  new GitHubStrategy(
    {
      clientID: keys.githubClientID,
      clientSecret: keys.githubClientSecret,
      callbackURL: "/auth/github/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      User.findOne({ githubId: profile.id }).then(existingUser => {
        if (existingUser) {
          done(null, existingUser);
        } else {
          Settings.find({}, function(err, settings) {}).then(
            existingSettings => {
              new User({
                githubId: profile.id,
                displayName: profile.displayName,
                email: profile._json.email,
                isApproved: true,
                photoURL: profile._json.avatar_url,
                role: existingSettings[0].defaultUserRole
              })
                .save()
                .then(user => done(null, user));
            }
          );
        }
      });
    }
  )
);

// passport.use(
//   new LocalStrategy(function(username, password, done) {
//     User.findOne({ username: username }).then(existingUser => {
//       if (existingUser && existingUser.verifyPassword(password)) {
//         done(null, existingUser);
//       } else if (existingUser && !existingUser.verifyPassword(password)) {
//         done(null, false);
//       } else {
//         Settings.find({}, function(err, settings) {}).then(existingSettings => {
//           new User({
//             displayName: username,
//             email: username,
//             isApproved: true,
//             role: existingSettings[0].defaultUserRole
//           })
//             .save()
//             .then(user => done(null, user));
//         });
//       }
//     });
//   })
// );
