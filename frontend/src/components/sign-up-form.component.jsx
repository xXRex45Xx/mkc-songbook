import { Button, Label, TextInput } from "flowbite-react";
import { Form, Link } from "react-router-dom";
import { formButtonTheme } from "../config/button-theme.config";
import nextIcon from "../assets/next-filled.svg";
import GoogleLink from "./google-link.component";

const SignUpForm = () => (
    <Form className="flex-1 flex flex-col gap-7 justify-center text-baseblack overflow-auto">
        <div className="flex flex-col gap-1">
            <span className="text-neutrals-800">Step 1 of 3</span>
            <h3 className="text-2xl font-bold">Create Your Account</h3>
        </div>
        <div className="flex flex-col pt-3.5 gap-5 items-stretch">
            <div className="flex flex-col pb-10 gap-1.5">
                <Label htmlFor="email" value="Enter Email Address" />
                <TextInput
                    id="email"
                    type="email"
                    placeholder="youremail@company.com"
                />
            </div>
            <div className="flex flex-col gap-2.5">
                <Button
                    theme={formButtonTheme}
                    size="lg"
                    className="bg-secondary focus:ring-0"
                    type="submit"
                >
                    Next
                    <img className="ml-2.5" src={nextIcon} alt="" />
                </Button>
                <span className="text-center">or</span>
                <GoogleLink>Sign up with Google</GoogleLink>
            </div>
            <span className="text-center">
                Already have an account?{" "}
                <Link to="/auth" className="text-secondary font-semibold">
                    Login
                </Link>
            </span>
        </div>
    </Form>
);

export default SignUpForm;
