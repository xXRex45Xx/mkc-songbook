import { TextInput, Select } from "flowbite-react";
import { searchInputTheme, selectTheme } from "../config/forms-theme.config";

import searchIcon from "../assets/search.svg";

const SearchBar = () => (
    <form>
        <div className="flex items-stretch">
            <Select theme={selectTheme} id="categories" required>
                <option selected>All Categories</option>
                <option>Id</option>
                <option>Title</option>
                <option>Lyrics</option>
            </Select>
            <div className="w-full flex flex-nowrap">
                <TextInput theme={searchInputTheme} placeholder="Search..." />
                <button
                    type="submit"
                    className="flex items-center justify-center p-2 w-10 h-full bg-secondary rounded-e-lg border border-secondary hover:bg-secondary-600 hover:border-secondary-600 focus:outline-none"
                >
                    <img src={searchIcon} alt="Search"></img>
                </button>
            </div>
        </div>
    </form>
);

export default SearchBar;
