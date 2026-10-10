import type { Metadata } from "next";
import "@fontsource/vazirmatn/400.css";
import "@fontsource/vazirmatn/500.css";
import "@fontsource/vazirmatn/600.css";
import "@fontsource/vazirmatn/700.css";
import "@fontsource/vazirmatn/800.css";
import "./globals.css";
export const metadata: Metadata = {
  title: "سایپا | داشبورد هوش تجاری کنترل کیفیت",
  description:
    "نمونه نمایشی هوش تجاری کنترل کیفیت خودرو با داده‌های آزمایشی؛ کیفیت خطوط، عیوب، تأمین‌کنندگان و هزینه کیفیت.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
