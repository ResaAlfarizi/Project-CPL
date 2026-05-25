import AccessMatrixContent from '@/components/superadmin/AccessMatrixContent';

export const metadata = {
  title: 'Matrix Hak Akses per Role | SUPERADMIN',
  description: 'Kelola dan pantau hak akses untuk setiap role dalam sistem',
};

export default function AccessMatrixPage() {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 72px - 64px)',
        backgroundColor: '#212121',
        padding: '32px',
        margin: '-32px',
        borderRadius: '16px',
      }}
    >
      <AccessMatrixContent />
    </div>
  );
}
