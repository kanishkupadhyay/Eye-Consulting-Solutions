import AppLayout from "@/common/frontend/AppLayout/AppLayout";
import "./globals.scss";
import { Manrope } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "600", "700"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.className} h-full antialiased`}>
      <body className="h-full">
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>

        <Toaster position="top-center" reverseOrder={false} />
      </body>
    </html>
  );
}