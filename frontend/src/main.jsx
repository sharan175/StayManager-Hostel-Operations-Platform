import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import SignUp from './signup.jsx'
import CompleteProfile from './complete-profile.jsx'  
import AdminDashboard from "./AdminDashboard"
import CookDashboard from "./CookDashboard"
import WardenDashboard from "./WardenDashboard";
import StudentPayment from './Studentpayment.jsx';
import StudentDashboard from './StudentDashboard.jsx'
import ProtectedRoute from "./ProtectedRoute";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/complete-profile" element={<CompleteProfile />} /> 
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/warden" element={<WardenDashboard />} />
        <Route path="/cook" element={<CookDashboard />} />
        <Route
  path="/student"
  element={
    <ProtectedRoute allowedRoles={["student"]}>
      <StudentDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/student/pay"
  element={
    <ProtectedRoute allowedRoles={["student"]}>
      <StudentPayment />
    </ProtectedRoute>
  }
/>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)