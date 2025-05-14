import { Router } from "express";
import {
  createMenu,
  deleteMenu,
  getMenu,
  updateMenu,
  getMenuItem,
  updateMenuItem,
  addMenuItem,
  deleteMenuItem,
} from "../controllers/menuController.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create").post(protectRoute, createMenu);
router.route("/get").get(protectRoute, getMenu);
router.route("/update").patch(protectRoute, updateMenu);
router.route("/delete").delete(protectRoute, deleteMenu);
router.route("/get/:id/menu/:menu_id").get(protectRoute, getMenuItem);
router.route("/update/:id/menu/:menu_id").patch(protectRoute, updateMenuItem);
router.route("/add/:id/menu").put(protectRoute, addMenuItem);
router.route("/delete/:id/menu/:menu_id").delete(protectRoute, deleteMenuItem);

export default router;
