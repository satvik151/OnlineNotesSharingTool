import './globals.css';
import React from 'react';
import ThemeRegistry from '../components/ThemeRegistry';
import ClientAppBar from '../components/ClientAppBar';
import Container from '@mui/material/Container';

export const metadata = {
  title: 'Online Notes Sharing',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <ClientAppBar />
          <Container maxWidth="lg" sx={{ mt: 4 }}>
            {children}
          </Container>
        </ThemeRegistry>
      </body>
    </html>
  );
}