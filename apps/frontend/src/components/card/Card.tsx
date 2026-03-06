import React from "react";
import Link from "next/link";
import "font-awesome/css/font-awesome.min.css";

const Card = ({ icon, title, content }) => {
  return (
    <div className="max-w-xl rounded overflow-hidden shadow-lg bg-white py-10 px-5">
      <div className="text-4xl text-gray-600 px-5">
        <i className={`text-4xl text-gray-500 fa ${icon} mb-4`}></i>
      </div>

      <div className="px-6 py-4">
        <h2 className="text-black text-2xl font-semibold mb-2">{title}</h2>
        <p className="text-black text-base">{content}</p>
      </div>
      <div className="px-6 py-4">
        <Link
          href="#"
          className="font-bold text-black hover:text-orange-500 transition-colors duration-300 underline underline-offset-8"
        >
          Read More
        </Link>
      </div>
    </div>
  );
};

export default Card;
