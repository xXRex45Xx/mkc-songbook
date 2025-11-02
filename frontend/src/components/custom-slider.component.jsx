import { RangeSlider } from "flowbite-react";
import { rangeSliderTheme } from "../config/forms-theme.config";

/**
 * Custom Slider Component
 *
 * A styled range slider with gradient progress bar.
 * Desktop-only component that provides visual feedback for range selection.
 *
 * @component
 * @param {Object} props - Component props
 * @param {number} props.value - Current slider value
 * @param {number} props.step - Step increment for the slider
 * @param {number} [props.min=0] - Minimum slider value
 * @param {number} props.max - Maximum slider value
 * @param {Function} props.onChange - Handler for value changes
 * @param {boolean} [props.show] - Whether to show the slider
 */
const CustomSlider = ({ value, step, min = 0, max, onChange, show }) => {
	return (
		<>
			<RangeSlider
				size="md"
				value={value}
				min={min}
				max={max}
				onChange={onChange}
				theme={rangeSliderTheme}
				step={step}
				className="hidden md:flex"
			/>
			<div
				style={{
					width: ((value - min) * 100) / (max - min) + "%",
				}}
				className={`${
					show ? "block" : "hidden md:block"
				} absolute left-0 -translate-y-1/2 h-2 bg-gradient-to-r from-secondary to-primary`}
			></div>
		</>
	);
};

export default CustomSlider;
