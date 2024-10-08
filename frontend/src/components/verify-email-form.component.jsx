import { TextInput } from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import { Form, Link, useLocation } from "react-router-dom";
import { numberInputTheme } from "../config/forms-theme.config";

const VerifyEmailForm = () => {
    const input1 = useRef();
    const input2 = useRef();
    const input3 = useRef();
    const input4 = useRef();
    const input5 = useRef();
    const input6 = useRef();

    useEffect(() => input1.current.focus(), []);
    const handleInputPress = (e, nextInputRef) => {
        if (
            e.key !== "Backspace" &&
            (isNaN(parseInt(e.key)) || e.target.value.length === 1)
        )
            e.preventDefault();
    };
    const handleInputOnChange = (e, nextInputRef) => {
        if (e.target.value !== "") nextInputRef.current.focus();
    };
    return (
        <Form className="flex-1 flex flex-col gap-7 min-h-3/4 text-baseblack justify-center overflow-auto">
            <div className="flex flex-col gap-1">
                <span className="text-neutrals-800">Step 2 of 3</span>
                <h3 className="text-2xl font-bold">Verify Email</h3>
            </div>
            <div className="flex gap-2.5 self-center">
                <TextInput
                    ref={input1}
                    theme={numberInputTheme}
                    type="number"
                    onKeyDown={handleInputPress}
                    onChange={(e) => handleInputOnChange(e, input2)}
                />
                <TextInput
                    ref={input2}
                    theme={numberInputTheme}
                    type="number"
                    onKeyDown={handleInputPress}
                    onChange={(e) => handleInputOnChange(e, input3)}
                />
                <TextInput
                    ref={input3}
                    theme={numberInputTheme}
                    type="number"
                    onKeyDown={handleInputPress}
                    onChange={(e) => handleInputOnChange(e, input4)}
                />
                <TextInput
                    ref={input4}
                    theme={numberInputTheme}
                    type="number"
                    onKeyDown={handleInputPress}
                    onChange={(e) => handleInputOnChange(e, input5)}
                />
                <TextInput
                    ref={input5}
                    theme={numberInputTheme}
                    type="number"
                    onKeyDown={handleInputPress}
                    onChange={(e) => handleInputOnChange(e, input6)}
                />
                <TextInput
                    ref={input6}
                    theme={numberInputTheme}
                    type="number"
                    onKeyDown={handleInputPress}
                />
            </div>
            <span className="text-center">
                Please check your email for a 6-digit code and enter it below to
                verify your account.
                <br />
                <br />
                Didn't get it?{" "}
                <Link className="text-secondary font-semibold">Resend.</Link>
            </span>
        </Form>
    );
};

export default VerifyEmailForm;
