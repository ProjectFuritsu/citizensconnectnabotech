import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import AppRoutes from "./Routes/AppRoute";
import Footer from "./Components/Footer";
import NavBar from "./Components/NavBar";

// Every new page starts at the top. Filters and tabs change only the query
// string (?year=2024), so they keep your place.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <NavBar />
      <AppRoutes />
      <Footer />
      <Analytics />
    </>
  );
}
