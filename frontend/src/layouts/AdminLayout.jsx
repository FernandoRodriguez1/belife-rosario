import Header from '../components/Header';

function AdminLayout({ children }) {
  return (
    <div className="relative min-h-screen">
      {/* Fondo sobrio del panel: mismo rojo de marca (brand-500) pero mucho más
          tenue — brand-200 (#ffcfc8), rosa pálido, sólido y sin patrón. El login
          conserva su patrón de logo (LoginPage.jsx), acá solo el admin. */}
      <div className="fixed inset-0 z-0 bg-brand-200" />
      <div className="relative z-10 flex min-h-screen flex-col items-center">
        <div className="w-full">
          <Header />
        </div>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="relative rounded-2xl bg-white/90 p-5 shadow-sm backdrop-blur-sm sm:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;