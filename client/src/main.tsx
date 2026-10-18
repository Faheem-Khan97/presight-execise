import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

/**
 * The directory is read-only reference data, so results stay trustworthy far longer than the
 * library's default `staleTime: 0`, which marks every response stale on arrival and refetches
 * whenever a query remounts or the window regains focus (including clicking into devtools).
 * Holding results for a minute means revisiting a search or re-toggling a filter is served
 * from cache with no request at all.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
