const mongoose = require("mongoose");
require("dotenv").config();

const hotSpotSchema = mongoose.Schema(
  {
    name: {
      type: Sequelize.STRING,
      maxLength: 100,
      required: true,
      trim: true,
    },
    canvasJson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

workspaceSchema.pre("save", function (next) {
  let workspace = this;
  workspace.name = workspace.name.replace(/ /g, "");
  next();
});
const Workspace = mongoose.model("Workspace", workspaceSchema);

module.exports = { Workspace };
