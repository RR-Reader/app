// src/components/Layout.tsx
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar";
import module from "./layout.module.css";

export default function Layout() {
  return (
    <div className={module.layout}>
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
