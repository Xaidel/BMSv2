import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema } from "@/types/formSchema";
import { z } from "zod";
import LogoPlaceholder from "@/assets/new_logo_small.png";
import { toast } from "sonner";

export default function Settings() {
  const [Logo, setLogo] = useState(LogoPlaceholder);
  const [LogoMunicipality, setLogoMunicipality] = useState(LogoPlaceholder);

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      ID: undefined,
      Barangay: "",
      Municipality: "",
      Province: "",
      PhoneNumber: "",
      Email: "",
      Logo: "",
      LogoMunicipality: "",
    },
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const loaded = (await invoke("fetch_settings_command")) as z.infer<
          typeof settingsSchema
        >;
        if (loaded) {
          form.reset(loaded);
          if (loaded.Logo && typeof loaded.Logo === "string") {
            setLogo(loaded.Logo);
            form.setValue("Logo", loaded.Logo); // <- Add this line
          }
          if (loaded.LogoMunicipality && typeof loaded.LogoMunicipality === "string") {
            setLogoMunicipality(loaded.LogoMunicipality);
            form.setValue("LogoMunicipality", loaded.LogoMunicipality);
          }
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }

    loadSettings();
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setLogo(reader.result);
          form.setValue("Logo", reader.result); // set in form
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoMunicipalityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setLogoMunicipality(reader.result);
          form.setValue("LogoMunicipality", reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    try {
      await invoke("save_settings_command", { settings: values });
      toast.success("Settings saved successfully!", {
        description: <p>All changes to Barangay info were saved.</p>,
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Saving failed. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-top justify-center p-4">
      <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-8">
        <h1 className="text-center text-2xl font-semibold mb-10">
          Barangay Information
        </h1>

        <div className="flex flex-col md:flex-row items-center justify-center gap-10">
          {/* Logo Upload Section */}
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              <img
                src={Logo}
                alt="Logo"
                className="object-cover w-full h-full"
              />
            </div>
            <label className="mt-4 cursor-pointer text-sm text-gray-700 flex items-center gap-1 hover:underline">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 16H9v-2.828z"
                />
              </svg>
              Change Banrangay Logo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
            </label>

            <div className="mt-8 flex flex-col items-center">
              <div className="w-40 h-40 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                <img
                  src={LogoMunicipality}
                  alt="Municipality Logo"
                  className="object-cover w-full h-full"
                />
              </div>
              <label className="mt-4 cursor-pointer text-sm text-gray-700 flex items-center gap-1 hover:underline">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 16H9v-2.828z"
                  />
                </svg>
                Change Municipality Logo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoMunicipalityChange}
                />
              </label>
            </div>
          </div>

          {/* Form Section */}
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full max-w-md space-y-4"
          >
            <div className="flex items-center justify-between">
              <label>Barangay</label>
              <input
                type="text"
                className="border rounded px-3 py-2 w-2/3"
                placeholder="Enter Barangay"
                {...form.register("Barangay")}
              />
            </div>
            <div className="flex items-center justify-between">
              <label>Municipality</label>
              <input
                type="text"
                className="border rounded px-3 py-2 w-2/3"
                placeholder="Enter Municipality"
                {...form.register("Municipality")}
              />
            </div>
            <div className="flex items-center justify-between">
              <label>Province</label>
              <input
                type="text"
                className="border rounded px-3 py-2 w-2/3"
                placeholder="Enter Province"
                {...form.register("Province")}
              />
            </div>
            <div className="flex items-center justify-between">
              <label>Phone Number</label>
              <input
                type="text"
                className="border rounded px-3 py-2 w-2/3"
                placeholder="Enter phone number"
                {...form.register("PhoneNumber")}
              />
            </div>
            <div className="flex items-center justify-between">
              <label>Email Address</label>
              <input
                type="Email"
                className="border rounded px-3 py-2 w-2/3"
                placeholder="Enter Email"
                {...form.register("Email")}
              />
            </div>

            <input type="hidden" {...form.register("Logo")} />
            <input type="hidden" {...form.register("LogoMunicipality")} />

            <div className="text-right">
              <button
                type="submit"
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
