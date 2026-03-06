import React from "react";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PhoneIcon from "@mui/icons-material/Phone";

const ContactCard = ({ icon, title, address }) => {
  const IconComponent = icon === "LocationOn" ? LocationOnIcon : icon === "AccessTime" ? AccessTimeIcon : PhoneIcon;

  return (
    <div className="max-w-xl rounded overflow-hidden shadow-lg py-10 px-5">
      <div className="text-4xl px-5 text-gray-600">
        <IconComponent className="mb-4" fontSize="inherit" />
      </div>

      <div className="px-6 py-4">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-base">{address}</p>
      </div>
    </div>
  );
};

export default ContactCard;
