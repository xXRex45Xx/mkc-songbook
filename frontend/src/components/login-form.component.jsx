import { Button, Label, TextInput } from "flowbite-react";
import { Form, Link } from "react-router-dom";
import closedEye from "../assets/closed-eye.svg";
import openEye from "../assets/open-eye.svg";
import loginIcon from "../assets/login.svg";
import googleIcon from "../assets/google.svg";
import { useState } from "react";

const eyeWrapper = (onClick, icon) => (
    <img className="cursor-pointer" src={icon} onClick={onClick} />
);

const LoginForm = () => {
    const [showPass, setShowPass] = useState(false);
    const toggleShowPass = () => {
        setShowPass((prev) => !prev);
    };
    return (
        <Form className="flex-1 flex flex-col justify-center gap-7 text-baseblack overflow-auto">
            <h3 className="text-2xl font-bold">Login</h3>
            <div className="flex pt-3.5 flex-col gap-5 items-stretch">
                <div className="flex flex-col pb-10 gap-5">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            placeholder="youremail@company.com"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="password" value="Password" />
                        <TextInput
                            theme={{
                                field: {
                                    rightIcon: {
                                        base: "absolute inset-y-0 right-0 flex items-center pr-3",
                                    },
                                },
                            }}
                            id="password"
                            type={showPass ? "text" : "password"}
                            placeholder="********"
                            rightIcon={eyeWrapper.bind(
                                null,
                                toggleShowPass,
                                showPass ? openEye : closedEye
                            )}
                        />
                        <Link className="text-secondary self-end text-sm mt-1">
                            Forgot Password?
                        </Link>
                    </div>
                </div>
                <div className="flex flex-col gap-2.5">
                    <Button
                        theme={{
                            inner: {
                                base: "flex items-stretch transition-all duration-200 font-semibold",
                            },
                            size: {
                                lg: "px-5 py-2.5 text-lg",
                            },
                        }}
                        size="lg"
                        className="bg-secondary"
                        type="submit"
                    >
                        Login
                        <img className="ml-2.5" src={loginIcon} alt="" />
                    </Button>
                    <span className="text-center">or</span>
                    <Link className="flex py-4 px-8 border rounded-[0.625rem] border-solid border-[#A0A0A8] justify-center items-center gap-3.5 text-baseblack text-lg font-semibold">
                        <img className="w-5" src={googleIcon} alt="Google" />
                        Login with Google
                    </Link>
                </div>
                <span className="text-center">
                    Don't have an account?{" "}
                    <Link className="text-secondary font-semibold">
                        Sign Up
                    </Link>
                </span>
            </div>
        </Form>
    );
};

export default LoginForm;
