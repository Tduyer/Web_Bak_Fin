const router = require("express").Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  approveRecipe,
  rejectRecipe
} = require("../controllers/recipeController");

router.post("/", protect, createRecipe);
router.get("/", protect, getRecipes);
router.get("/:id", protect, getRecipeById);
router.put("/:id", protect, updateRecipe);
router.delete("/:id", protect, deleteRecipe);

router.put("/:id/approve", protect, authorizeRoles("admin"), approveRecipe);
router.put("/:id/reject", protect, authorizeRoles("admin"), rejectRecipe);

module.exports = router;
