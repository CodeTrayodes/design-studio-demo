import './globals.css';
import { ThemeProvider } from '@/lib/theme';
import Header from '@/components/layout/Header';

export const metadata = {
  title: 'ShiftAI - Process Intelligence',
  description: 'AI-powered business process discovery & automation agent deployment',
};

const themeScript = `(function(){
  var t = localStorage.getItem('ls-theme') || localStorage.getItem('demo-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', t);
})()`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500;700&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeProvider>
          <Header />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
