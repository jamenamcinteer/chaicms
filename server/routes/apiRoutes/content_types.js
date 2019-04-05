// const passport = require("passport");
const mongoose = require("mongoose");

const ContentType = mongoose.model("content_types");

module.exports = app => {
  app.get("/api/content_types", (req, res) => {
    ContentType.find({}, function(err, contentTypes) {
      res.send(contentTypes);
    });
  });

  app.post("/api/content_types", async (req, res) => {
    // Would also add createdBy and lastUpdatedBy here once user auth is hooked up
    let update = new ContentType({
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      ...req.body
    });
    try {
      const contentType = await update.save();
      res.send(contentType);
    } catch (err) {
      res.status(422).send(err);
    }
  });

  app.put("/api/content_types/:id", (req, res) => {
    // var update = new User({ _id: req.params.id, ...req.body });
    // update.isNew = false;
    // update.save(err => {
    //   if (err) res.send(err);
    //   else {
    //     res.send({ message: "ok" });
    //   }
    // });
  });
};
