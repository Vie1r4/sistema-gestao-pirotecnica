import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "./providers";
import ThemeSync from "./components/ThemeSync";
import GlobalToast from "./components/GlobalToast";
import AuthBootstrap from "./components/auth/AuthBootstrap";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PageTransition from "./components/PageTransition";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PIROFAFE — Sistema de Gestão Pirotécnica",
  description: "Sistema de gestão para empresa pirotécnica",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className={plusJakarta.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <QueryProvider>
          <AuthBootstrap>
          <ThemeSync />
          <GlobalToast />
          <ProtectedRoute>
            <PageTransition>{children}</PageTransition>
          </ProtectedRoute>
          </AuthBootstrap>
        </QueryProvider>
      </body>
    </html>
  );
}
