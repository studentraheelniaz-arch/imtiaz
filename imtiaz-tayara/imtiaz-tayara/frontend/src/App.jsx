import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { RequireAuth, RequireAdmin } from './components/RouteGuards';

import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import MockCheckout from './pages/MockCheckout';
import Confirmation from './pages/Confirmation';
import PaymentFailed from './pages/PaymentFailed';
import Login from './pages/Login';
import Register from './pages/Register';
import MyBookings from './pages/MyBookings';

import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ManageSchedules from './pages/admin/ManageSchedules';
import ManageVans from './pages/admin/ManageVans';
import AllBookings from './pages/admin/AllBookings';
import AuditLog from './pages/admin/AuditLog';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/booking/:id" element={<Booking />} />
          <Route path="/payment/:id" element={<RequireAuth><Payment /></RequireAuth>} />
          <Route path="/mock-checkout" element={<MockCheckout />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-bookings" element={<RequireAuth><MyBookings /></RequireAuth>} />

          <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
            <Route index element={<Dashboard />} />
            <Route path="schedules" element={<ManageSchedules />} />
            <Route path="vans" element={<ManageVans />} />
            <Route path="bookings" element={<AllBookings />} />
            <Route path="logs" element={<AuditLog />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function NotFound() {
  return (
    <div className="mx-auto max-w-md px-5 py-24 text-center">
      <p className="font-display text-3xl font-bold">404</p>
      <p className="mt-2 text-road-950/60">This road doesn't go anywhere.</p>
    </div>
  );
}
