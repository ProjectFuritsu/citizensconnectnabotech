import { Route, Routes } from "react-router-dom";
import BudgetPage from "../Pages/Budget/BudgetPage";
import GuidePage from "../Pages/Guides/GuidePage";
import GuidesPage from "../Pages/Guides/GuidesPage";
import HomePage from "../Pages/Home/HomePage";
import HotlinesPage from "../Pages/Hotlines/HotlinesPage";
import NotFoundPage from "../Pages/NotFound/NotFoundPage";
import ProcurementPage from "../Pages/Procurement/ProcurementPage";

// Every page of the site. A page also needs an entry in
// src/Data/Site/site.config.json to appear in the navbar, footer and sitemap.
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/info" element={<GuidesPage />} />
      <Route path="/info/:id" element={<GuidePage />} />
      <Route path="/hotlines" element={<HotlinesPage />} />
      <Route path="/budget" element={<BudgetPage />} />
      <Route path="/procurement" element={<ProcurementPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
