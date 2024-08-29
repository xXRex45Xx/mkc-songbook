import MainBodyContainer from "../components/main-body-container.component";
import { TextInput, Select } from "flowbite-react";
import { searchInputTheme, selectTheme } from "../config/forms-theme.config";

import searchIcon from "../assets/search.svg";

const SongsPage = () => {
    return (
        <MainBodyContainer title={"Songs"}>
            <form>
                <div class="flex items-stretch">
                    <Select theme={selectTheme} id="categories" required>
                        <option selected>All Categories</option>
                        <option>Id</option>
                        <option>Title</option>
                        <option>Lyrics</option>
                    </Select>
                    <div class="w-full flex flex-nowrap">
                        {/* <input
                            type="search"
                            id="search-dropdown"
                            class="block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-e-lg border-s-gray-50 border-s-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-s-gray-700  dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500"
                            placeholder="Search Mockups, Logos, Design Templates..."
                            required
                        /> */}
                        <TextInput
                            theme={searchInputTheme}
                            placeholder="Search..."
                        />

                        <button
                            type="submit"
                            class="flex items-center justify-center p-2 w-10 h-full bg-secondary rounded-e-lg border border-secondary hover:bg-secondary-600 hover:border-secondary-600 focus:outline-none"
                        >
                            <img src={searchIcon} alt="Search"></img>
                        </button>
                    </div>
                </div>
            </form>
        </MainBodyContainer>
    );
};

export default SongsPage;
