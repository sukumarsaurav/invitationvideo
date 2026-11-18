import { createBrowserRouter, Outlet, RouterProvider, ScrollRestoration } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { InstallPrompt } from '@/components/InstallPrompt';
import { ToastProvider } from '@/components/Toast';
import { AuthProvider } from '@/lib/auth';
import { I18nProvider } from '@/lib/i18n';
import { AccountPage } from '@/pages/AccountPage';
import { EditorPage } from '@/pages/EditorPage';
import { HelpPage } from '@/pages/HelpPage';
import { HomePage } from '@/pages/HomePage';
import { MyVideosPage } from '@/pages/MyVideosPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { RenderPage } from '@/pages/RenderPage';
import { SharedPreviewPage } from '@/pages/SharedPreviewPage';
import { TagPage } from '@/pages/TagPage';
import { TemplateDetailPage } from '@/pages/TemplateDetailPage';
import { TemplatesPage } from '@/pages/TemplatesPage';

/** Route metadata read by AppShell. */
export type RouteHandle = { detailScreen?: boolean };

/** Every page starts at the top; Back restores the previous position. */
const Root = () => (
  <>
    <ScrollRestoration />
    <Outlet />
    <InstallPrompt />
  </>
);

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/templates', element: <TemplatesPage /> },
          { path: '/invitations/:category', element: <TemplatesPage /> },
          { path: '/tags/:tag', element: <TagPage /> },
          // Pushed screen on phones: own back bar, no bottom tabs.
          { path: '/t/:slug', element: <TemplateDetailPage />, handle: { detailScreen: true } satisfies RouteHandle },
          { path: '/my-videos', element: <MyVideosPage /> },
          { path: '/account', element: <AccountPage /> },
          { path: '/help', element: <HelpPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
      // Full-screen flows: no tab bar, like a native app's modal screens.
      { path: '/editor/new/:slug', element: <EditorPage /> },
      { path: '/editor/:draftId', element: <EditorPage /> },
      { path: '/render/:draftId', element: <RenderPage /> },
      // Public, view-only preview that customers send to family.
      { path: '/p/:token', element: <SharedPreviewPage /> },
    ],
  },
]);

export const App = () => (
  <I18nProvider>
    <ToastProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ToastProvider>
  </I18nProvider>
);
