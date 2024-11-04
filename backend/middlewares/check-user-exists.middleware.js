import UserModel from "../models/user.model.js";
import { ClientFaultError } from "../utils/error.util.js";

const checkUserExists = async (req, _res, next) => {
    const { email } = req.body;
    const { forgotPassword } = req.query;
    const user = await UserModel.findOne({ email });
    if (user && !forgotPassword)
        throw new ClientFaultError("User already exists");
    if (!user && forgotPassword)
        throw new ClientFaultError("User doesn't exist");
    next();
};

export default checkUserExists;
