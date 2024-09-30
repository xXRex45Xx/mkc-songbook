import { TextInput, Select } from "flowbite-react";
import { searchInputTheme, selectTheme } from "../config/forms-theme.config";

import searchIcon from "../assets/search.svg";
import { Form, useSearchParams, useSubmit } from "react-router-dom";

const SearchBar = ({ action, searchValue = "", selectValue = "all" }) => {
    const submit = useSubmit();
    const [searchParams, _setSearchParams] = useSearchParams();

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        if (searchParams.has("sortby"))
            formData.set("sortby", searchParams.get("sortby"));
        submit(formData, { action });
    };

    return (
        <Form
            method="GET"
            onSubmit={handleSubmit}
            navigate={false}
            className="h-full"
        >
            <div className="flex items-stretch">
                <Select
                    defaultValue={selectValue}
                    name="type"
                    theme={selectTheme}
                    id="categories"
                    required
                >
                    <option value="all">All Categories</option>
                    <option value="id">Id</option>
                    <option value="title">Title</option>
                    <option value="lyrics">Lyrics</option>
                </Select>
                <div className="w-full flex flex-nowrap">
                    <TextInput
                        name="q"
                        required
                        minLength={1}
                        theme={searchInputTheme}
                        placeholder="Search..."
                        defaultValue={searchValue}
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
