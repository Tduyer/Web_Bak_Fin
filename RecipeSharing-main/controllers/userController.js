const User = require("../models/User");
const { updateProfileSchema } = require("../validators/userValidators");

async function getProfile(req, res, next) {
  try {
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { value, error } = updateProfileSchema.validate(req.body);
    if (error) {
      res.status(400);
      throw new Error(error.details[0].message);
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: value },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ user: updated });
  } catch (err) {
    next(err);
  }
}

async function setUserRole(req, res, next) {
  try {
    const { role } = req.body;
    const allowed = ["user", "premium", "moderator", "admin"];
    if (!allowed.includes(role)) {
      res.status(400);
      throw new Error("Invalid role");
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { role } },
      { new: true }
    ).select("-password");

    if (!updated) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json({ user: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile, setUserRole };
