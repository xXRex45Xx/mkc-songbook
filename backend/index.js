import { config } from "dotenv";
import { connect } from "./config/db.js";
import express from "express";

if (config().error) throw config().error;

const app = express();

connect(process.env.DB_URI).then(() => {
    app.listen(process.env.PORT, () =>
        console.log("Server started on port: ", process.env.PORT)
    );
});
