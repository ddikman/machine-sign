import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import './styles/layout.scss'
import { SignList } from './routes/SignList'
import { SignDetailWrapper } from './routes/SignDetail'
import { GitHubCallback } from './github-callback'
import './style.scss';
import { SignProvider } from './store/SignContext'

const router = createBrowserRouter([
    {
        path: "/",
        element: <SignList />,
    },
    {
        path: "/sign",
        element: <SignDetailWrapper />,
    },
    {
        path: "/sign/:id",
        element: <SignDetailWrapper />,
    },
    {
        path: "/github-callback",
        element: <GitHubCallback />,
    }
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <SignProvider>
            <RouterProvider router={router} />
        </SignProvider>
    </StrictMode>,
)
