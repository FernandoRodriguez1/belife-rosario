import Header from '../components/Header';
import fondoNormal from '../assets/fondoNormal.png';

function AdminLayout({ children }) {
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 z-0 bg-brand-500">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-85"
          style={{ backgroundImage: `url(${fondoNormal})` }}
        />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col items-center">
        <div className="w-full">
          <Header />
        </div>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white/90 p-6 shadow-sm backdrop-blur-sm sm:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;