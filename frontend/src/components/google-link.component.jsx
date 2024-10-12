import googleIcon from "../assets/google.svg";
import backendURL from "../config/backend-url.config";

const GoogleLink = ({ children }) => {
    return (
        <a
            href={`${backendURL}/api/user/google`}
            className="flex py-4 px-8 border rounded-[0.625rem] border-solid border-[#A0A0A8] justify-center items-center gap-3.5 text-baseblack text-lg font-semibold"
        >
            <img className="w-5" src={googleIcon} alt="Google" />
            {children}
        </a>
    );
};

export default GoogleLink;
