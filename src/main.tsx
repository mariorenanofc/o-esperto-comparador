
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = "pk_test_ZW5hYmxpbmctaGVuLTY4LmNsZXJrLmFjY291bnRzLmRldiQ";
if (!PUBLISHABLE_KEY) throw new Error("Missing Clerk Publishable Key");

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <App />
  </ClerkProvider>
);
