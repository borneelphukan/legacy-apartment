import React from "react";

const Button = ({ bgColor, textColor, text, type = "button" as any, className = "" }) => {
  return (
    <button
      type={type}
      className={`bg-${bgColor} text-${textColor} my-10 py-3 px-7 rounded-md shadow-lg hover:bg-black hover:text-white border border-solid border-black ${className}`}
    >
      {text}
    </button>
  );
};

export default Button;
