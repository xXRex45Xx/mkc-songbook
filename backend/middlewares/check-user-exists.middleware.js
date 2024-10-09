import UserModel from "../models/user.model.js";
import { ClientFaultError } from "../utils/error.util.js";

const checkUserExists = async (req, _res, next) => {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    if (user) throw new ClientFaultError("User already exists");
    next();
};

export default checkUserExists;
