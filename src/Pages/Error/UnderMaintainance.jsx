import React from "react";
import { Link } from "react-router-dom";

export default function UnderMaintenance() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <div className="relative flex flex-col items-center max-w-lg w-full text-center">
        {/* Animated Visual Element */}
        <div className="relative mb-10">
          {/* Background Decorative Glow */}
          <div className="absolute -inset-6 bg-indigo-50 rounded-full blur-2xl opacity-70 animate-pulse"></div>

          <div className="relative bg-white p-6 rounded-3xl shadow-2xl shadow-indigo-100 border border-gray-50">
            <svg
              className="w-16 h-16 text-indigo-600 animate-[spin_10s_linear_infinite]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
          We’re polishing <br />
          <span className="text-indigo-600">the edges.</span>
        </h1>

        <p className="text-lg text-gray-500 mb-10 leading-relaxed">
          We're currently performing some scheduled maintenance. Everything
          should be back to normal in just a few minutes.
        </p>

        {/* Actions */}
        <div className="flex flex-col items-center gap-6">
          <Link
            to="/"
            className="group flex items-center justify-center px-10 py-4 bg-gray-900 text-white font-semibold rounded-2xl hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-200 transition-all duration-300"
          >
            <svg
              className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Live Status Footer */}
        <div className="mt-20 flex items-center gap-2 text-sm font-medium text-gray-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          System Status:{" "}
          <span className="text-gray-600 uppercase tracking-tighter">
            Updating
          </span>
        </div>
      </div>
    </div>
  );
}
