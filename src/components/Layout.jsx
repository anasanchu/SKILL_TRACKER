import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import Navigation from "./Navigation";
import { useAuth } from "../contexts/AuthContext";
import MasteryCelebration from "./MasteryCelebration";

export default function Layout({ dm, setDm }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/auth" />;

  return (
    <div className="min-h-screen flex transition-colors duration-300 relative selection:bg-cyan-300 selection:text-zinc-950">
      
      <Navigation dm={dm} setDm={setDm} />
      
      {/* Main Content Area */}
      <main className="flex-1 relative z-10 min-w-0 pt-16 pb-20 md:pt-8 md:pb-8 px-4 sm:px-8 md:pl-64 max-w-7xl mx-auto w-full">
        <Outlet context={{ dm }} />
      </main>

      {/* Global Mastery Celebration Overlay */}
      <MasteryCelebration />
    </div>
  );
}
