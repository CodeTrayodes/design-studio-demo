import './globals.css';
import TopBar from '@/components/TopBar';

export const metadata = {
  title: 'LevelShift — Process Demo',
  description: 'AI-powered business process assessment demo',
};

const themeScript = `(function(){var t=localStorage.getItem('demo-theme')||'light';document.documentElement.setAttribute('data-theme',t);})()`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <TopBar />
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
