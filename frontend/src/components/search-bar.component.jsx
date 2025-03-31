import { TextInput, Select } from "flowbite-react";
import {
    numberInputTheme,
    searchInputTheme,
    selectTheme,
} from "../config/forms-theme.config";

import searchIcon from "../assets/search.svg";
import {
    Form,
    useSearchParams,
    useSubmit,
    useLocation,
} from "react-router-dom";
import { useState } from "react";

/**
 * Search Bar Component
 *
 * A reusable search form component with category selection and search input.
 * Preserves sort parameters during search submission.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.action - Form submission endpoint
 * @param {string} [props.searchValue=""] - Initial search input value
 * @param {string} [props.selectValue="all"] - Initial category selection value
 */
const SearchBar = ({ action, searchValue = "", selectValue = "all" }) => {
    const submit = useSubmit();
    const [searchParams, _setSearchParams] = useSearchParams();
    const { pathname } = useLocation();
    /**
     * State for category selection value
     */
    const [selectInpValue, setSelectInpValue] = useState(
        selectValue ? selectValue : "all"
    );

    /**
     * Handles form submission
     * Preserves existing sort parameters in the URL
     *
     * @param {React.FormEvent<HTMLFormElement>} e - Form submission event
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        if (searchParams.has("sortby"))
            formData.set("sortby", searchParams.get("sortby"));
        submit(formData, { action });
    };

    /**
     * Handles category selection change
     *
     * @param {React.ChangeEvent<HTMLSelectElement>} e - Select change event
     */
    const handleSelectInpValue = (e) => setSelectInpValue(e.target.value);
    return (
        <Form
            method="GET"
            onSubmit={handleSubmit}
            navigate={false}
            className="h-full"
        >
            <div className="flex items-stretch">
                <Select
                    name="type"
                    theme={selectTheme}
                    id="categories"
                    required
                    value={selectInpValue}
                    onChange={handleSelectInpValue}
                >
                    <option value="all">All Categories</option>
                    {pathname.startsWith("/songs") && (
                        <>
                            <option value="id">Song Number</option>
                            <option value="title">Title</option>
                            <option value="lyrics">Lyrics</option>
                        </>
                    )}
                    {pathname.startsWith("/users") && (
                        <>
                            <option value="name">Name</option>
                            <option value="email">Email</option>
                        </>
                    )}
                </Select>
                <div className="w-full flex flex-nowrap">
                    <TextInput
                        name="q"
                        required
                        minLength={1}
                        theme={searchInputTheme}
                        placeholder="Search..."
                        defaultValue={searchValue}
                        type="text"
                    />
                    <button
                        type="submit"
                        className="flex items-center justify-center p-2 w-10 h-full bg-secondary rounded-e-lg border border-secondary hover:bg-secondary-600 hover:border-secondary-600 focus:outline-none"
                    >
                        <img src={searchIcon} alt="Search"></img>
                    </button>
                </div>
            </div>
        </Form>
    );
};

export default SearchBar;
