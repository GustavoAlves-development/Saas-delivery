import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Delivery",
  description: "Sistema de pedidos",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Anti-flash: aplica .dark antes do React hidratar.
          Admin usa chave "tema-admin" (padrão: segue sistema).
          Loja usa chave "tema-loja" (padrão: claro).
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{
  var isAdmin=window.location.pathname.startsWith('/admin');
  var key=isAdmin?'tema-admin':'tema-loja';
  var t=localStorage.getItem(key);
  var sysDark=isAdmin&&window.matchMedia('(prefers-color-scheme: dark)').matches;
  if(t==='dark'||(t===null&&sysDark)){document.documentElement.classList.add('dark');}
}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {/* Loja usa tema-loja (padrão claro). Admin sobrescreve com seu próprio ThemeProvider. */}
        <ThemeProvider storageKey="tema-loja" defaultTheme="light">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
