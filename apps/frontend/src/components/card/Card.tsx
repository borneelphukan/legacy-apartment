import React from "react";
import Link from "next/link";
import StorageIcon from "@mui/icons-material/Storage";
import CodeIcon from "@mui/icons-material/Code";
import EditIcon from "@mui/icons-material/Edit";

const Card = ({ icon, title, content }) => {
  const IconComponent = icon === "Storage" ? StorageIcon : icon === "Code" ? CodeIcon : EditIcon;

  return (
    <div className="max-w-xl rounded overflow-hidden shadow-lg bg-white py-10 px-5">
      <div className="text-4xl text-gray-600 px-5">
        <IconComponent className="mb-4 text-gray-500" fontSize="inherit" />
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
