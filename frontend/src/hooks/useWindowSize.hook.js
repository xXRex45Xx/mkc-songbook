/**
 * @fileoverview Window size tracking hook
 * Monitors window resize events and updates Redux store with current width
 */

import { useLayoutEffect } from "react";
import { setWindowInnerWidth } from "../store/slices/configs.slice";
import { useDispatch } from "react-redux";

/**
 * useWindowSize
 *
 * Custom hook that tracks window resize events and dispatches
 * the current window width to the Redux store. Uses useLayoutEffect
 * to ensure DOM updates occur before paint, preventing visual flickering.
 *
 * @returns {void}
 * @example
 * ```jsx
 * // Call in component body to enable window size tracking
 * function MyComponent() {
 *   useWindowSize();
 *   // Component can now access window width from Redux store
 *   return <div>Content</div>;
 * }
 * ```
 */
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
