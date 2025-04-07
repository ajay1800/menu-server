import mongoose, { Schema } from "mongoose";

const menuSchema = new Schema(
  {
    restaurant_id: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
    },
    menu: [
      {
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        category: {
          type: String,
          enum: ["veg", "non-veg"],
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        image: {
          type: String,
        },
        cooking_time: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: true,
  }
);

export const Menu = mongoose.model("Menu", menuSchema);
