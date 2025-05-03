import { Router } from "express";
import {
  getRestaurantFilters,
  getUserRestaurant,
  registerRestaurant,
  removeRestaurant,
  updateRestaurant,
} from "../controllers/restaurantController.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create").post(protectRoute, registerRestaurant);
router.route("/get").get(protectRoute, getUserRestaurant);
router.route("/update").patch(protectRoute, updateRestaurant);
router.route("/delete").delete(protectRoute, removeRestaurant);
router.route("/get-restaurant").get(protectRoute, getUserRestaurant);

export default router;
