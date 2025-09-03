import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema } from "@/types/formSchema";
import { z } from "zod";
import ImageBPlaceholder from "@/assets/new_logo_small.png";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ErrorResponse } from "@/service/api/auth/login";
import { useAddSettings } from "@/features/api/settings/useAddSettings";
import { useEditSettings } from "@/features/api/settings/useEditSettings";
import { useSettings } from "@/features/api/settings/useSettings";
export default function Settings({ onSave }: { onSave: () => void }) {
  const [ImageB, setImageB] = useState(ImageBPlaceholder);
  const [ImageM, setImageM] = useState(ImageBPlaceholder);
  const { data: setting } = useSettings()
  const settingData = useMemo(() => {
    if (!setting) return
    return setting?.setting
  }, [setting])
  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      ID: undefined,
      Barangay: settingData?.Barangay,
      Municipality: settingData?.Municipality,
      Province: settingData?.Province,
      PhoneNumber: settingData?.PhoneNumber,
      Email: settingData?.Email,
      ImageB: settingData?.ImageB,
      ImageM: settingData?.ImageM,
    },
  });

  useEffect(() => {
    if (settingData) {
      form.reset({
        ID: settingData.ID,
        Barangay: settingData.Barangay ?? "",
        Municipality: settingData.Municipality ?? "",
        Province: settingData.Province ?? "",
        PhoneNumber: settingData.PhoneNumber ?? "",
        Email: settingData.Email ?? "",
        ImageB: settingData.ImageB ?? "",
        ImageM: settingData.ImageM ?? "",
      });

      if (settingData.ImageB) {
        const isDataUrlB = settingData.ImageB.startsWith("data:");
        setImageB(
          isDataUrlB
            ? settingData.ImageB
            : `data:image/png;base64,${settingData.ImageB}`
        );
      }

      if (settingData.ImageM) {
        const isDataUrlM = settingData.ImageM.startsWith("data:");
        setImageM(
          isDataUrlM
            ? settingData.ImageM
            : `data:image/png;base64,${settingData.ImageM}`
        );
      }
    }
  }, [settingData, form]);
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings"); // adjust endpoint if necessary
        if (!res.ok) throw new Error("Failed to load settings");
        let loaded: z.infer<typeof settingsSchema> | null = null;
        try {
          loaded = (await res.json()) as z.infer<typeof settingsSchema>;
        } catch {
          console.warn("Settings endpoint did not return valid JSON, using defaults");
        }
        if (loaded) {
          form.reset(loaded);
          if (loaded.ImageB && typeof loaded.ImageB === "string") {
            const isDataUrlB = loaded.ImageB.startsWith("data:");
            const previewB = isDataUrlB ? loaded.ImageB : `data:image/png;base64,${loaded.ImageB}`;
            setImageB(previewB);
            const base64B = isDataUrlB ? loaded.ImageB.split(",")[1] ?? loaded.ImageB : loaded.ImageB;
            form.setValue("ImageB", base64B);
          }
          if (loaded.ImageM && typeof loaded.ImageM === "string") {
            const isDataUrlM = loaded.ImageM.startsWith("data:");
            const previewM = isDataUrlM ? loaded.ImageM : `data:image/png;base64,${loaded.ImageM}`;
            setImageM(previewM);
            const base64M = isDataUrlM ? loaded.ImageM.split(",")[1] ?? loaded.ImageM : loaded.ImageM;
            form.setValue("ImageM", base64M);
          }
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }

    loadSettings();
  }, []);

  const handleImageBChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImageB(reader.result); // keep full Data URL for preview
          const base64 = reader.result.split(",")[1] ?? reader.result; // strip data URL prefix
          form.setValue("ImageB", base64); // send only base64 to backend
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageMChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImageM(reader.result); // keep full Data URL for preview
          const base64 = reader.result.split(",")[1] ?? reader.result; // strip data URL prefix
          form.setValue("ImageM", base64); // send only base64 to backend
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addMutation = useAddSettings();
  const editMutation = useEditSettings();
  const queryClient = useQueryClient();

  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    const isUpdate = Boolean(values.ID);
    const promise = isUpdate
      ? editMutation.mutateAsync({ ID: values.ID as number, updated: values }).then(() => ({ settings: values }))
      : addMutation.mutateAsync(values);

    toast.promise(promise, {
      loading: isUpdate
        ? "Updating settings, please wait..."
        : "Adding settings, please wait...",
      success: () => {
        form.reset(values);
        queryClient.invalidateQueries({ queryKey: ["settings"] });
        if (onSave) onSave();
        return {
          message: isUpdate
            ? "Settings updated successfully"
            : "Settings added successfully",
        };
      },
      error: (error: ErrorResponse) => {
        return {
          message: isUpdate
            ? "Updating settings failed"
            : "Adding settings failed",
          description: `${error.error}`,
        };
      },
    });
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-top justify-center p-4">
      <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-8">
        <h1 className="text-center text-2xl font-semibold mb-10">
          Barangay Information
        </h1>

        <div className="flex flex-col md:flex-row items-center justify-center gap-10">
          {/* ImageB Upload Section */}
          {/* <div className="flex flex-col items-center">
            <div className="w-40 h-40 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              <img
                src={ImageB}
                alt="ImageB"
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
              Change Barangay Logo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageBChange}
              />
            </label>

            <div className="mt-8 flex flex-col items-center">
              <div className="w-40 h-40 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                <img
                  src={ImageM}
                  alt="Municipality ImageB"
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
                  onChange={handleImageMChange}
                />
              </label>
            </div>
          </div> */}

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

            <input type="hidden" {...form.register("ImageB")} />
            <input type="hidden" {...form.register("ImageM")} />

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
