import { Button, Label, TextInput } from "flowbite-react";
import { useState } from "react";
import { Form } from "react-router-dom";
import { passwordInputTheme } from "../config/forms-theme.config";
import openEye from "../assets/open-eye.svg";
import closedEye from "../assets/closed-eye.svg";
import getStarted from "../assets/get-started.svg";
import { formButtonTheme } from "../config/button-theme.config";

const eyeWrapper = (onClick, icon) => (
    <img className="cursor-pointer" src={icon} onClick={onClick} />
);

const CreatePasswordForm = () => {
    const [showPass, setShowPass] = useState(false);
    const [showVerifyPass, setShowVerifyPass] = useState(false);
    const toggleShowPass = () => setShowPass((prev) => !prev);
    const toggleShowVerifyPass = () => setShowVerifyPass((prev) => !prev);
    return (
        <Form className="flex-1 flex flex-col gap-7 justify-center text-baseblack overflow-auto md:flex-initial">
            <div className="flex flex-col gap-1">
                <span className="text-neutrals-800">Step 3 of 3</span>
                <h3 className="text-2xl font-bold">Create Your Account</h3>
            </div>
            <div className="flex flex-col pt-3.5 gap-5 items-stretch">
                <div className="flex flex-col pb-10 gap-5">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="password" value="Create Password" />
                        <TextInput
                            theme={passwordInputTheme}
                            id="password"
                            type={showPass ? "text" : "password"}
                            placeholder="********"
                            rightIcon={eyeWrapper.bind(
                                null,
                                toggleShowPass,
                                showPass ? openEye : closedEye
                            )}
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
                            rightIcon={eyeWrapper.bind(
                                null,
                                toggleShowVerifyPass,
                                showVerifyPass ? openEye : closedEye
                            )}
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-2.5">
                    <Button
                        theme={formButtonTheme}
                        size="lg"
                        className="bg-secondary focus:ring-0"
                        type="submit"
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
