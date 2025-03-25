import { useLayoutEffect } from "react";
import { setWindowInnerWidth } from "../store/slices/configs.slice";
import { useDispatch } from "react-redux";

/**
 * Custom hook to track and update window width in Redux store
 * Uses useLayoutEffect to avoid visual flickering during resize
 * @returns {void}
 */
const useWindowSize = () => {
    const dispatch = useDispatch();

    /**
     * Sets up window resize event listener and cleanup
     * Updates Redux store with current window width on resize
     */
    useLayoutEffect(() => {
        const updateSize = (e) =>
            dispatch(setWindowInnerWidth(e.target.innerWidth));
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);
};

export default useWindowSize;
