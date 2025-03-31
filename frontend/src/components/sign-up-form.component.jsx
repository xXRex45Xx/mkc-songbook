import { Button, Label, TextInput } from "flowbite-react";
import {
    Form,
    Link,
    redirect,
    useActionData,
    useNavigation,
    useSearchParams,
} from "react-router-dom";
import { formButtonTheme } from "../config/button-theme.config";
import nextIcon from "../assets/next-filled.svg";
import GoogleLink from "./google-link.component";
import { requestOTP } from "../utils/api/user-api.util";
import { useSelector } from "react-redux";
import { setAuthEmail } from "../store/slices/user.slice";
import store from "../store/store";
import CustomTailSpin from "./custom-tail-spin.component";
import { useState } from "react";
/**
 * Form component for initiating user signup process
 * Represents step 1 of the signup flow
 * Allows users to enter email or sign up with Google
 * @returns {JSX.Element} Sign up form component
 */
const SignUpForm = () => {
    const error = useActionData();
    const navigation = useNavigation();
    const email = useSelector((store) => store.user.authEmail);
    const [googleLoginError, setGoogleLoginError] = useState("");
    const [searchParams, _setSearchParams] = useSearchParams();
    return (
        <Form
            className="flex-1 flex flex-col gap-7 justify-center text-baseblack overflow-auto"
            method="POST"
            action="/auth/signup"
        >
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
                        name="email"
                        color={error?.message ? "failure" : ""}
                        placeholder="youremail@company.com"
                        defaultValue={email}
                        helperText={
                            <span className="text-sm">{error?.message}</span>
                        }
                    />
                </div>
                <span className="text-sm text-secondary text-center">
                    {error?.message || googleLoginError}
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
                        Next
                        <img className="ml-2.5" src={nextIcon} alt="" />
                    </Button>
                    <span className="text-center">or</span>
                    <GoogleLink
                        redirectOnSuccess={searchParams.get("redirect")}
                        setErrorMessage={setGoogleLoginError}
                    >
                        Sign up with Google
                    </GoogleLink>
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
};

export default SignUpForm;

/**
 * Action handler for the sign up form submission
 * Requests an OTP to be sent to the provided email
 * @param {Object} params - Parameters object containing the request
 * @param {Request} params.request - Form submission request object
 * @returns {Promise<Response>} Redirects to verification page on success, returns validation errors otherwise
 */
export const action = async ({ request }) => {
    const formData = await request.formData();
    const email = formData.get("email");
    try {
        const data = await requestOTP(email);
        if (!data.success)
            throw { message: "An unexpected error occurred.", status: 500 };
        store.dispatch(setAuthEmail(email));
        return redirect("/auth/verify");
    } catch (error) {
        if (error.status === 400) return { message: error.message };
        throw error;
    }
};
