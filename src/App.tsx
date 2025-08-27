import { QueryClient } from "@tanstack/query-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AppLayout from "./components/ui/applayout";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/login";
import Event from "./pages/Event";
import Residents from "./pages/Residents";
import Households from "./pages/Households";
import Certificate from "./pages/Certificate";
import Income from "./pages/Income";
import Expense from "./pages/Expense";
import BlotterRecord from "./pages/BlotterRecord";
import Official from "./pages/Official";
import Settings from "./pages/Settings";
import { Toaster } from "./components/ui/sonner";
import IssueCertificate from "./pages/IssueCertificate";
import Map from "./pages/Map";
import Logbook from "./pages/logbook";

function App() {
  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 1000 * 60 * 60 * 24,
      },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="logbook" element={<Logbook />} />
            <Route path="event" element={<Event />} />
            <Route path="residents" element={<Residents />} />
            <Route path="households" element={<Households />} />
            <Route path="map" element={<Map />} />
            <Route path="certificates" element={<Certificate />} />
            <Route
              path="/certificates/template/:template"
              element={<IssueCertificate />}
            />
            <Route path="income" element={<Income />} />
            <Route path="expense" element={<Expense />} />
            <Route path="blotter" element={<BlotterRecord />} />
            <Route path="officials" element={<Official />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route index element={<LoginPage />}></Route>
        </Routes>
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              success:
                "!bg-white !border !border-[#00a545] !rounded-xl !shadow-lg !p-4 !gap-5",
              error:
                "!bg-white !border !border-[#C4060F] !rounded-xl !shadow-lg !p-4 !gap-5",
              title: "!text-[#0F151D] !font-semibold !text-sm",
              closeButton:
                "!right-2 !w-5 !h-5 !flex !items-center !justify-center !rounded-md !bg-gray-100 hover:!bg-gray-200 !border !border-gray-300 !text-gray-600 hover:!text-gray-800 !transition-colors",
              description: "!text-[#0F151D] !text-sm !mt-1 !opacity-70",
            },
          }}
        />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
