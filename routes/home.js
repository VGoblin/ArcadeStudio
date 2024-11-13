const passportConfig = require("../config/passport.js");
const homeController = require("../controllers/home.js");

module.exports = function (app) {
  app.get("/", homeController.index);
  app.get("/learn", homeController.learn);
  app.post("/contact", homeController.contact);
  app.get("/create", async (req, res) => {
    res.redirect('/create/portfolio');
  });
  app.get("/create/:tabname", passportConfig.isAuthenticated, homeController.create);
  app.get("/create/:tabname/:subtabname", passportConfig.isAuthenticated, homeController.create);
};

