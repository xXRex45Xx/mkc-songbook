import multer from "multer";
import {
    albumImageOpts,
    audioOpts,
    userImageOpts,
} from "../config/multer.config.js";

export const userImageUpload = multer(userImageOpts);

export const albumImageUpload = multer(albumImageOpts);

export const audioUpload = multer(audioOpts);
