import { createBrowserRouter, RouteObject } from "react-router";

import Category from "./pages/category";
import Explore from "./pages/explore";
import Extensions from "./pages/extensions";
import Search from "./pages/search";

import BaseLayout from "@/layouts/base-layout";
import SettingsLayout from "@/layouts/setting-layout";

import MangaDetail from "@/pages/manga-details";
import Reader from "./pages/reader";

import Experimental from "./pages/settings/experimental";
import ReaderPreferences from "./pages/settings/reader-preferences";
import SystemBehavior from "./pages/settings/system-behavior";
import LayoutAppearance from "./pages/settings/layout-appearance";
import LibraryHistory from "./pages/settings/library-history";
import Home from "./pages/home";

const settingsRoutes: RouteObject[] = [
  {
    index: true,
    element: <LayoutAppearance />,
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
    path: "system-behavior",
    element: <SystemBehavior />,
  },
  {
    path: "experimental",
    element: <Experimental />,
  },
];

const mainRoutes: RouteObject[] = [
  {
    index: true,
    element: <Home />,
  },
  {
    path: "manga/:source/:id",
    element: <MangaDetail />,
  },
  {
    path: "manga/:source/:id/chapter/:chapterId",
    element: <Reader />,
  },
  {
    path: "extensions/",
    element: <Extensions />,
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
    path: "category/:slug",
    element: <Category />,
  },
  {
    path: "settings",
    element: <SettingsLayout />,
    children: settingsRoutes,
  },
];

export const appRoutes = createBrowserRouter([
  {
    path: "/",
    element: <BaseLayout />,
    children: mainRoutes,
  },
]);
