import type { Metadata } from "next";
import { Poppins,Roboto } from "next/font/google";
import "./globals.css";
import { UserAuthContextProvider } from "@/contexts/user-auth-context";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100","200","300","400","500","600","700","800","900"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "700"],
});



export const metadata: Metadata = {
  title: "Tarkshakti",
  description: "Practice Aptitude Daily",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${poppins.variable} ${roboto.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <UserAuthContextProvider>
          {children}
        </UserAuthContextProvider>
      </body>
    </html>
  );
}
