import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from './lib/context/AuthContext';
import { TripProvider } from './lib/context/TripContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

export const metadata: Metadata = {
  title: "GlobeTrotter - Travel Planning Made Easy",
  description: "Plan your perfect trip with GlobeTrotter - a comprehensive travel planning platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-gray-50">
        <AuthProvider>
          <TripProvider>
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </TripProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
