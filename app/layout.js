// app/layout.js
import './globals.css';
import Header from '../components/Header';

export const metadata = {
  title: 'NoteHarbor',
  description: 'Multi-tenant Notes SaaS on Vercel with Prisma + Postgres',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="container py-10">
          <Header appName="NoteHarbor" />
          {children}
        </div>
      </body>
    </html>
  );
}
