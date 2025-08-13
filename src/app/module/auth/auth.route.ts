import { Router } from "express";
import { AuthController } from "./auth.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middleware/validateRequest";
import { createResetPasswordZodSchema } from "./auth.validation";

const router = Router()
router.post("/login", AuthController.credentialsLogin)
router.post("/refresh-token", AuthController.getNewAccessToken)
router.post("/logout", AuthController.logout)
router.post("/reset-password", checkAuth(...Object.values(Role)), validateRequest(createResetPasswordZodSchema), AuthController.resetPassword)

export const authRoutes = router;