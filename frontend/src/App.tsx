import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Cars from "./pages/Cars";
import CarDetails from "./pages/Cars/CarDetails";
import BookingConfirmation from "./pages/Booking/Confirmation";
import BookingDetails from "./pages/Booking/Details";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Terms from "./pages/Legal/Terms";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ClientOnlyRoute } from "./components/auth/ClientOnlyRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ClientOnlyRoute><Home /></ClientOnlyRoute>} />
            <Route path="/cars" element={<ClientOnlyRoute><Cars /></ClientOnlyRoute>} />
            <Route path="/cars/:id" element={<ClientOnlyRoute><CarDetails /></ClientOnlyRoute>} />
            <Route path="/booking/confirmation" element={<ClientOnlyRoute><BookingConfirmation /></ClientOnlyRoute>} />
            <Route
              path="/bookings/:id"
              element={
                <ProtectedRoute>
                  <ClientOnlyRoute>
                    <BookingDetails />
                  </ClientOnlyRoute>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ClientOnlyRoute>
                    <Dashboard />
                  </ClientOnlyRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
