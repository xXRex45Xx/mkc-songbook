import { useLayoutEffect } from "react";
import { setWindowInnerWidth } from "../store/slices/configs.slice";
import { useDispatch } from "react-redux";

const useWindowSize = () => {
    const dispatch = useDispatch();
    useLayoutEffect(() => {
        const updateSize = (e) =>
            dispatch(setWindowInnerWidth(e.target.innerWidth));
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);
};

export default useWindowSize;
