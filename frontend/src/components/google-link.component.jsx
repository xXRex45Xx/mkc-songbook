import googleIcon from "../assets/google.svg";
import { Link } from "react-router-dom";

const GoogleLink = ({ children }) => (
    <Link className="flex py-4 px-8 border rounded-[0.625rem] border-solid border-[#A0A0A8] justify-center items-center gap-3.5 text-baseblack text-lg font-semibold">
        <img className="w-5" src={googleIcon} alt="Google" />
        {children}
    </Link>
);

export default GoogleLink;
