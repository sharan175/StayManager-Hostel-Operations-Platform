import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import SignUp from './signup.jsx'
import CompleteProfile from './complete-profile.jsx'  
import AdminDashboard from "./AdminDashboard"
import CookDashboard from "./CookDashboard"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/complete-profile" element={<CompleteProfile />} /> 
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/cook" element={<CookDashboard />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)