"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "../components/icon";
import Button from "../components/button";

const Navbar = () => {
  const adminUrl = process.env.NODE_ENV === "production" 
    ? "https://admin.thelegacyapartment.co.in" 
    : "http://localhost:3001";

  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  
  const [showSocietySubNav, setShowSocietySubNav] = useState<boolean>(false);
  const [showMobileSocietySubNav, setMobileSocietySubNav] = useState<boolean>(false);
  
  const [showServicesSubNav, setShowServicesSubNav] = useState<boolean>(false);
  const [showMobileServicesSubNav, setMobileServicesSubNav] = useState<boolean>(false);
  
  const [showEventsSubNav, setShowEventsSubNav] = useState<boolean>(false);
  const [showMobileEventsSubNav, setMobileEventsSubNav] = useState<boolean>(false);

  const pathname = usePathname();

  const handleLinkClick = (linkText: string) => {
    setSelectedLink(linkText);
  };

  useEffect(() => {
    if (!pathname) return;
    const path = pathname.toLowerCase();
    
    if (path === "/") setSelectedLink("Home");
    else if (path.startsWith("/committee") || path.startsWith("/rules")) setSelectedLink("Our Society");
    else if (path.startsWith("/finances") || path.startsWith("/help-desk") || path.startsWith("/vendors")) setSelectedLink("Services");
    else if (path.startsWith("/gallery") || path.startsWith("/upcoming-events")) setSelectedLink("Events");
    else if (path.startsWith("/contact")) setSelectedLink("Contact Us");
    else setSelectedLink("Home");
  }, [pathname]);

  const toggleMobileMenu = () => {
    setShowMobileMenu((prev: boolean) => !prev);
  };

  const toggleSubNavSociety = () => {
    setMobileSocietySubNav(!showMobileSocietySubNav);
  };
  
  const toggleSubNavServices = () => {
    setMobileServicesSubNav(!showMobileServicesSubNav);
  };

  const toggleSubNavEvents = () => {
    setMobileEventsSubNav(!showMobileEventsSubNav);
  };

  return (
    <nav className="absolute top-0 left-0 w-full bg-transparent py-1 px-6 flex flex-col z-50">
      <div className="flex items-center mb-4 pt-2">
        <div className="flex items-center pt-2">
          <Image
            src="/navbar-logo.svg"
            alt="Company Logo"
            width={50}
            height={50}
            className="h-10 w-auto ml-[5%]"
          />
        </div>
      </div>

      {/* Navigation Links */}
      <div className="hidden lg:flex justify-center items-center space-x-8 my-4">
        <Link
          href="/"
          className={`relative pb-2 text-white hover:text-gray-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-orange-500 after:w-full after:transition-all after:duration-300 ${
            selectedLink === "Home" ? "after:opacity-100 after:scale-x-100" : "after:opacity-0 after:scale-x-0 hover:after:opacity-100 hover:after:scale-x-100"
          }`}
          onClick={() => handleLinkClick("Home")}
        >
          Home
        </Link>

        {/* Our Society */}
        <div
          className="relative"
          onMouseEnter={() => setShowSocietySubNav(true)}
          onMouseLeave={() => setShowSocietySubNav(false)}
        >
          <Link
            href="#"
            className={`relative pb-2 text-white hover:text-gray-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-orange-500 after:w-full after:transition-all after:duration-300 ${
              selectedLink === "Our Society" ? "after:opacity-100 after:scale-x-100" : "after:opacity-0 after:scale-x-0 hover:after:opacity-100 hover:after:scale-x-100"
            }`}
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              handleLinkClick("Our Society");
            }}
          >
            Our Society
          </Link>
          {showSocietySubNav && (
            <ul
              className="absolute left-0 mt-3 text-sm px-5 py-2 bg-slate-100 border rounded border-white w-52 z-50 shadow-xl"
              style={{ top: "100%" }}
            >
              <li className="py-2">
                <Link className="text-black hover:text-orange-500" href="/committee">
                  Committee
                </Link>
              </li>
              <li className="py-2">
                <Link className="text-black hover:text-orange-500" href="/rules">
                  Rules
                </Link>
              </li>
            </ul>
          )}
        </div>

        {/* Services */}
        <div
          className="relative"
          onMouseEnter={() => setShowServicesSubNav(true)}
          onMouseLeave={() => setShowServicesSubNav(false)}
        >
          <Link
            href="#"
            className={`relative pb-2 text-white hover:text-gray-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-orange-500 after:w-full after:transition-all after:duration-300 ${
              selectedLink === "Services" ? "after:opacity-100 after:scale-x-100" : "after:opacity-0 after:scale-x-0 hover:after:opacity-100 hover:after:scale-x-100"
            }`}
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              handleLinkClick("Services");
            }}
          >
            Services
          </Link>
          {showServicesSubNav && (
            <ul
              className="absolute left-0 mt-3 text-sm px-5 py-2 bg-slate-100 border rounded border-white w-52 z-50 shadow-xl"
              style={{ top: "100%" }}
            >
              <li className="py-2">
                <Link className="text-black hover:text-orange-500" href="/finances">
                  Finances
                </Link>
              </li>
              <li className="py-2">
                <Link className="text-black hover:text-orange-500" href="/help-desk">
                  Help Desk
                </Link>
              </li>
            </ul>
          )}
        </div>

        {/* Events */}
        <div
          className="relative"
          onMouseEnter={() => setShowEventsSubNav(true)}
          onMouseLeave={() => setShowEventsSubNav(false)}
        >
          <Link
            href="#"
            className={`relative pb-2 text-white hover:text-gray-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-orange-500 after:w-full after:transition-all after:duration-300 ${
              selectedLink === "Events" ? "after:opacity-100 after:scale-x-100" : "after:opacity-0 after:scale-x-0 hover:after:opacity-100 hover:after:scale-x-100"
            }`}
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              handleLinkClick("Events");
            }}
          >
            Events
          </Link>
          {showEventsSubNav && (
            <ul
              className="absolute left-0 mt-3 text-sm px-5 py-2 bg-slate-100 border rounded border-white w-52 z-50 shadow-xl"
              style={{ top: "100%" }}
            >
              <li className="py-2">
                <Link className="text-black hover:text-orange-500" href="/gallery">
                  Gallery
                </Link>
              </li>
            </ul>
          )}
        </div>

        {/* Contact Us */}
        <Link
          href="/Contact"
          className={`relative pb-2 text-white hover:text-gray-300 after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-orange-500 after:w-full after:transition-all after:duration-300 ${
            selectedLink === "Contact Us" ? "after:opacity-100 after:scale-x-100" : "after:opacity-0 after:scale-x-0 hover:after:opacity-100 hover:after:scale-x-100"
          }`}
          onClick={() => handleLinkClick("Contact Us")}
        >
          Contact Us
        </Link>
        
        {/* Admin Login */}
        <Button
          href={adminUrl}
          variant="primary"
          size="md"
          label="Admin Login"
          className="-mt-1"
        />
      </div>

      {/* Mobile Menu (Dropdown) */}
      <div
        className={`lg:hidden absolute top-full left-0 w-full bg-white flex flex-col transition-all duration-300 ease-in-out shadow-xl origin-top ${
          showMobileMenu ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
        }`}
      >
        <Link
          href="/"
          className={`block w-full text-left py-4 px-6 text-gray-800 border-b border-gray-400 hover:text-orange-500 hover:bg-gray-50 transition-colors ${
            selectedLink === "Home" ? "text-orange-500" : ""
          }`}
          onClick={() => {
            handleLinkClick("Home");
            toggleMobileMenu();
          }}
        >
          Home
        </Link>

        {/* Our Society (Mobile) */}
        <div className="w-full border-b border-gray-400">
          <button
            className={`w-full flex justify-between items-center py-4 px-6 text-gray-800 hover:text-orange-500 hover:bg-gray-50 focus:outline-none transition-colors ${
              selectedLink === "Our Society" ? "text-orange-500" : ""
            }`}
             onClick={(e: React.MouseEvent) => {
               e.preventDefault();
               handleLinkClick("Our Society");
               toggleSubNavSociety();
             }}
          >
            <span>Our Society</span>
            <Icon type="keyboard_arrow_down" className={`text-[24px] transition-transform ${showMobileSocietySubNav ? "rotate-180" : ""}`} />
          </button>
          
          <div className={`overflow-hidden transition-all duration-300 bg-gray-50 ${showMobileSocietySubNav ? "max-h-[500px]" : "max-h-0"}`}>
            <ul className="w-full flex flex-col">
              <li>
                <Link href="/committee" onClick={toggleMobileMenu} className="block w-full text-left py-3 px-10 text-gray-600 hover:text-orange-500 hover:bg-gray-100 transition-colors">
                  Committee
                </Link>
              </li>
              <li>
                <Link href="/rules" onClick={toggleMobileMenu} className="block w-full text-left py-3 px-10 text-gray-600 hover:text-orange-500 hover:bg-gray-100 transition-colors">
                  Rules
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Services (Mobile) */}
        <div className="w-full border-b border-gray-400">
          <button
            className={`w-full flex justify-between items-center py-4 px-6 text-gray-800 hover:text-orange-500 hover:bg-gray-50 focus:outline-none transition-colors ${
              selectedLink === "Services" ? "text-orange-500" : ""
            }`}
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              handleLinkClick("Services");
              toggleSubNavServices();
            }}
          >
            <span>Services</span>
            <Icon type="keyboard_arrow_down" className={`text-[24px] transition-transform ${showMobileServicesSubNav ? "rotate-180" : ""}`} />
          </button>
          
          <div className={`overflow-hidden transition-all duration-300 bg-gray-50 ${showMobileServicesSubNav ? "max-h-[500px]" : "max-h-0"}`}>
            <ul className="w-full flex flex-col">
              <li>
                <Link href="/finances" onClick={toggleMobileMenu} className="block w-full text-left py-3 px-10 text-gray-600 hover:text-orange-500 hover:bg-gray-100 transition-colors">
                  Finances
                </Link>
              </li>
              <li>
                <Link href="/help-desk" onClick={toggleMobileMenu} className="block w-full text-left py-3 px-10 text-gray-600 hover:text-orange-500 hover:bg-gray-100 transition-colors">
                  Help Desk
                </Link>
              </li>
              <li>
                <Link href="/vendors" onClick={toggleMobileMenu} className="block w-full text-left py-3 px-10 text-gray-600 hover:text-orange-500 hover:bg-gray-100 transition-colors">
                  Vendors
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Events (Mobile) */}
        <div className="w-full border-b border-gray-400">
          <button
            className={`w-full flex justify-between items-center py-4 px-6 text-gray-800 hover:text-orange-500 hover:bg-gray-50 focus:outline-none transition-colors ${
              selectedLink === "Events" ? "text-orange-500" : ""
            }`}
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              handleLinkClick("Events");
              toggleSubNavEvents();
            }}
          >
            <span>Events</span>
            <Icon type="keyboard_arrow_down" className={`text-[24px] transition-transform ${showMobileEventsSubNav ? "rotate-180" : ""}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 bg-gray-50 ${showMobileEventsSubNav ? "max-h-[500px]" : "max-h-0"}`}>
            <ul className="w-full flex flex-col">
              <li>
                <Link href="/gallery" onClick={toggleMobileMenu} className="block w-full text-left py-3 px-10 text-gray-600 hover:text-orange-500 hover:bg-gray-100 transition-colors">
                  Gallery
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Us (Mobile) */}
        <div className="w-full border-b border-gray-400">
           <Link
             href="/Contact"
             className={`block w-full text-left py-4 px-6 text-gray-800 hover:text-orange-500 hover:bg-gray-50 transition-colors ${
               selectedLink === "Contact Us" ? "text-orange-500" : ""
             }`}
             onClick={() => {
               handleLinkClick("Contact Us");
               toggleMobileMenu();
             }}
           >
             Contact Us
           </Link>
        </div>

        {/* Admin Login (Mobile) */}
        <div className="w-full px-6 py-4">
           <Button
             href={adminUrl}
             variant="primary"
             size="md"
             label="Admin Login"
             className="w-full"
             onClick={() => {
               handleLinkClick("Admin Login");
               toggleMobileMenu();
             }}
           />
        </div>
      </div>

      {/* Hamburger Icon (Mobile) */}
      <div className="lg:hidden flex items-center justify-end m-1 absolute top-6 right-6 z-10">
        <button
          onClick={toggleMobileMenu}
          className={`focus:outline-none pb-2 transition-colors duration-300 ${showMobileMenu ? "text-orange-500" : "text-white"}`}
          aria-label="Open Mobile Menu"
        >
          {showMobileMenu ? (
            <Icon type="close" className="text-[32px]" />
          ) : (
            <Icon type="menu" className="text-[32px]" />
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
