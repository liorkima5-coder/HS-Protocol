import "./globals.css"; // <--- וודא שהשורה הזו קיימת! היא אחראית על כל ה-Tailwind

export const metadata = {
  title: "ח.ש קהילה - יצירת סיכום פגישה",
  description: "מערכת דיגיטלית להפקת פרוטוקולים - חנן שלאין",
  icons: {
    icon: "/hs.jpg", 
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      {/* אל תוסיף כאן קלאסים חדשים ל-body אם היו לך קודם */}
      <body className="antialiased"> 
        {children}
      </body>
    </html>
  );
}
