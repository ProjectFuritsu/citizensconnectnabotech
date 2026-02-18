import { Routes, Route } from "react-router-dom";
import NoFound from "../Pages/Error/NoFound";
import InfoLibPage from "../Pages/GuideHub/InfoLibPage";
import HomePage from "../Pages/Home/HomePage";
import NewsPage from "../Pages/News/NewsPage";
import NewsDetails from "../Pages/News/NewsDetails";
import InfoDetailsPage from "../Pages/GuideHub/InfoDetailsPage";
import VolunteersPage from "../Pages/Volunteers/VolunteersPage";

const AppRoutes = () => {
  return (
    
    <Routes>
      
      <Route path="/" element={<HomePage />} />
      <Route path="/info" element={<InfoLibPage />} />
      <Route path="/info/:id" element={<InfoDetailsPage />} />
      <Route path="/news-updates" element={<NewsPage />} />
      <Route path="/news-updates/:id" element={<NewsDetails />} />
      <Route path="/get-involved" element={<VolunteersPage />} />
      
      {/* 404 Catch-all Route */}
      <Route path="*" element={<NoFound />} />
    </Routes>
  );
};

export default AppRoutes;