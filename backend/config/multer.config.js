import multer from "multer";
import { ClientFaultError } from "../utils/error.util.js";

export const userImageOpts = {
    storage: multer.diskStorage({
        destination: process.env.USER_IMAGE_STORAGE,
        filename: (req, file, cb) => {
            const userId = req.user._id;
            const fileExt = path.extname(file.originalname);
            cb(null, `${userId}${fileExt}`);
        },
    }),
    limits: { fileSize: 30 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype !== "image/jpeg" || file.mimetype === "image/jpg")
            return cb(new ClientFaultError("Unsupported image format."), false);
        cb(null, true);
    },
};

export const albumImageOpts = {
    storage: multer.diskStorage({
        destination: process.env.ALBUM_COVER_STORAGE,
    }),
    limits: { fileSize: 30 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype !== "image/jpeg" || file.mimetype === "image/jpg")
            return cb(new ClientFaultError("Unsupported image format."), false);
        cb(null, true);
    },
};

export const audioOpts = {
    storage: multer.diskStorage({
        destination: process.env.AUDIO_STORAGE,
    }),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype !== "audio/mpeg" && file.mimetype !== "audio/aac")
            return cb(new ClientFaultError("Unsupported audio format."), false);
        cb(null, true);
    },
};
