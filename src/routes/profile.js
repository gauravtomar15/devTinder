const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateProfileEditData } = require("../utils/validate");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.json(user);
  } catch (error) {
    res.status(404).send("something went wrong");
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateProfileEditData(req)) {
      throw new Error("please enter valid requirement");
    }

    const loggedIn = req.user;
    Object.keys(req.body).forEach((key) => (loggedIn[key] = req.body[key]));
    await loggedIn.save();

    res.json({
      message: `${loggedIn.firstName} your profile update successful`,
      data: loggedIn,
    });
  } catch (err) {
    res.status(400).send("ERROR :" + err.message);
  }
});

module.exports = profileRouter;
