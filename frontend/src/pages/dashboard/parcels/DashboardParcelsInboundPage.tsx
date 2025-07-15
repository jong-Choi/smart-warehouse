import React from "react";

export default function DashboardParcelsInboundPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">입고 관리</h1>
        <p className="text-muted-foreground">
          소포 입고 프로세스를 관리할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">입고 대기 목록</h2>
          <div className="space-y-4">
            {[
              {
                id: "PKG006",
                recipient: "김철수",
                phone: "010-1234-5678",
                status: "대기중",
              },
              {
                id: "PKG007",
                recipient: "이영희",
                phone: "010-2345-6789",
                status: "대기중",
              },
              {
                id: "PKG008",
                recipient: "박민수",
                phone: "010-3456-7890",
                status: "처리중",
              },
            ].map((parcel) => (
              <div
                key={parcel.id}
                className="flex items-center justify-between p-4 bg-background rounded-lg border"
              >
                <div>
                  <p className="font-medium">{parcel.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {parcel.recipient} • {parcel.phone}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      parcel.status === "대기중"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {parcel.status}
                  </span>
                  <button className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm hover:bg-primary/90">
                    입고처리
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">오늘 입고 현황</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">완료</p>
                <p className="text-2xl font-bold text-green-700">23</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-600">대기</p>
                <p className="text-2xl font-bold text-yellow-700">8</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">최근 입고</h3>
              {[
                { time: "14:30", id: "PKG005", recipient: "정수민" },
                { time: "14:15", id: "PKG004", recipient: "최지영" },
                { time: "14:00", id: "PKG003", recipient: "박민수" },
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
                  <span className="text-sm text-muted-foreground">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-card rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">빠른 입고 등록</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">수령인</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              placeholder="수령인 이름"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">연락처</label>
            <input
              type="tel"
              className="w-full p-2 border rounded-md"
              placeholder="010-0000-0000"
            />
          </div>
          <div className="flex items-end">
            <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
              등록
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
