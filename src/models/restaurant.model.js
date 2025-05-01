import mongoose, { Schema } from "mongoose";

const restaurantSchema = new Schema(
  {
    restaurant_name: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    restaurant_type: {
      type: String,
      enum: ["veg", "non-veg", "both"],
      required: true,
    },
    restaurant_description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: true,
  }
);

export const Restaurant = mongoose.model("Restaurant", restaurantSchema);
