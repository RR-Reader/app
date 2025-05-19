// import { invoke } from "@tauri-apps/api/core";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Home from "@/pages/home";
import Settings from "@/pages/Setttings";
import MangaDetail from "@/pages/mangaDetails";
import Layout from "./components/layout";
import "@/styles/globals.css";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
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
    </ThemeProvider>
  );
}

export default App;
