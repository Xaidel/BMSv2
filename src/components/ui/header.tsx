import { useEffect, useState } from "react";
import getSettings from "@/service/api/settings/getSettings";
import logo from "@/assets/new_logo_small.png";
import logoAppnado from "@/assets/appnado_logo.png"

export default function Header() {
  const [logoBarangayUrl, setLogoBarangayUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await getSettings();
        if (data.setting.ImageB) {
          setLogoBarangayUrl(`data:image/png;base64,${data.setting.ImageB}`);
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchSettings();
  }, []);

  return (
    <div className="min-w-screen bg-white py-3 px-24 font-redhat text-black flex items-center">
      <div className="flex items-center gap-4">
        <img src={logo} alt="logo" className="ml-19 max-w-[3rem]" />
        <p className="ml-2 mr-158 text-xl font-semi-bold">Barangay Management System</p>
        <img
          src={logoAppnado}
          alt="logo"
          className="max-w-[7rem]"
        />
        {logoBarangayUrl && (
          <img
            src={logoBarangayUrl}
            alt="logo"
            className="max-w-[4rem]"
          />
        )}
      </div>
    </div>
  );
}
