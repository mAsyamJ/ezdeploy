
'use client';
import { useState } from 'react';
import Link from 'next/link';
import DashboardButton from './DashboardButton';
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  return (
    <nav className="fixed top-0 left-0 right-0 h-[70px] z-50 backdrop-blur-md bg-white/30 border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              EzDeploy
            </span>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-800 hover:text-indigo-600 font-medium transition-colors">
              Home
            </Link>
            <Link href="/explorer" className="text-gray-800 hover:text-indigo-600 font-medium transition-colors">
              Explorer
            </Link>
            <Link href="/templates" className="text-gray-800 hover:text-indigo-600 font-medium transition-colors">
              Templates
            </Link>
            <Link href="/docs" className="text-gray-800 hover:text-indigo-600 font-medium transition-colors">
              Docs
            </Link>
            <Link href="/blog" className="text-gray-800 hover:text-indigo-600 font-medium transition-colors">
              Blog
            </Link>
            <Link href="/contact" className="text-gray-800 hover:text-indigo-600 font-medium transition-colors">
              Contact
            </Link>
          </div>
          {/* Dashboard Button */}
          <div className="hidden md:block">
            <DashboardButton />
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/90 backdrop-blur-md shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:text-indigo-600">
              Home
            </Link>
            <Link href="/explorer" className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:text-indigo-600">
              Explorer
            </Link>
            <Link href="/templates" className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:text-indigo-600">
              Templates
            </Link>
            <Link href="/docs" className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:text-indigo-600">
              Docs
            </Link>
            <Link href="/blog" className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:text-indigo-600">
              Blog
            </Link>
            <Link href="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:text-indigo-600">
              Contact
            </Link>
            <div className="px-3 py-2">
              <DashboardButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
