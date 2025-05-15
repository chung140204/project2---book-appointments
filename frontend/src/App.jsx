import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BookAppointment from "./pages/BookAppointment";
import MyAppointments from "./pages/MyAppointments";
import AdminAppointments from "./pages/AdminAppointments";
import NotFound from "./pages/NotFound";
import DashboardHomePage from "./DashboardHomePage";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminServices from "./pages/AdminServices";
import ProfileEdit from "./pages/ProfileEdit";

function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const u = localStorage.getItem("user");
    setUser(u ? JSON.parse(u) : null);
    const handleStorage = () => {
      const u = localStorage.getItem("user");
      setUser(u ? JSON.parse(u) : null);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  if (user === undefined) return null;

  return (
    <>
      <Routes>
        {!user ? (
          <>
            <Route path="/" element={<Login setUser={setUser} />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Login setUser={setUser} />} />
            <Route path="/login" element={<Navigate to="/dashboard" />} />
            <Route path="/register" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<DashboardHomePage setUser={setUser} />} />
            <Route path="/book" element={<BookAppointment user={user} />} />
            <Route path="/my-appointments" element={<MyAppointments user={user} />} />
            <Route path="/profile" element={<ProfileEdit user={user} setUser={setUser} />} />
            <Route path="/admin" element={user.role === "admin" ? <AdminAppointments /> : <Navigate to="/dashboard" />} />
            <Route path="/admin/services" element={user.role === "admin" ? <AdminServices /> : <Navigate to="/dashboard" />} />
            <Route path="*" element={<NotFound />} />
          </>
        )}
      </Routes>
      <ToastContainer
        position="bottom-right"
        autoClose={1500}
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        limit={1}
        theme="colored"
      />
    </>
  );
}

export default App;