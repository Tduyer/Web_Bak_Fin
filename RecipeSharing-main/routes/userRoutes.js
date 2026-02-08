const router = require("express").Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { getProfile, updateProfile, setUserRole } = require("../controllers/userController");

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// RBAC admin/moderator endpoint
router.put("/:id/role", protect, authorizeRoles("admin", "moderator"), setUserRole);

module.exports = router;
