
import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">ZenSpace</h1>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
            <a href="#" className="hover:text-emerald-600 transition-colors">How it works</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Tips & Tricks</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Storage Ideas</a>
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-slate-50">
        {children}
      </main>
      <footer className="bg-white border-t py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2024 ZenSpace AI Room Organizer. Making homes peaceful, one room at a time.</p>
        </div>
      </footer>
    </div>
  );
};
