import { Routes, Route } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import Home from "../pages/Home";
import About from "../pages/About";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import VerifyEmail from "../pages/auth/VerifyEmail";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import BikeList from "../pages/bikes/BikeList";
import BikeDetail from "../pages/bikes/BikeDetail";
import Profile from "../pages/user/Profile";
import Bookings from "../pages/user/Bookings";

import RentalHistory from "../pages/user/RentalHistory";
import ChangePassword from "../pages/user/ChangePassword";
import AddReview from "../pages/user/AddReview";
import AdminHome from "../pages/admin/AdminHome";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminProfile from "../pages/admin/AdminProfile";
import ManageBikes from "../pages/admin/ManageBikes";
import ManageBookings from "../pages/admin/ManageBookings";
import ModerateReviews from "../pages/admin/ModerateReviews";
import UserAdmin from "../pages/admin/UserAdmin";
import NotFound from "../pages/NotFound";

const AppRouter = () => {
  return (
    <Routes>
      {/* UserLayout wraps all user routes */}
      <Route element={<UserLayout />}>
        {/* Public user routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/bikes" element={<BikeList />} />
        <Route path="/bikes/:id" element={<BikeDetail />} />
        {/* Protected user routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/user/profile" element={<Profile />} />
          <Route path="/user/bookings" element={<Bookings />} />

          <Route path="/user/rental-history" element={<RentalHistory />} />
          <Route path="/user/change-password" element={<ChangePassword />} />
          <Route path="/user/review" element={<AddReview />} />
        </Route>
      </Route>

      {/* Admin Routes - Protected with AdminLayout */}
      <Route path="/admin" element={<ProtectedRoute role="admin" />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminHome />} />
          <Route path="/admin/analytics" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserAdmin />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/bikes" element={<ManageBikes />} />
          <Route path="/admin/bookings" element={<ManageBookings />} />
          <Route path="/admin/reviews" element={<ModerateReviews />} />
        </Route>
      </Route>

      {/* 404 Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
