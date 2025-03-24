import googleIcon from "../assets/google.svg";
import { useGoogleLogin } from "@react-oauth/google";
import store from "../store/store";
import { setCurrentUser } from "../store/slices/user.slice";
import { googleOauthLogin } from "../utils/api/user-api.util";
import { useNavigate } from "react-router-dom";

const GoogleLink = ({ children, setErrorMessage, redirectOnSuccess = "/" }) => {
    const navigate = useNavigate();

    const login = useGoogleLogin({
        onSuccess: async (response) => {
            try {
                const data = await googleOauthLogin(response.access_token);
                localStorage.setItem("_s", data.token);
                store.dispatch(setCurrentUser(data.user));
                navigate(redirectOnSuccess);
            } catch (error) {
                setErrorMessage(error.message);
            }
        },
        onError: () => {
            setErrorMessage(
                "Failed to sign up or login with google. Please, try again."
            );
        },
    });

    const handleGoogleLogin = (e) => {
        e.preventDefault();
        setErrorMessage("");
        login();
    };

    return (
        <button
            onClick={handleGoogleLogin}
            className="flex py-4 px-8 border rounded-[0.625rem] border-solid border-[#A0A0A8] justify-center items-center gap-3.5 text-baseblack text-lg font-semibold w-full"
        >
            <img className="w-5" src={googleIcon} alt="Google" />
            {children}
        </button>
    );
};

export default GoogleLink;
