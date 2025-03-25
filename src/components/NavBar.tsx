
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { ArrowLeft } from 'lucide-react';

const NavBar: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  return (
    <div className="fixed top-0 left-0 right-0 z-10 bg-dam-dark/80 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          {!isHomePage && (
            <Link
              to="/"
              className="mr-3 p-2 rounded-full transition-all hover:bg-white/10"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </Link>
          )}
          <Link to="/" className="flex items-center">
            <Logo size="small" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
