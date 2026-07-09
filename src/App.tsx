import { useState, useEffect } from "react";
import Home from "@/pages/Home";
import Assessment from "@/pages/Assessment";
import Dashboard from "@/pages/Dashboard";

export function navigate(path: string) {
  window.location.hash = path;
}

function getRoute(): string {
  return window.location.hash.replace(/^#/, "") || "/";
}

export default function App() {
  const [route, setRoute] = useState(getRoute);
  useEffect(() => {
    const handler = () => setRoute(getRoute());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  if (route === "/assessment") return <Assessment navigate={navigate} />;
  if (route === "/dashboard") return <Dashboard navigate={navigate} />;
  return <Home />;
}
