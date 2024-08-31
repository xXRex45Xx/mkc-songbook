import { RangeSlider } from "flowbite-react";
import { useEffect, useState } from "react";
import "./player-container.styles.css";
const PlayerContainer = () => {
    const [sliderValue, setSliderValue] = useState(0);
    const maxSliderValue = 100;

    return (
        <div className="text-black px-10 flex flex-col flex-nowrap">
            <RangeSlider
                size="md"
                value={sliderValue}
                max={maxSliderValue}
                onChange={(e) => setSliderValue(e.target.value)}
                theme={{
                    root: {
                        base: "flex",
                    },
                    field: {
                        base: "relative w-full",
                        input: {
                            base: "absolute z-10 [&::-moz-range-progress]:h-0 w-full cursor-pointer appearance-none rounded-lg bg-transparent",
                        },
                    },
                }}
            />
            <div
                style={{ width: (sliderValue * 100) / maxSliderValue + "%" }}
                className="h-2 rounded-lg bg-gradient-to-r from-secondary to-primary"
            ></div>
        </div>
    );
};

export default PlayerContainer;
