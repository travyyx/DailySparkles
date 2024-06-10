import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import UserPage from './pages/ProfilePage.jsx'
import ErrorPage  from './ErrorPage.jsx'
import SearchPage  from './pages/Search.jsx'
import ThoughtsPage from './pages/YourThoughts.jsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import UserThoughts from './pages/UserProfile.jsx'
import UserThoughtsPage from './pages/UserThoughts.jsx'
import UserThought from './pages/ThoughtView.jsx'
import HomePage from './pages/HomePage.jsx'
import TopicPage from './pages/TopicsPage.jsx'


const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>,
    errorElement: <ErrorPage/>
  },
  {
    path: '/profile',
    element: <UserPage/>
  },
  {
    path: '/search',
    element: <SearchPage/>
  },
  {
    path: '/sparkles',
    element: <ThoughtsPage/>
  },
  {
    path: '/:id',
    element: <UserThoughts/>
  },
  {
    path: '/:id/sparkles',
    element: <UserThoughtsPage/>
  },
  {
    path: '/sparkle/:id',
    element: <UserThought/>
  },
  {
    path: '/home',
    element: <HomePage/>
  },
  {
    path: '/topic/:name',
    element: <TopicPage/>
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
)
