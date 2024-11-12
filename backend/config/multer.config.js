import multer from "multer";
import { ClientFaultError } from "../utils/error.util.js";
import {
    AUDIO_MIMETYPE_MAP,
    IMAGE_MIMETYPE_MAP,
} from "../utils/mime-type-to-ext.util.js";
import { v1 } from "uuid";
import { config } from "dotenv";
import path from "path";

config();

export const userImageOpts = {
    storage: multer.diskStorage({
        destination: path.join(process.cwd(), process.env.IMAGE_STORAGE),
        filename: (req, file, cb) => {
            const userId = req.user._id;
            const fileExt = IMAGE_MIMETYPE_MAP[file.mimetype];
            cb(null, `${userId}.${fileExt}`);
        },
    }),
    limits: { fileSize: 30 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (!IMAGE_MIMETYPE_MAP[file.mimetype])
            return cb(new ClientFaultError("Unsupported image format."), false);
        cb(null, true);
    },
};

export const albumImageOpts = {
    storage: multer.diskStorage({
        destination: path.join(process.cwd(), process.env.IMAGE_STORAGE),
        filename: (_req, file, cb) => {
            const fileExt = IMAGE_MIMETYPE_MAP[file.mimetype];
            cb(null, `${v1()}.${fileExt}`);
        },
    }),
    limits: { fileSize: 30 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (!IMAGE_MIMETYPE_MAP[file.mimetype])
            return cb(new ClientFaultError("Unsupported image format."), false);
        cb(null, true);
    },
};

export const audioOpts = {
    storage: multer.diskStorage({
        destination: path.join(process.cwd(), process.env.AUDIO_STORAGE),
        filename: (_req, file, cb) => {
            const fileExt = AUDIO_MIMETYPE_MAP[file.mimetype];
            cb(null, `${v1()}.${fileExt}`);
        },
    }),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (!AUDIO_MIMETYPE_MAP[file.mimetype])
            return cb(new ClientFaultError("Unsupported audio format."), false);
        cb(null, true);
    },
};
