const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 400 },

    ingredients: [{ type: String, required: true }],
    steps: [{ type: String, required: true }],

    tags: [{ type: String, trim: true }],
    imageUrl: { type: String, trim: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

    isPublic: { type: Boolean, default: true },

    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    rejectionReason: { type: String, trim: true, maxlength: 200 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recipe", recipeSchema);
