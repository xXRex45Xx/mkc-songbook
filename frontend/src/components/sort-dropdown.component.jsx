import { Dropdown } from "flowbite-react";

import arrowIcon from "../assets/dropdown-arrow.svg";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useMemo } from "react";

const SortDropdown = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const sortByParams = useMemo(
        () =>
            searchParams.get("sortby") ? searchParams.get("sortby") : "Number",
        [searchParams]
    );
    const handleSelect = (value) => {
        setSearchParams((prev) => {
            prev.set("sortby", value);
            return prev;
        });
    };
    return (
        <Dropdown
            inline
            arrowIcon={false}
            theme={{
                inlineWrapper:
                    "flex justify-center items-center border border-neutrals-400 py-2 px-3 rounded-lg gap-2",
            }}
            label={
                <>
                    <span className="text-baseblack text-xs font-medium text-nowrap">
                        SortBy:{" "}
                        {sortByParams.charAt(0).toUpperCase() +
                            sortByParams.slice(1)}
                    </span>
                    <img src={arrowIcon} alt={""} />
                </>
            }
        >
            <Dropdown.Item onClick={handleSelect.bind(null, "Number")}>
                Number
            </Dropdown.Item>
            <Dropdown.Item onClick={handleSelect.bind(null, "A-Z")}>
                A - Z
            </Dropdown.Item>
            <Dropdown.Item onClick={handleSelect.bind(null, "Recently Added")}>
                Recently Added
            </Dropdown.Item>
        </Dropdown>
    );
};

export default SortDropdown;
