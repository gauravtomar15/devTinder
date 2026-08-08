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

const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Configure Multer storage
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, JPG, PNG, WEBP, and GIF images are allowed."));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: fileFilter
});

profileRouter.post("/profile/upload", userAuth, (req, res) => {
  upload.single("photo")(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File is too large. Max size is 5MB." });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Please select an image file to upload." });
    }

    try {
      const relativePath = `/uploads/${req.file.filename}`;
      const loggedInUser = req.user;
      loggedInUser.photoUrl = relativePath;
      await loggedInUser.save();

      res.json({
        message: "Profile image uploaded and updated successfully.",
        photoUrl: relativePath,
        data: loggedInUser
      });
    } catch (dbErr) {
      res.status(500).json({ error: "Failed to update profile photo in database.", details: dbErr.message });
    }
  });
});

module.exports = profileRouter;
