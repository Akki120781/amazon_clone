import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../context/CartContext";
import Header from "../components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Amazon Clone - Shop Electronics, Books, Fashion & More",
  description: "An outstanding Amazon clone featuring product search, filtering, category navigation, dynamic shopping cart sync, and transaction-safe checkout.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#eaeded] text-gray-900">
        <CartProvider>
          <Header />
          <main className="flex-grow flex flex-col w-full">
            {children}
          </main>
          {/* Footer */}
          <footer className="bg-[#232f3e] text-gray-300 text-xs py-8 mt-12 border-t border-gray-700">
            <div className="max-w-screen-xl mx-auto px-4 flex flex-col items-center justify-between gap-4 md:flex-row">
              <span className="font-bold text-white text-base">amazon.clone</span>
              <div className="flex flex-wrap justify-center gap-6">
                <a href="#" className="hover:underline">Conditions of Use</a>
                <a href="#" className="hover:underline">Privacy Notice</a>
                <a href="#" className="hover:underline">Consumer Health Data Privacy Disclosure</a>
                <a href="#" className="hover:underline">Your Ads Privacy Choices</a>
              </div>
              <p className="text-gray-400">© 2026, Amazon Clone. Built for Assessment purposes.</p>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}

