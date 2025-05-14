import { Menu } from "../models/menu.model.js";
import { Restaurant } from "../models/restaurant.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createMenu = asyncHandler(async (req, res) => {
  //* get user id from token header and find user based on id
  const userId = req.user?._id;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json(new ApiError(404, "User not found"));
  }

  //* Get menu body details
  const bodyData = req.body;

  //* check restaurant

  const restaurant = await Restaurant.findById(bodyData.restaurant_id);

  if (!restaurant) {
    return res.status(404).json(new ApiError(404, "Restaurant not found"));
  }

  //* Check menu is exit with restaurant id

  const existedMenu = await Menu.findOne({ restaurant_id: restaurant._id });

  if (existedMenu) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "Menu is already exist for this restaurant please edit the menu"
        )
      );
  }

  const menu = await Menu.create(bodyData);

  return res
    .status(200)
    .json(new ApiResponse(201, menu, "Menu created successfully"));
});

const getMenu = asyncHandler(async (req, res) => {
  const { restaurant_id } = req.query;

  const menu = await Menu.findOne({ restaurant_id: restaurant_id });

  return res
    .status(200)
    .json(new ApiResponse(200, menu, "Menu Fetched Successfully!"));
});

const updateMenu = asyncHandler(async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json(new ApiError(400, "Menu Id is required!"));
  }

  const existedMenu = await Menu.findById(id);

  if (!existedMenu) {
    return res
      .status(404)
      .json(new ApiError(404, "Menu Data not found using by given id"));
  }

  const updateData = req.body;

  const menu = await Menu.findByIdAndUpdate(id, {
    $push: {
      menu: { $each: updateData },
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, menu, "Menu updated successfully!"));
});

const deleteMenu = asyncHandler(async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json(new ApiError(400, "Menu id is required"));
  }

  const existedMenu = await Menu.findById(id);

  if (!existedMenu) {
    return res
      .status(404)
      .json(new ApiError(404, "Menu not found using given id"));
  }

  await Menu.findByIdAndDelete(id);

  return res.status(200).json(200, null, "Menu Deleted Successfully!");
});

const getMenuItem = asyncHandler(async (req, res) => {
  const { id, menu_id } = req.params;

  // find menu array with id and menu item using menu id

  const menu = await Menu.findById(id);

  if (!menu) {
    return res.status(404).json(new ApiError(404, "Menu no found!"));
  }

  const menuItem = menu.menu.id(menu_id);

  if (!menuItem) {
    return res.status(404).json(new ApiError(404, "Menu Item no found!"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, menuItem, "Menu Item Fetched Successfully!"));
});

const updateMenuItem = asyncHandler(async (req, res) => {
  const { id, menu_id } = req.params;
  const updateItem = req.body;

  const menu = await Menu.findById(id);

  if (!menu) {
    return res.status(404).json(new ApiError(404, "Menu not found!"));
  }

  const menuItem = menu.menu.id(menu_id);

  if (!menuItem) {
    return res.status(404).json(new ApiError(404, "Menu item is not found!"));
  }

  Object.assign(menuItem, updateItem);

  await menu.save();

  return res
    .status(200)
    .json(new ApiResponse(200, menu, "Menu Item Updated successfully!"));
});

const deleteMenuItem = asyncHandler(async (req, res) => {
  const { id, menu_id } = req.params;

  const menuData = await Menu.findById(id);

  if (!menuData) {
    return res.status(404).json(new ApiError(404, "Menu not found"));
  }

  const menuItem = menuData.menu.id(menu_id);

  if (!menuItem) {
    return res.status(404).json(new ApiError(404, "Menu item is not found"));
  }

  const deleteItem = await Menu.findByIdAndUpdate(
    id,
    { $pull: { menu: { _id: menu_id } } },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, deleteItem, "Menu item is deleted successfully!")
    );
});

const addMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const itemData = req.body;

  const menu = await Menu.findById(id);

  if (!menu) {
    return res.status(404).json(new ApiError(404, "Menu not found!"));
  }

  const addItem = await Menu.findByIdAndUpdate(
    id,
    { $push: { menu: itemData } },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, addItem, "Menu item added successfully!"));
});

export {
  createMenu,
  getMenu,
  updateMenu,
  deleteMenu,
  getMenuItem,
  updateMenuItem,
  deleteMenuItem,
  addMenuItem,
};
