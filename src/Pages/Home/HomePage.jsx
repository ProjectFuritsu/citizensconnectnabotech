import {
  Search,
  Info,
  Newspaper,
  Users,
  Trophy,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import Custom_HomePageSearchBar from "../../Widgets/custom_HomePageSearchBar";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 text-center bg-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Your City, Your Portal:
            <br />
            Accessing Public Information with Ease
          </h1>
          <p className="text-gray-500 text-lg mb-10 max-w-2xl mx-auto">
            Find comprehensive guides, official news, and essential community services in one central hub.
          </p>

          {/* Search Bar */}
          <Custom_HomePageSearchBar/>

        </div>
      </section>

      {/* Quick Access Hubs */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-xl font-bold mb-1">Quick Access Hubs</h2>
        <p className="text-gray-500 text-sm mb-8">
          Direct paths to the most requested information
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <QuickAccessCard
            icon={<Info className="text-blue-500" />}
            title="Information Hub"
            desc="Comprehensive guides for city life, regulations, and permit applications."
            redirectTo={"/info"}
          />
          <QuickAccessCard
            icon={<Newspaper className="text-blue-500" />}
            title="News & Updates Hub"
            desc="Latest official announcements and press releases from the mayor's office."
            redirectTo={"/news-updates"}
          />
          <QuickAccessCard
            icon={<Users className="text-blue-500" />}
            title="Community Volunteering"
            desc="Meaningful ways to get involved locally and help your neighbors grow."
          />
          <QuickAccessCard
            icon={<Trophy className="text-blue-500" />}
            title="City Accomplishments"
            desc="Tracking infrastructure wins, project milestones, and policy progress."
          />
        </div>
      </section>

      {/* Report Section */}
      {/* <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-blue-50 rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between border border-blue-100">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold mb-2">
              See something that needs fixing?
            </h2>
            <p className="text-gray-600 max-w-xl">
              Report potholes, broken streetlights, or graffiti directly to the
              municipal maintenance team through our citizen issue tracker.
            </p>
          </div>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition">
            <AlertTriangle size={20} />
            Report an Issue
          </button>
        </div>
      </section> */}
    </div>
  );
}

// Sub-components for cleaner code
const QuickAccessCard = ({ icon, title, desc, redirectTo }) => {
  const isDisabled = !redirectTo;

  // Define the base styles and the conditional "disabled" styles
  const cardContent = (
    <div
      className={`h-full p-8 rounded-xl border border-gray-100 transition 
      ${
        isDisabled
          ? "bg-gray-50 opacity-60 cursor-not-allowed grayscale"
          : "bg-white shadow-sm hover:shadow-md cursor-pointer hover:border-blue-200"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 
        ${isDisabled ? "bg-gray-200 text-gray-400" : "bg-blue-50 text-blue-500"}`}
      >
        {icon}
      </div>
      <h3
        className={`font-bold text-md mb-2 ${isDisabled ? "text-gray-500" : "text-slate-900"}`}
      >
        {title}
      </h3>
      <p className="text-gray-400 text-xs leading-relaxed">
        {isDisabled ? "Coming Soon: " + desc : desc}
      </p>
    </div>
  );

  // If there's no link, just return the card; otherwise, wrap it in the Link
  if (isDisabled) {
    return cardContent;
  }

  return (
    <Link to={redirectTo} className="block h-full">
      {cardContent}
    </Link>
  );
};
