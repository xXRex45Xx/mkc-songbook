import { Outlet } from "react-router-dom";
import "./App.css";
import Header from "./components/header.component";
import AudioPlayer from "./components/audio-player.component";

function App() {
    return (
        <>
            <Header />
            <Outlet />
            <AudioPlayer />
        </>
    );
}

export default App;
