export default function DashboardLocationListPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">위치목록</h1>
        <p className="text-muted-foreground">
          등록된 모든 위치 정보를 목록으로 확인할 수 있습니다.
        </p>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">위치 목록</h2>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
            새 위치 추가
          </button>
        </div>

        <div className="space-y-4">
          {/* 임시 데이터 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                id: 1,
                name: "A구역",
                description: "입고 구역",
                status: "활성",
              },
              {
                id: 2,
                name: "B구역",
                description: "출고 구역",
                status: "활성",
              },
              {
                id: 3,
                name: "C구역",
                description: "보관 구역",
                status: "비활성",
              },
              {
                id: 4,
                name: "D구역",
                description: "검수 구역",
                status: "활성",
              },
              {
                id: 5,
                name: "E구역",
                description: "배송 구역",
                status: "활성",
              },
              {
                id: 6,
                name: "F구역",
                description: "반품 구역",
                status: "비활성",
              },
            ].map((location) => (
              <div
                key={location.id}
                className="bg-background border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{location.name}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      location.status === "활성"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {location.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {location.description}
                </p>
                <div className="flex gap-2">
                  <button className="text-sm text-primary hover:underline">
                    수정
                  </button>
                  <button className="text-sm text-destructive hover:underline">
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
