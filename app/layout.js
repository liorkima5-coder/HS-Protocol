export const metadata = {
  title: "ח.ש קהילה - יצירת סיכום פגישה",
  description: "מערכת דיגיטלית להפקת פרוטוקולים - חנן שלאין",
  icons: {
    icon: "/hs.jpg", // משתמש בלוגו שלך במקום הגלובוס של Next.js
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
