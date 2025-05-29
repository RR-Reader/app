import { createBrowserRouter } from "react-router";

import Category from "./pages/category";
import Layout from "./components/layout";
import Library from "@/pages/library";
import Settings from "@/pages/settings";
import MangaDetail from "@/pages/mangaDetails";
import Explore from "./pages/explore";
import Search from "./pages/search";

import Experimental from "./pages/settings/experimental";
import ReaderPreferences from "./pages/settings/reader-preferences";
import StorageCaching from "./pages/settings/storage-caching";
import SystemBehavior from "./pages/settings/system-behavior";
import LayoutAppearance from "./pages/settings/layout-appearance";
import LibraryHistory from "./pages/settings/library-history";

export const appRoutes = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Library />,
      },
      {
        path: "manga/:source/:identifier",
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
      {
        path: "category/:title",
        element: <Category />,
      },
      {
        path: "settings",
        element: <Settings />,
        children: [
          {
            index: true,
            element: <LayoutAppearance />, // Default to first section
          },
          {
            path: "layout-appearance",
            element: <LayoutAppearance />,
          },
          {
            path: "reader-preferences",
            element: <ReaderPreferences />,
          },
          {
            path: "library-history",
            element: <LibraryHistory />,
          },
          {
            path: "storage-caching",
            element: <StorageCaching />,
          },
          {
            path: "system-behavior",
            element: <SystemBehavior />,
          },
          {
            path: "experimental",
            element: <Experimental />,
          },
        ],
      },
    ],
  },
]);
