import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { NativeAppShell } from "./native/NativeAppShell.tsx";

createRoot(document.getElementById("root")!).render(
  <NativeAppShell>
    <App />
  </NativeAppShell>
);
