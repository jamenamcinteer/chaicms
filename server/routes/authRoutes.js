const passport = require("passport");

module.exports = app => {
  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"]
    })
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google"),
    (req, res) => {
      res.redirect("/dashboard");
    }
  );

  app.get("/auth/github", passport.authenticate("github"));

  app.get(
    "/auth/github/callback",
    passport.authenticate("github"),
    (req, res) => {
      res.redirect("/dashboard");
    }
  );

  // app.post(
  //   "/auth/login",
  //   passport.authenticate("local", { failureRedirect: "/login" }),
  //   function(req, res) {
  //     res.redirect("/dashboard");
  //   }
  // );

  app.get("/api/logout", (req, res) => {
    req.logout(); // takes the cookie with id and kills it
    res.redirect("/");
  });

  app.get("/api/current_user", (req, res) => {
    res.send(req.user); // if logged out, req.user will be blank as will the screen
  });
};
