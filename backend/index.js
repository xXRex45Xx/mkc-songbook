import { config } from "dotenv";
import { connect } from "./config/db.js";
import express from "express";
import apiRouter from "./routes/index.js";
import cors from "cors";

if (config().error) throw config().error;

const app = express();

app.use(
    cors({
        origin: ["http://localhost:5173"],
    })
);
app.use(express.json());
app.use("/api", apiRouter);

connect(process.env.DB_URI).then(() => {
    app.listen(process.env.PORT, () =>
        console.log("Server started on port: ", process.env.PORT)
    );
});
