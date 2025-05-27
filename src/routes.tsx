import { createBrowserRouter } from "react-router";
import Layout from "./components/layout";
import Home from "@/pages/home";
import Settings from "@/pages/settings";
import MangaDetail from "@/pages/mangaDetails";

export const routes = createBrowserRouter([
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
    ],
  },
]);
