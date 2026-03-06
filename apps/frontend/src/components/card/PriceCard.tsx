import React from "react";

const PriceCard = ({
  price,
  plan,
  packageName,
  products,
  storage,
  bandwidth,
}) => {
  return (
    <div className="max-w-xl rounded overflow-hidden shadow-lg bg-white pb-5">
      <div className="text-5xl font-bold p-10 bg-orange-500">
        <h1 className="text-gray-100">
          {price}
          <span className="text-base font-semibold">Monthly</span>
        </h1>
      </div>

      <div className="px-10 py-10">
        <p className="text-orange-500 text-base font-semibold">{plan}</p>
        <h2 className="text-black text-2xl font-bold my-2">{packageName}</h2>

        <ul className="mx-auto text-slate-500 text-base">
          <li className="py-2">{products}</li>
          <li className="py-2">{storage}</li>
          <li className="py-2">Free Support</li>
          <li className="py-2">Unlimited Users</li>
          <li className="pt-2">{bandwidth}</li>
        </ul>
      </div>
      <div className="pb-5">
        <a
          href="#"
          className="text-black font-bold hover:text-orange-500 transition-colors duration-300 hover:underline underline-offset-8"
        >
          Purchase Now{" "}
        </a>
      </div>
    </div>
  );
};

export default PriceCard;
