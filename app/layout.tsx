import "./globals.css";
import Nav from "../components/Nav";

export const metadata = {
  title: "Calingo Adult",
  description: "English learning web app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif" }}>
        <Nav />
        <div style={{ padding: "24px" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
