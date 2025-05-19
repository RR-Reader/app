// import { invoke } from "@tauri-apps/api/core";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Settings from "./pages/Setttings";
import MangaDetail from "./pages/mangaDetails";
import Layout from "./pages/layout";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/settings" element={<Settings />} />
          <Route
            path="/manga/:provider/:identifier"
            element={<MangaDetail />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
