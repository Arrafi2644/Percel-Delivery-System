import { Router } from "express";
import { userRoutes } from "../module/user/user.route";
import { authRoutes } from "../module/auth/auth.route";
import { parcelRoutes } from "../module/parcel/parcel.route";



export const router = Router()
const moduleRoutes = [
    {
        path: "/user",
        route: userRoutes
    },
    {
        path: "/auth",
        route: authRoutes
    },
    {
        path: "/parcels",
        route: parcelRoutes
    }
]

moduleRoutes.forEach(route => {
    router.use(route.path, route.route)
})