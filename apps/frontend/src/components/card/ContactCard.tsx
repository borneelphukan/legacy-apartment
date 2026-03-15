import React from "react";
import { Icon } from '@legacy-apartment/ui';

const ContactCard = ({ icon, title, address }) => {
  const iconType = icon === "LocationOn" ? "location_on" : icon === "AccessTime" ? "schedule" : icon === "Email" ? "mail" : "call";

  return (
    <div className="max-w-xl rounded overflow-hidden shadow-lg py-10 px-5">
      <div className="text-4xl px-5 text-gray-600 flex justify-center">
        <Icon type={iconType} className="mb-4 text-[40px]" />
      </div>

      <div className="px-6 py-4">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-base">{address}</p>
      </div>
    </div>
  );
};

export default ContactCard;
