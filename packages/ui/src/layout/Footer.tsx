import React from "react";
import contactData from "../data/contact-data.json";
import Link from "next/link";
import { Icon } from "../components/icon";

const Footer = () => {
  return (
    <footer className="bg-black text-white text-center py-8 relative">
      <div className="container mx-auto flex flex-col items-center justify-center">
        <div className="w-full max-w-screen-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4 md:px-8 flex-grow">
          {/* Column 1: Branding */}
          <div className="mb-8 md:text-left text-center">
            <h2 className="text-3xl font-semibold mb-4">
              <span className="text-orange-200">THE </span>LEGACY
            </h2>
            <div className="text-sm text-slate-400 flex flex-col space-y-3 items-center md:items-start mt-4">
              <div className="flex items-center space-x-3">
                <Icon type="location_on" className="text-[20px] text-orange-500 flex-shrink-0" />
                <span>{contactData.address}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Icon type="mail" className="text-[20px] text-orange-500 flex-shrink-0" />
                <span>{contactData.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Icon type="call" className="text-[20px] text-orange-500 flex-shrink-0" />
                <span>{contactData.phone}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Society */}
          <div className="mb-8 md:text-left md:pl-12">
            <h2 className="text-xl font-semibold mb-4">Society</h2>
            <ul className="text-center md:text-left">
              <li className="py-1">
                <Link
                  className="text-sm text-slate-400 hover:text-orange-500"
                  href="/committee"
                >
                  Committee
                </Link>
              </li>
              <li className="py-1">
                <Link
                  className="text-sm text-slate-400 hover:text-orange-500"
                  href="/rules"
                >
                  Rules
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div className="mb-8 md:text-left md:pl-12">
            <h2 className="text-xl font-semibold mb-4">Services</h2>
            <ul className="text-center md:text-left">
              <li className="py-1">
                <Link
                  className="text-sm text-slate-400 hover:text-orange-500"
                  href="/contributions"
                >
                  Contributions
                </Link>
              </li>
              <li className="py-1">
                <Link
                  className="text-sm text-slate-400 hover:text-orange-500"
                  href="/help-desk"
                >
                  Help Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Events */}
          <div className="mb-8 md:text-left md:pl-12">
            <h2 className="text-xl font-semibold mb-4">Events</h2>
            <ul className="text-center md:text-left">
              <li className="py-1">
                <Link
                  className="text-sm text-slate-400 hover:text-orange-500"
                  href="/gallery"
                >
                  Gallery
                </Link>
              </li>
              <li className="py-1">
                <Link
                  className="text-sm text-slate-400 hover:text-orange-500"
                  href="/Contact"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* All Rights Reserved tagline */}
      <p className="mt-8 text-sm text-slate-400">
        Legacy Resident Society &copy; {new Date().getFullYear()} All Rights
        Reserved
      </p>
    </footer>
  );
};

export default Footer;
