import { QueryClient } from '@tanstack/query-core'
import { QueryClientProvider } from '@tanstack/react-query'
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import LoginPage from './pages/Login';
import AppLayout from './components/ui/applayout';
import Dashboard from './pages/Dashboard';
import Event from './pages/Event';
import Residents from './pages/Residents';
import Households from './pages/Households';
import Certificate from './pages/Certificate';
import Income from './pages/Income';
import Expense from './pages/Expense';
import BlotterRecord from './pages/BlotterRecord';
import Official from './pages/Official';
import Settings from './pages/Settings';
import { Toaster } from './components/ui/sonner';
import IssueCertificate from './pages/IssueCertificate';
function App() {
  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 1000 * 60 * 60 * 24
      },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route
            element={<AppLayout />}
          >
            <Route path='dashboard' element={<Dashboard />} />
            <Route path='event' element={<Event />} />
            <Route path='residents' element={<Residents />} />
            <Route path='households' element={<Households />} />
            <Route path='certificates' element={<Certificate />} />
            <Route path='/certificates/template/:template' element={<IssueCertificate />} />
            <Route path='income' element={<Income />} />
            <Route path='expense' element={<Expense />} />
            <Route path='blotter' element={<BlotterRecord />} />
            <Route path='officials' element={<Official />} />
            <Route path='settings' element={<Settings />} />
          </Route>
          <Route index element={<LoginPage />}></Route>
        </Routes>
        <Toaster
          position="top-center"
          richColors
          closeButton
        />
      </Router >
    </QueryClientProvider>
  )
}

export default App;
