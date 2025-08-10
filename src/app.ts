import express, { Request, Response } from "express"
import cors from "cors"
import { router } from "./app/routes";

const app = express();
app.use(cors());
app.use(express.json())

app.use("/api/v1", router)

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Parcel Delivery API is running..."
    })
})

export default app;