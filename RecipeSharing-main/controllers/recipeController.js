const Recipe = require("../models/Recipe");
const sendEmail = require("../utils/sendEmail");

const createRecipe = async (req, res, next) => {
  try {
    delete req.body.status;

    const recipe = await Recipe.create({
      title: req.body.title,
      description: req.body.description || "",
      ingredients: req.body.ingredients,
      steps: req.body.steps,
      tags: req.body.tags || [],
      imageUrl: req.body.imageUrl || "",
      isPublic: req.body.isPublic !== false,
      owner: req.user._id,
      status: "pending"
    });

    res.status(201).json(recipe);
  } catch (err) {
    next(err);
  }
};

const getRecipes = async (req, res, next) => {
  try {
    const all = req.query.all === "true";

    const filter = all && req.user.role === "admin"
      ? {}
      : { owner: req.user._id };

    const recipes = await Recipe.find(filter).sort({ createdAt: -1 });
    res.json(recipes);
  } catch (err) {
    next(err);
  }
};

const getRecipeById = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const isOwner = String(recipe.owner) === String(req.user._id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Forbidden" });

    res.json(recipe);
  } catch (err) {
    next(err);
  }
};

const updateRecipe = async (req, res, next) => {
  try {
    delete req.body.status;

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const isOwner = String(recipe.owner) === String(req.user._id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Forbidden" });

    const fields = ["title", "description", "ingredients", "steps", "tags", "imageUrl", "isPublic"];
    fields.forEach(f => {
      if (req.body[f] !== undefined) recipe[f] = req.body[f];
    });

    await recipe.save();
    res.json(recipe);
  } catch (err) {
    next(err);
  }
};

const deleteRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const isOwner = String(recipe.owner) === String(req.user._id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Forbidden" });

    await recipe.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
};

const approveRecipe = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const recipe = await Recipe.findById(req.params.id).populate("owner", "email username");
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    recipe.status = "approved";
    recipe.rejectionReason = undefined;
    await recipe.save();

    if (recipe.owner?.email) {
      await sendEmail({
        to: recipe.owner.email,
        subject: "Your recipe has been approved ✅",
        html: `
          <h2>Recipe Approved</h2>
          <p>Hi ${recipe.owner.username || "user"},</p>
          <p>Your recipe <b>${recipe.title}</b> has been approved and is now visible on the website.</p>
          <p>Thanks for sharing!</p>
        `
      });
    }

    res.json({ message: "Recipe approved (email sent)", recipe });
  } catch (err) {
    next(err);
  }
};

const rejectRecipe = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const recipe = await Recipe.findById(req.params.id).populate("owner", "email username");
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const reason = (req.body?.reason || "Not approved").toString();

    recipe.status = "rejected";
    recipe.rejectionReason = reason;
    await recipe.save();

    if (recipe.owner?.email) {
      await sendEmail({
        to: recipe.owner.email,
        subject: "Your recipe was rejected ❌",
        html: `
          <h2>Recipe Rejected</h2>
          <p>Hi ${recipe.owner.username || "user"},</p>
          <p>Your recipe <b>${recipe.title}</b> was rejected.</p>
          <p><b>Reason:</b> ${reason}</p>
          <p>You can edit and submit again.</p>
        `
      });
    }

    res.json({ message: "Recipe rejected (email sent)", recipe });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  approveRecipe,
  rejectRecipe
};
