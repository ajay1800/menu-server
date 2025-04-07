import { Router } from "express";
import {
  createMenu,
  deleteMenu,
  getMenu,
  updateMenuItem,
} from "../controllers/menuController.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create").post(protectRoute, createMenu);
router.route("/get").get(protectRoute, getMenu);
router.route("/update").patch(protectRoute, updateMenuItem);
router.route("/delete").delete(protectRoute, deleteMenu);

export default router;
