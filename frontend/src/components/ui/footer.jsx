import React from "react";

export default function footer() {
  return (
    <div className="fixed h-[30px] bottom-0 py-2 w-full z-[999999] text-xs flex justify-between px-6 items-center overflow-hidden backdrop-blur-lg bg-transparent print:hidden">
      <div className="flex">
        powered by<p className=" text-[#BBAE95] px-1 font-bold">MaVoid</p>
      </div>
      <div className="flex items-center justify-center size-7 md:size-7">
        <img src="/public/images/maVoid-Logo.png" alt="" />
      </div>
    </div>
  );
}
