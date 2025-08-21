import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { CreateParcelZodSchema } from "./parcel.validation";
import { ParcelController } from "./parcel.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.post("/", checkAuth(Role.SENDER, Role.ADMIN, Role.SUPER_ADMIN), validateRequest(CreateParcelZodSchema), ParcelController.createParcel)
router.patch("/cancel/:id", checkAuth(Role.SENDER, Role.ADMIN, Role.SUPER_ADMIN), ParcelController.cancelParcel)
router.get("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ParcelController.getAllParcel)
router.get("/me", checkAuth(...Object.values(Role)), ParcelController.getMyParcels)
router.get("/:id", checkAuth(...Object.values(Role)), ParcelController.getParcelById)
router.patch("/:id", checkAuth(...Object.values(Role)), ParcelController.updateParcel)
router.get("/:id/status-log", checkAuth(...Object.values(Role)), ParcelController.getParcelStatusLog)
export const parcelRoutes = router;