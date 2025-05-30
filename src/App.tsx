import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { appRoutes } from "./routes";
import { useEffect } from "react";
import { ThemeProvider } from "@/hooks/theme-provider";
import { Toaster } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  useEffect(() => {
    const portalContainer = document.getElementById("portal-root");
    if (!portalContainer) {
      const container = document.createElement("div");
      container.id = "portal-root";
      container.style.position = "relative";
      container.style.zIndex = "9999";
      document.body.appendChild(container);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={appRoutes} />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
