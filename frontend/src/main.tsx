import { createRoot } from "react-dom/client";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "./lib/apollo/client";
import App from "./App.tsx";
import "./index.css";
import { loadFonts } from "./assets/fonts";

// Load fonts before rendering the app
loadFonts().catch((error) => {
  console.warn("Failed to load custom fonts, using system fonts:", error);
});

createRoot(document.getElementById("root")!).render(
  <ApolloProvider client={apolloClient}>
    <App />
  </ApolloProvider>
);
