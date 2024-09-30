import { RangeSlider } from "flowbite-react";
import { rangeSliderTheme } from "../config/forms-theme.config";

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
                className={`hidden md:block absolute left-0 -translate-y-1/2 h-2 bg-gradient-to-r from-secondary to-primary`}
            ></div>
        </>
    );
};

export default CustomSlider;
