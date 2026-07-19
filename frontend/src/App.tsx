import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes/AppRouter';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}
