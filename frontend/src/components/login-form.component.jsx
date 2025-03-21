import { Button, Label, TextInput } from "flowbite-react";
import {
    Form,
    Link,
    redirect,
    useActionData,
    useNavigation,
} from "react-router-dom";
import closedEye from "../assets/closed-eye.svg";
import openEye from "../assets/open-eye.svg";
import loginIcon from "../assets/login.svg";

import { useState } from "react";
import { formButtonTheme } from "../config/button-theme.config";
import GoogleLink from "./google-link.component";
import { passwordInputTheme } from "../config/forms-theme.config";
import { login } from "../utils/api/user-api.util";
import store from "../store/store";
import { setCurrentUser } from "../store/slices/user.slice";
import CustomTailSpin from "./custom-tail-spin.component";
import { useSearchParams } from "react-router-dom";

const eyeWrapper = (onClick, icon) => (
    <img className="cursor-pointer" src={icon} onClick={onClick} />
);

const LoginForm = () => {
    const error = useActionData();
    const navigation = useNavigation();
    const [showPass, setShowPass] = useState(false);
    const toggleShowPass = () => {
        setShowPass((prev) => !prev);
    };

    return (
        <Form
            className="flex-1 flex flex-col gap-7 min-h-3/4 justify-center text-baseblack overflow-auto"
            method="POST"
        >
            <h3 className="text-2xl font-bold">Login</h3>
            <div className="flex pt-3.5 flex-col gap-5 items-stretch">
                <div className="flex flex-col pb-10 gap-5">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            placeholder="youremail@company.com"
                            color={error?.emailMessage ? "failure" : ""}
                            helperText={
                                <span className="text-sm">
                                    {error?.emailMessage}
                                </span>
                            }
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="password" value="Password" />
                        <TextInput
                            theme={passwordInputTheme}
                            id="password"
                            name="password"
                            type={showPass ? "text" : "password"}
                            placeholder="********"
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
                        <Link
                            to="forgot-password"
                            className="text-secondary self-end text-sm mt-1"
                        >
                            Forgot Password?
                        </Link>
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
                        Login
                        <img className="ml-2.5" src={loginIcon} alt="" />
                    </Button>
                    <span className="text-center">or</span>
                    <GoogleLink>Login with Google</GoogleLink>
                </div>
                <span className="text-center">
                    Don't have an account?{" "}
                    <Link to="signup" className="text-secondary font-semibold">
                        Sign Up
                    </Link>
                </span>
            </div>
        </Form>
    );
};

export default LoginForm;

export const action = async ({ request }) => {
    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");

    try {
        const data = await login(email, password);
        if (!data.user || !data.user.id || !data.token)
            throw { status: 500, message: "An unexpected error occured." };
        localStorage.setItem("_s", data.token);
        store.dispatch(setCurrentUser(data.user));
        return redirect("/");
    } catch (error) {
        if (error.status === 400 || error.status === 401)
            return {
                emailMessage: error.emailMessage,
                passwordMessage: error.passwordMessage,
                message: error.message,
            };
        throw error;
    }
};
