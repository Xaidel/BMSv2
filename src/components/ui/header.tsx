import logo from "../../assets/new_logo_small.png";
import { useEffect, useState } from "react";

export default function Header() {

  const user = sessionStorage.getItem("user")
  const parsedUser = JSON.parse(user)
  return (
    <div className="w-screen bg-white py-3 px-24 font-redhat text-black flex items-center">
      <div className="flex items-center gap-7 ">
        <img src={logo} alt="logo" className="max-w-[3rem]" />
        <p className="text-xl">Barangay Management System</p>
        {parsedUser && (
          <p className="text-xl font-redhat text-black ml-210">
            {parsedUser.user.Username.charAt(0).toUpperCase() + parsedUser.user.Username.slice(1)}
          </p>
        )}
      </div>
    </div>
  );
}
