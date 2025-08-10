import { Server } from "http"
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";
let server: Server;

const startServer = async () => {
    try {
        await mongoose.connect(envVars.DB_URL)
        console.log("Mongoose is connected");

        server = app.listen(envVars.PORT, () => {
            console.log("Parcel Delivery API is running on port 5000 ");
        })
    } catch (error) {
        console.log(error);
    }
}

startServer()

// unhandled error 
process.on("unhandledRejection", (err) => {
    console.log("unhandled rejection detected... server shutting down", err);
    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }
})

// uncaught error 
process.on("uncaughtException", (err) => {
    console.log("uncaught error detected... server shutting down", err);
    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }
})

// signal termination  error
process.on("SIGTERM", () => {
    console.log("Sigterm signal received.... server shutting down");
    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }
})

process.on("SIGINT", () => {
    console.log("Sigint signal received.... server shutting down");
    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }
})