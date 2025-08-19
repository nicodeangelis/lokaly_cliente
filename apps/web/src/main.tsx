import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Index from './routes/index'
import Dashboard from './routes/dashboard'
import Scan from './routes/scan'
import Staff from './routes/staff'
import ErrorBoundary from './components/ErrorBoundary'
import HomePage from './components/HomePage'

const router = createBrowserRouter([
  { path: '/', element: <HomePage />, errorElement: <ErrorBoundary /> },
  { path: '/l/:slug', element: <Index />, errorElement: <ErrorBoundary /> },
  { path: '/app/home', element: <Dashboard />, errorElement: <ErrorBoundary /> },
  { path: '/app/scan', element: <Scan />, errorElement: <ErrorBoundary /> },
  { path: '/staff', element: <Staff />, errorElement: <ErrorBoundary /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <HelmetProvider>
    <RouterProvider router={router} />
  </HelmetProvider>
)
