import React from "react";
import Navbar from "./components/Navbar";
import { Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Cars from "./pages/Cars";
import CarDetails from "./pages/CarDetails";
import MyBookings from "./pages/MyBookings";
import Footer from "./components/Footer";
import Layout from "./pages/owner/Layout";
import Dashboard from "./pages/owner/Dashboard";
import AddCar from "./pages/owner/AddCar";
import ManageCars from "./pages/owner/ManageCars";
import ManageBookings from "./pages/owner/ManageBookings";
import EditCar from "./pages/owner/EditCar";
import { About, Help, Terms, Privacy, Insurance, Contact, NotFound } from "./pages/StaticPage";
import Login from "./components/Login";
import { Toaster } from 'react-hot-toast'
import { useAppContext } from "./context/AppContext.js";

const App = () => {
  const { showLogin, setShowLogin } = useAppContext();

  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <>
    <Toaster />
    {showLogin && <Login setShowLogin={setShowLogin}/>}
      
      {!isAdminPath && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/car-details/:id" element={<CarDetails />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/insurance" element={<Insurance />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<Layout/>}>
          <Route index element={<Dashboard/>}/>
          <Route path="add-car" element={<AddCar/>}/>
          <Route path="edit-car/:id" element={<EditCar/>}/>
          <Route path="manage-cars" element={<ManageCars/>}/>
          <Route path="manage-bookings" element={<ManageBookings />}/>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>

      {!isAdminPath && <Footer/>}
    </>
  );
};

export default App;
