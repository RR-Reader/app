import { SidebarTrigger } from "./ui/sidebar";

export function Header() {
  return (
    <header className="bg-muted border-b-sidebar mb-0 inline-flex w-full items-center border-b-2 px-4 py-2 md:hidden">
      <SidebarTrigger />
      <h1 className="ml-4 text-2xl font-semibold">Expore</h1>
    </header>
  );
}
