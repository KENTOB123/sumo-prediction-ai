import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { PaymentProvider } from './contexts/PaymentContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Predictions from './pages/Predictions'
import PredictionHistory from './pages/PredictionHistory'
import PredictionStats from './pages/PredictionStats'
import RikishiList from './pages/RikishiList'
import RikishiDetail from './pages/RikishiDetail'
import Payment from './pages/Payment'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentCancel from './pages/PaymentCancel'
import ProtectedRoute from './components/ProtectedRoute'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <AuthProvider>
      <PaymentProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/predictions" 
              element={
                <ProtectedRoute>
                  <Predictions />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/predictions/history" 
              element={
                <ProtectedRoute>
                  <PredictionHistory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/predictions/stats" 
              element={
                <ProtectedRoute>
                  <PredictionStats />
                </ProtectedRoute>
              } 
            />
            <Route path="/rikishi" element={<RikishiList />} />
            <Route path="/rikishi/:id" element={<RikishiDetail />} />
            <Route 
              path="/payment" 
              element={
                <ProtectedRoute>
                  <Payment />
                </ProtectedRoute>
              } 
            />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />
          </Routes>
        </Layout>
        <Toaster position="top-right" />
      </PaymentProvider>
    </AuthProvider>
  )
}

export default App 