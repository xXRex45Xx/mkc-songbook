/**
 * Database initialization module for the MKC Choir application.
 * This module handles the initial setup of the database by populating songs from a JSON file
 * and creating a default admin user if none exists.
 */

import path from "path";
import SongModel from "../models/song.model.js";
import UserModel from "../models/user.model.js";
import fs from "fs";

/**
 * Initializes the database with songs and a default admin user if they don't exist.
 * @param {Object} defAdminUser - The default admin user object to create if no admin exists
 * @param {string} defAdminUser.email - Email address of the default admin
 * @param {string} defAdminUser.name - Name of the default admin
 * @param {string} defAdminUser.photo - Photo URL of the default admin
 * @throws {Error} If creation of default admin user fails
 * @returns {Promise<void>}
 */
const initDb = async (defAdminUser) => {
    const numOfSongs = await SongModel.countDocuments({});
    const numOfAdmins = await UserModel.countDocuments({ role: "super-admin" });
    if (numOfSongs === 0) {
        const songs = JSON.parse(
            fs.readFileSync(path.join(import.meta.dirname, "final_songs.json"))
        );
        const songModels = [];
        for (const song of songs) {
            songModels.push(
                new SongModel({
                    _id: song.id,
                    title: song.name,
                    lyrics: song.detail,
                    createdAt: song.year,
                    musicElements: {
                        chord: song.chord,
                        tempo: song.tempo,
                        rythm: song.rythm,
                    },
                })
            );
        }
        await SongModel.insertMany(songModels);
    }
    if (numOfAdmins === 0) {
        const admin = await UserModel.create({
            name: defAdminUser.name,
            email: defAdminUser.email,
            photo: defAdminUser.photo,
            role: "super-admin",
        });
        if (!admin) throw new Error("Falied to create default admin user.");
    }
};

export default initDb;
