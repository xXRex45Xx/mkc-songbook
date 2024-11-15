import { Button, Label, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import {
    Form,
    redirect,
    useActionData,
    useNavigate,
    useNavigation,
} from "react-router-dom";
import { passwordInputTheme } from "../config/forms-theme.config";
import openEye from "../assets/open-eye.svg";
import closedEye from "../assets/closed-eye.svg";
import getStarted from "../assets/get-started.svg";
import { formButtonTheme } from "../config/button-theme.config";
import { registerUser } from "../utils/api/user-api.util";
import { useSelector } from "react-redux";
import { setCurrentUser } from "../store/slices/user.slice";
import store from "../store/store";
import CustomTailSpin from "./custom-tail-spin.component";

const eyeWrapper = (onClick, icon) => (
    <img className="cursor-pointer" src={icon} onClick={onClick} />
);

const CreatePasswordForm = () => {
    const navigate = useNavigate();
    const error = useActionData();
    const navigation = useNavigation();

    const [showPass, setShowPass] = useState(false);
    const [showVerifyPass, setShowVerifyPass] = useState(false);

    const toggleShowPass = () => setShowPass((prev) => !prev);
    const toggleShowVerifyPass = () => setShowVerifyPass((prev) => !prev);

    const email = useSelector((state) => state.user.authEmail);
    const otp = useSelector((state) => state.user.authOtp);

    useEffect(() => {
        if (!email || !otp) navigate("/auth/signup");
    }, [email, otp]);

    return (
        <Form
            className="flex-1 flex flex-col gap-7 justify-center text-baseblack overflow-auto"
            method="POST"
        >
            <div className="flex flex-col gap-1">
                <span className="text-neutrals-800">Step 3 of 3</span>
                <h3 className="text-2xl font-bold">Create Your Account</h3>
            </div>
            <div className="flex flex-col pt-3.5 gap-5 items-stretch">
                <div className="flex flex-col pb-10 gap-5">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="name" value="Name" />
                        <TextInput
                            id="name"
                            type="text"
                            placeholder="Your name"
                            name="name"
                            color={error?.nameMessage ? "failure" : ""}
                            helperText={
                                <span className="text-sm">
                                    {error?.nameMessage}
                                </span>
                            }
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="password" value="Create Password" />
                        <TextInput
                            theme={passwordInputTheme}
                            id="password"
                            type={showPass ? "text" : "password"}
                            placeholder="********"
                            name="password"
                            rightIcon={eyeWrapper.bind(
                                null,
                                toggleShowPass,
                                showPass ? openEye : closedEye
                            )}
                            color={error?.passwordMessage ? "failure" : ""}
                            helperText={
                                <span className="text-sm">
                                    {error?.passwordMessage}
                                </span>
                            }
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label
                            htmlFor="confirm-password"
                            value="Confirm Password"
                        />
                        <TextInput
                            theme={passwordInputTheme}
                            id="confirm-password"
                            type={showVerifyPass ? "text" : "password"}
                            placeholder="********"
                            name="confirm-password"
                            rightIcon={eyeWrapper.bind(
                                null,
                                toggleShowVerifyPass,
                                showVerifyPass ? openEye : closedEye
                            )}
                            color={error?.confirmPassMessage ? "failure" : ""}
                            helperText={
                                <span className="text-sm">
                                    {error?.confirmPassMessage}
                                </span>
                            }
                        />
                    </div>
                </div>
                <span className="text-sm text-secondary text-center">
                    {error?.message}
                </span>
                <div className="flex flex-col gap-2.5">
                    <Button
                        theme={formButtonTheme}
                        size="lg"
                        className="bg-secondary focus:ring-0"
                        type="submit"
                        isProcessing={navigation.state === "submitting"}
                        processingSpinner={<CustomTailSpin small white />}
                    >
                        Get Started
                        <img className="ml-2.5" src={getStarted} alt="" />
                    </Button>
                </div>
            </div>
        </Form>
    );
};

export default CreatePasswordForm;

export const action = async ({ request }) => {
    const formData = await request.formData();
    const password = formData.get("password");
    const confirmPassword = formData.get("confirm-password");
    const name = formData.get("name");
    const {
        user: { authEmail: email, authOtp: otp },
    } = store.getState();
    try {
        const data = await registerUser(
            email,
            otp,
            password,
            confirmPassword,
            name
        );
        if (!data.user || !data.user.id || !data.token)
            throw { status: 500, message: "An unexpected error occurred." };
        localStorage.setItem("_s", data.token);
        store.dispatch(setCurrentUser(data.user));
        return redirect("/");
    } catch (error) {
        if (error.status === 400)
            return {
                nameMessage: error.nameMessage,
                passwordMessage: error.passwordMessage,
                confirmPassMessage: error.confirmPassMessage,
                message: error.message,
            };
        throw error;
    }
};
