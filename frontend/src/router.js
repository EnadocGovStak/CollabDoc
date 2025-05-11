import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import DocumentListPage from './pages/DocumentListPage';
import DocumentEditorPage from './pages/DocumentEditorPage';
import TemplatesListPage from './pages/TemplatesListPage';
import TemplateEditorPage from './pages/TemplateEditorPage';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                path: '/',
                element: <DocumentListPage />,
            },
            {
                path: '/documents',
                element: <DocumentListPage />,
            },
            {
                path: '/editor',
                element: <DocumentEditorPage />,
            },
            {
                path: '/editor/:id',
                element: <DocumentEditorPage />,
            },
            {
                path: '/templates',
                element: <TemplatesListPage />,
            },
            {
                path: '/templates/new',
                element: <TemplateEditorPage />,
            },
            {
                path: '/templates/:id',
                element: <TemplateEditorPage />,
            },
        ],
    },
], {
    future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true
    }
});

export default router; 