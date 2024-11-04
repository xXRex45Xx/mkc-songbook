import { TextInput } from "flowbite-react";
import { useEffect, useRef } from "react";
import {
    Form,
    redirect,
    useActionData,
    useNavigate,
    useSubmit,
} from "react-router-dom";
import { numberInputTheme } from "../config/forms-theme.config";
import { requestOTP, verifyOTP } from "../utils/api/user-api.util";
import { useDispatch, useSelector } from "react-redux";
import { setAuthOtp } from "../store/slices/user.slice";
import store from "../store/store";

const VerifyEmailForm = () => {
    const input2 = useRef();
    const input3 = useRef();
    const input4 = useRef();
    const input5 = useRef();
    const input6 = useRef();

    const submit = useSubmit();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const error = useActionData();
    const email = useSelector((state) => state.user.authEmail);
    const forgotEmail = useSelector((state) => state.user.forgotEmail);

    useEffect(() => {
        if (!email && !forgotEmail) navigate("/auth/signup");
    }, [email, forgotEmail]);

    const handleInputPress = (e) => {
        if (
            e.key !== "Backspace" &&
            (isNaN(parseInt(e.key)) || e.target.value.length === 1)
        )
            e.preventDefault();
    };
    const handleInputOnChange = (e, nextInputRef) => {
        if (e.target.value !== "" && nextInputRef) nextInputRef.current.focus();
    };
    const handleFormChange = (e) => {
        const formData = new FormData(e.currentTarget);
        let otp = "";
        for (const data of formData.values()) {
            if (!data) return;
            otp += data;
        }
        dispatch(setAuthOtp(otp));
        formData.set("otp", otp);
        if (forgotEmail) {
            formData.set("forgot-email", true);
            formData.set("email", forgotEmail);
        } else formData.set("email", email);
        submit(formData, { action: "/auth/verify", method: "POST" });
    };
    const handleResend = () => {
        requestOTP(email, forgotEmail ? true : false);
    };
    return (
        <Form
            onChange={handleFormChange}
            className="flex-1 flex flex-col gap-7 min-h-3/4 text-baseblack justify-center overflow-auto"
        >
            <div className="flex flex-col gap-1">
                <span className="text-neutrals-800">Step 2 of 3</span>
                <h3 className="text-2xl font-bold">
                    Verify {forgotEmail ? "It's You" : "Email"}
                </h3>
            </div>
            <div className="flex gap-2.5 self-center">
                <TextInput
                    autoFocus={true}
                    theme={numberInputTheme}
                    type="number"
                    name="number1"
                    onKeyDown={handleInputPress}
                    onChange={(e) => handleInputOnChange(e, input2)}
                />
                <TextInput
                    ref={input2}
                    theme={numberInputTheme}
                    type="number"
                    name="number2"
                    onKeyDown={handleInputPress}
                    onChange={(e) => handleInputOnChange(e, input3)}
                />
                <TextInput
                    ref={input3}
                    theme={numberInputTheme}
                    type="number"
                    name="number3"
                    onKeyDown={handleInputPress}
                    onChange={(e) => handleInputOnChange(e, input4)}
                />
                <TextInput
                    ref={input4}
                    theme={numberInputTheme}
                    type="number"
                    name="number4"
                    onKeyDown={handleInputPress}
                    onChange={(e) => handleInputOnChange(e, input5)}
                />
                <TextInput
                    ref={input5}
                    theme={numberInputTheme}
                    type="number"
                    name="number5"
                    onKeyDown={handleInputPress}
                    onChange={(e) => handleInputOnChange(e, input6)}
                />
                <TextInput
                    ref={input6}
                    theme={numberInputTheme}
                    type="number"
                    name="number6"
                    onKeyDown={handleInputPress}
                    onChange={handleInputOnChange}
                />
            </div>
            {<p className="text-center text-secondary">{error?.message}</p>}
            <span className="text-center">
                Please check your email for a 6-digit code and enter it below to
                verify your account.
                <br />
                <br />
                Didn't get it?{" "}
                <button
                    onClick={handleResend}
                    className="text-secondary font-semibold"
                >
                    Resend.
                </button>
            </span>
        </Form>
    );
};

export default VerifyEmailForm;

export const action = async ({ request }) => {
    const formData = await request.formData();
    const email = formData.get("email");
    const otp = formData.get("otp");
    const forgotEmail = formData.get("forgot-email");
    try {
        const data = await verifyOTP({ email, otp });
        if (!data.success)
            throw { message: "An unexpected error occurred.", status: 500 };
        store.dispatch(setAuthOtp(otp));
        if (forgotEmail) return redirect("/auth/reset-password");
        return redirect("/auth/create-password");
    } catch (error) {
        if (error.status === 400) return { message: error.message };
        throw error;
    }
};
