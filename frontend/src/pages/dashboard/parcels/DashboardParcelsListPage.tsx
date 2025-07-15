import React from "react";

export default function DashboardParcelsListPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">소포목록</h1>
        <p className="text-muted-foreground">
          등록된 모든 소포 정보를 목록으로 확인할 수 있습니다.
        </p>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">소포 목록</h2>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
            새 소포 등록
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">소포번호</th>
                <th className="text-left p-3 font-medium">상태</th>
                <th className="text-left p-3 font-medium">위치</th>
                <th className="text-left p-3 font-medium">입고일</th>
                <th className="text-left p-3 font-medium">수령인</th>
                <th className="text-left p-3 font-medium">작업</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  id: "PKG001",
                  status: "입고완료",
                  location: "A구역",
                  date: "2024-01-15",
                  recipient: "김철수",
                },
                {
                  id: "PKG002",
                  status: "검수중",
                  location: "검수구역",
                  date: "2024-01-15",
                  recipient: "이영희",
                },
                {
                  id: "PKG003",
                  status: "출고대기",
                  location: "B구역",
                  date: "2024-01-14",
                  recipient: "박민수",
                },
                {
                  id: "PKG004",
                  status: "배송중",
                  location: "배송구역",
                  date: "2024-01-14",
                  recipient: "최지영",
                },
                {
                  id: "PKG005",
                  status: "입고완료",
                  location: "A구역",
                  date: "2024-01-13",
                  recipient: "정수민",
                },
              ].map((parcel) => (
                <tr key={parcel.id} className="border-b hover:bg-muted/50">
                  <td className="p-3 font-medium">{parcel.id}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        parcel.status === "입고완료"
                          ? "bg-green-100 text-green-800"
                          : parcel.status === "검수중"
                          ? "bg-yellow-100 text-yellow-800"
                          : parcel.status === "출고대기"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {parcel.status}
                    </span>
                  </td>
                  <td className="p-3">{parcel.location}</td>
                  <td className="p-3">{parcel.date}</td>
                  <td className="p-3">{parcel.recipient}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button className="text-sm text-primary hover:underline">
                        상세보기
                      </button>
                      <button className="text-sm text-destructive hover:underline">
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
