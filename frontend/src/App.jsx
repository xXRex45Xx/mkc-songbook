import { Outlet } from "react-router-dom";
import "./App.css";
import Header from "./components/header.component";
import PlayerContainer from "./components/player-container.component";

function App() {
    return (
        <>
            <Header />
            <Outlet />
            <PlayerContainer />
        </>
    );
}

export default App;
