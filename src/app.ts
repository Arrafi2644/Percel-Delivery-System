import express, { Request, Response } from "express"
import cors from "cors"
import { router } from "./app/routes";
import notFound from "./app/middleware/notFound";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import cookieParser from "cookie-parser"

const app = express();
app.use(cors());
app.use(express.json())
app.use(cookieParser())

app.use("/api/v1", router)

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Parcel Delivery API is running..."
    })
})

app.use(globalErrorHandler)
app.use(notFound)
export default app;