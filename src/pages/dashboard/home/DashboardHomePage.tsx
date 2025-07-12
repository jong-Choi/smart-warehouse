function DashboardHomePage() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Home</h1>
      <p className="text-gray-600">
        Welcome to your dashboard home page. Here you can see an overview of
        your data.
      </p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900">Total Items</h3>
          <p className="text-2xl font-bold text-blue-700">1,234</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-900">Active Orders</h3>
          <p className="text-2xl font-bold text-green-700">56</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-900">Revenue</h3>
          <p className="text-2xl font-bold text-purple-700">$12,345</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardHomePage;
