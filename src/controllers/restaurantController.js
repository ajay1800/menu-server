import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Restaurant } from "../models/restaurant.model.js";

//! Register a new restaurant using user id
const registerRestaurant = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const { restaurant_name, restaurant_type, restaurant_description } = req.body;

  const data = {
    restaurant_name,
    restaurant_type,
    restaurant_description,
    user: userId,
  };

  const restaurant = await Restaurant.create(data);

  return res
    .status(201)
    .json(new ApiResponse(201, restaurant, "Restaurant created successfully"));
});

const getUserRestaurant = asyncHandler(async (req, res) => {
  //* get user id from token header and find user based on id
  const userId = req.user?._id;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const restaurants = await Restaurant.find({ user: userId });

  if (!restaurants && restaurants.length === 0) {
    throw new ApiError(404, "Restaurants not found register a new restaurant");
  }

  return res.status(200).json(new ApiResponse(200, restaurants, "Success"));
});

const getRestaurantFilters = asyncHandler(async (req, res) => {
  const { name, id, page, limit, type } = req.query;
});

const updateRestaurant = asyncHandler(async (req, res) => {
  //* get id from query param
  const { id } = req.query;
  const { restaurant_name, restaurant_type, restaurant_description } = req.body;

  const existedRestaurant = await Restaurant.findById(id);

  if (!existedRestaurant) {
    throw new ApiError(404, "Restaurant is not found using the given id");
  }

  const updatedData = {
    restaurant_name,
    restaurant_type,
    restaurant_description,
  };

  const restaurant = await Restaurant.findByIdAndUpdate(id, updatedData);

  return res
    .status(200)
    .json(new ApiResponse(200, restaurant, "Restaurant updated successfully!"));
});

const removeRestaurant = asyncHandler(async (req, res) => {
  const { id } = req.query;

  //* Find restaurant by id

  const existedRestaurant = await Restaurant.findById(id);

  if (!existedRestaurant) {
    throw new ApiError(404, "Restaurant is not found");
  }

  await Restaurant.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Restaurant removed successfully!"));
});

export {
  registerRestaurant,
  getUserRestaurant,
  getRestaurantFilters,
  updateRestaurant,
  removeRestaurant,
};
