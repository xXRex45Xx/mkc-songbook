import { config } from "dotenv";
import { connect } from "./config/db.js";
import express from "express";
import apiRouter from "./routes/index.js";
import cors from "cors";
import "./config/nodemailer.config.js";
import "./config/passport.config.js";
import { MulterError } from "multer";

if (config().error) throw config().error;

const app = express();

app.use(
    cors({
        origin: ["http://localhost:5173"],
    })
);
app.use(express.json());
app.use("/api", apiRouter);

app.use(async (err, _req, res, _next) => {
    let { message, statusCode = 500 } = err;
    if (err instanceof MulterError && err.code === "LIMIT_FILE_SIZE")
        statusCode = 400;
    if (statusCode === 500) {
        console.error("Server error: ", err);
        console.error("Internal error: ", err.internalError);
        message = "An unexpected error occurred.";
    }
    res.status(statusCode).json({ message });
});

connect(process.env.DB_URI).then(() => {
    app.listen(process.env.PORT, () =>
        console.log("Server started on port: ", process.env.PORT)
    );
});
