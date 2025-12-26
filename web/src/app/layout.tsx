import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/MainLayout";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FreeWahala Ghana | Find Homes Directly from Owners",
  description: "Ghana's #1 no-broker rental platform. Connect directly with landlords, save on agent fees. Find verified apartments, houses, and rooms in Accra, Kumasi, and across Ghana.",
  keywords: "rent Ghana, no broker Ghana, FreeWahala, apartments Accra, houses for rent Ghana, landlord direct",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}


