const router = require("express").Router();
const Recipe = require("../models/Recipe");

router.get("/recipes", async (req, res, next) => {
  try {
    const { q } = req.query;

    const filter = { status: "approved", isPublic: true };

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { ingredients: { $elemMatch: { $regex: q, $options: "i" } } },
        { tags: { $elemMatch: { $regex: q, $options: "i" } } }
      ];
    }

    const recipes = await Recipe.find(filter).sort({ createdAt: -1 });
    res.json(recipes);
  } catch (err) {
    next(err);
  }
});


router.get("/recipes/:id", async (req, res, next) => {
  try {
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      status: "approved",
      isPublic: true
    });

    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json(recipe);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
