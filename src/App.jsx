import { Analytics } from "@vercel/analytics/react";
import AppRoutes from "./Routes/AppRoute";
import Custom_Footer from "./Widgets/custom_Footer";
import Navbar from "./Widgets/custom_NavBar";

export default function App() {
  return (
    <>
    
      <Navbar />
      <AppRoutes />
      <Custom_Footer />
      <Analytics />
    </>
  );
}
