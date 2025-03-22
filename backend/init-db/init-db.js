import path from "path";
import SongModel from "../models/song.model.js";
import UserModel from "../models/user.model.js";
import fs from "fs";

const initDb = async (defAdminUser) => {
    const numOfSongs = await SongModel.countDocuments({});
    const numOfAdmins = await UserModel.countDocuments({ role: "admin" });
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
            email: defAdminUser.email,
            name: defAdminUser.name,
            photo: defAdminUser.photo,
            role: "admin",
        });
        if (!admin) throw new Error("Falied to create default admin user.");
    }
};

export default initDb;
