import { Link } from "react-router-dom";
import module from "./sidebar.module.css";

export default function Sidebar() {
  return (
    <div className={module.sidebar}>
      <h1>Sidebar</h1>
      <div className={module.linkContainer}>
        <Link to={"/"}>Home</Link>
        <Link to={"/settings"}>Settings</Link>
        <Link to={"/manga/example-provider/example-title"}>Manga 1</Link>
      </div>
    </div>
  );
}
