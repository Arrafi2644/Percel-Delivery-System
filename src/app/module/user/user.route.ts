
import express from "express";
import { userController } from "./user.controller";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { validateRequest } from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "./user.interface";

const router = express.Router();

router.post('/register', validateRequest(createUserZodSchema), userController.createUser)
router.patch("/:id", validateRequest(updateUserZodSchema) ,checkAuth(...Object.values(Role)), userController.updateUser)
router.get("/all-users", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), userController.getAllUser)

export const userRoutes = router;