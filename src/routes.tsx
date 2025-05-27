import { createBrowserRouter } from "react-router";
import Layout from "./components/layout";
import Home from "@/pages/home";
import Settings from "@/pages/settings";
import MangaDetail from "@/pages/mangaDetails";
import Explore from "./pages/explore";
import Search from "./pages/search";

export const appRoutes = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "manga/:provider/:identifier",
        element: <MangaDetail />,
      },
      {
        path: "explore",
        element: <Explore />,
      },
      {
        path: "explore/:source",
        element: <Explore />,
      },
      {
        path: "search",
        element: <Search />,
      },
    ],
  },
]);
