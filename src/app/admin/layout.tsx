import { ThemeProvider } from "@/components/ThemeProvider";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider storageKey="tema-admin" defaultTheme="light">
      {children}
    </ThemeProvider>
  );
}
