import "./globals.css";
import AuthProvider from "@/context/AuthProvider";


export const metadata = {
  title: "Locksmith",
  description: "Authentication System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <AuthProvider>{children}</AuthProvider>
    </html>
  );
}