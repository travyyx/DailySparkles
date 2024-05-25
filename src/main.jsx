import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import HomePage from './pages/HomePage.jsx'
import ErrorPage  from './ErrorPage.jsx'
import SearchPage  from './pages/Search.jsx'
import ThoughtsPage from './pages/Thoughts.jsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import UserPage from './pages/UserThoughts.jsx'
import UserThoughtsPage from './pages/UserThoughtsPage.jsx'
import UserThought from './pages/UserThought.jsx'


const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>,
    errorElement: <ErrorPage/>
  },
  {
    path: '/home',
    element: <HomePage/>
  },
  {
    path: '/search',
    element: <SearchPage/>
  },
  {
    path: '/thoughts',
    element: <ThoughtsPage/>
  },
  {
    path: '/:id',
    element: <UserPage/>
  },
  {
    path: '/:id/thoughts',
    element: <UserThoughtsPage/>
  },
  {
    path: '/thought/:id',
    element: <UserThought/>
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>,
)
