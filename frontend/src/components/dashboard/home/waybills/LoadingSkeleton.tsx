export const LoadingSkeleton = () => (
  <div className="space-y-6 px-6">
    {/* 헤더 영역 */}
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-80 animate-pulse"></div>
      </div>
    </div>

    {/* 메인 컨테이너 */}
    <div className="bg-card rounded-lg border">
      <div className="p-6">
        {/* 컨테이너 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="flex items-center gap-2">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
        </div>

        {/* 필터 영역 */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
            <div className="h-9 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </div>

        {/* 테이블 영역 */}
        <div className="rounded-md border">
          {/* 테이블 헤더 */}
          <div className="border-b bg-gray-50">
            <div className="grid grid-cols-4 gap-4 p-3">
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
            </div>
          </div>

          {/* 테이블 바디 */}
          <div className="divide-y">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4 p-3">
                {/* 지역명 */}
                <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                {/* 주소 */}
                <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
                {/* 총 운송장 수 */}
                <div className="h-6 bg-gray-200 rounded w-12 animate-pulse"></div>
                {/* 상태별 분포 */}
                <div className="flex flex-wrap gap-1 justify-center">
                  <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-18 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);
