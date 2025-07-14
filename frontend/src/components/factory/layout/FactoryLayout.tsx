import { Outlet } from "react-router-dom";

function FactoryLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Factory Management
            </h1>
            <nav className="flex space-x-4">
              <a href="/factory" className="text-gray-600 hover:text-gray-900">
                Factory
              </a>
              <a
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </a>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default FactoryLayout;
