import React from "react";

export default function DashboardParcelsOutboundPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">출고 관리</h1>
        <p className="text-muted-foreground">
          소포 출고 프로세스를 관리할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">출고 대기 목록</h2>
          <div className="space-y-4">
            {[
              {
                id: "PKG001",
                recipient: "김철수",
                location: "A구역",
                status: "출고대기",
              },
              {
                id: "PKG003",
                recipient: "박민수",
                location: "B구역",
                status: "출고대기",
              },
              {
                id: "PKG005",
                recipient: "정수민",
                location: "A구역",
                status: "검수완료",
              },
            ].map((parcel) => (
              <div
                key={parcel.id}
                className="flex items-center justify-between p-4 bg-background rounded-lg border"
              >
                <div>
                  <p className="font-medium">{parcel.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {parcel.recipient} • {parcel.location}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      parcel.status === "출고대기"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {parcel.status}
                  </span>
                  <button className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm hover:bg-primary/90">
                    출고처리
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">오늘 출고 현황</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">완료</p>
                <p className="text-2xl font-bold text-green-700">15</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">대기</p>
                <p className="text-2xl font-bold text-blue-700">12</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">최근 출고</h3>
              {[
                {
                  time: "15:30",
                  id: "PKG004",
                  recipient: "최지영",
                  status: "배송중",
                },
                {
                  time: "15:15",
                  id: "PKG002",
                  recipient: "이영희",
                  status: "배송중",
                },
                {
                  time: "15:00",
                  id: "PKG001",
                  recipient: "김철수",
                  status: "배송중",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-background rounded-lg"
                >
                  <div>
                    <p className="font-medium">{item.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.recipient}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {item.time}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-card rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">배송사 관리</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">배송사</label>
            <select className="w-full p-2 border rounded-md">
              <option>택배사 선택</option>
              <option>한진택배</option>
              <option>CJ대한통운</option>
              <option>로젠택배</option>
              <option>우체국택배</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">운송장번호</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              placeholder="운송장번호 입력"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">배송일</label>
            <input type="date" className="w-full p-2 border rounded-md" />
          </div>
          <div className="flex items-end">
            <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
              배송 등록
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
