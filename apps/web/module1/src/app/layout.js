import './globals.css';

export const metadata = {
  title: 'CPL Management System – Modul 1',
  description: 'Sistem Pengelolaan Capaian Pembelajaran Lulusan – Setup Prodi & Kurikulum',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
