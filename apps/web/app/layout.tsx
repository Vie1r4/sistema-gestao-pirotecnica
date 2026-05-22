import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { connection } from "next/server";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection();

  return (
    <html lang="pt" className={plusJakarta.variable} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="font-sans antialiased" suppressHydrationWarning>
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
