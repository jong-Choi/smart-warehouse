# 프론트엔드 화면 구성 계획서

## 전체 사이트맵

```
/
├── dashboard/                    # 대시보드 메인
│   ├── home/                    # 대시보드 홈 (전체 통계)
│   ├── parcels/                 # 소포 관리
│   │   ├── list/               # 소포 목록
│   │   └── [id]/               # 소포 상세
│   ├── waybills/               # 운송장 관리
│   │   ├── list/               # 운송장 목록
│   │   └── [id]/               # 운송장 상세
│   ├── operators/              # 작업자 관리
│   │   ├── list/               # 작업자 목록
│   │   └── [id]/               # 작업자 상세
│   ├── locations/              # 배송지 관리
│       ├── list/               # 배송지 목록
│       └── [id]/               # 배송지 상세
└── factory/                    # 공장 관리 (기존)
```

## 대시보드 홈 (`/dashboard/home`)

### 화면 구성

- **UI 타입**: 대시보드 (카드 + 그래프)
- **API 호출**:
  - `GET /api/parcels/stats` - 소포 통계
  - `GET /api/waybills/stats` - 운송장 통계
  - `GET /api/operators/stats` - 작업자 통계
  - `GET /api/locations/stats` - 배송지 통계

### 표시 정보

1. **상단 카드 섹션**

   - 총 소포 수
   - 총 운송장 수
   - 총 작업자 수
   - 총 배송지 수

2. **그래프 섹션**
   - 소포 상태별 분포 (파이 차트)
   - 운송장 상태별 분포 (파이 차트)
   - 작업자별 처리량 (막대 그래프)
   - 일별 처리량 추이 (라인 그래프)

## 소포 관리

### 소포 목록 (`/dashboard/parcels/list`)

- **UI 타입**: 테이블 + 필터
- **API 호출**: `GET /api/parcels?status=&operatorId=&locationId=&waybillId=&isAccident=&startDate=&endDate=`
- **표시 정보**:
  - 소포 ID, 운송장 번호, 상태, 작업자, 배송지, 사고 여부, 생성일
  - 필터: 상태, 작업자, 배송지, 운송장, 사고 여부, 날짜 범위

### 소포 상세 (`/dashboard/parcels/[id]`)

- **UI 타입**: 상세 정보 카드
- **API 호출**: `GET /api/parcels/:id`
- **표시 정보**:
  - 소포 기본 정보
  - 관련 운송장 정보
  - 작업자 정보
  - 배송지 정보
  - 처리 이력

## 운송장 관리

### 운송장 목록 (`/dashboard/waybills/list`)

- **UI 타입**: 테이블 + 필터
- **API 호출**: `GET /api/waybills?status=&startDate=&endDate=`
- **표시 정보**:
  - 운송장 번호, 상태, 생성일, 소포 수
  - 필터: 상태, 날짜 범위

### 운송장 상세 (`/dashboard/waybills/[id]`)

- **UI 타입**: 상세 정보 카드
- **API 호출**: `GET /api/waybills/:id`
- **표시 정보**:
  - 운송장 기본 정보
  - 포함된 소포 목록
  - 처리 상태 이력

## 작업자 관리

### 작업자 목록 (`/dashboard/operators/list`)

- **UI 타입**: 테이블 + 필터
- **API 호출**: `GET /api/operators?type=&startDate=&endDate=`
- **표시 정보**:
  - 작업자 코드, 이름, 타입, 생성일
  - 필터: 타입, 날짜 범위

### 작업자 상세 (`/dashboard/operators/[id]`)

- **UI 타입**: 상세 정보 + 그래프
- **API 호출**:
  - `GET /api/operators/:id`
  - `GET /api/operators/:operatorId/shifts?startDate=&endDate=`
  - `GET /api/operators/:operatorId/works?startDate=&endDate=`
- **표시 정보**:
  - 작업자 기본 정보
  - 근무 기록 (테이블)
  - 작업 통계 (그래프)
  - 일별 처리량 (라인 그래프)

## 배송지 관리

### 배송지 목록 (`/dashboard/locations/list`)

- **UI 타입**: 테이블
- **API 호출**: `GET /api/locations`
- **표시 정보**:
  - 배송지 ID, 이름, 주소, 소포 수

### 배송지 상세 (`/dashboard/locations/[id]`)

- **UI 타입**: 상세 정보 + 그래프
- **API 호출**:
  - `GET /api/locations/:id`
  - `GET /api/locations/:locationId/parcels?limit=50`
  - `GET /api/locations/:locationId/works?startDate=&endDate=`
- **표시 정보**:
  - 배송지 기본 정보
  - 해당 배송지 소포 목록 (테이블)
  - 작업 통계 (그래프)
  - 일별 처리량 (라인 그래프)

## UI 컴포넌트 구성

### 공통 컴포넌트

1. **DashboardLayout** - 대시보드 레이아웃
2. **DataTable** - 데이터 테이블 (정렬, 필터링, 페이지네이션)
3. **StatsCard** - 통계 카드
4. **Chart** - 차트 컴포넌트 (파이, 막대, 라인)
5. **FilterPanel** - 필터 패널
6. **DetailCard** - 상세 정보 카드

### 차트 타입별 사용

- **파이 차트**: 상태별 분포 (소포, 운송장)
- **막대 그래프**: 작업자별 처리량, 배송지별 처리량
- **라인 그래프**: 시간별 추이 (일별, 주별, 월별)
- **테이블**: 목록 데이터, 상세 정보

## API 호출 패턴

### 데이터 로딩

```typescript
// 목록 데이터
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/endpoint", { params: filters });
      setData(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [filters]);
```

### 필터링

```typescript
// 필터 상태 관리
const [filters, setFilters] = useState({
  status: "",
  startDate: "",
  endDate: "",
  // 기타 필터들...
});

// 필터 변경 시 API 재호출
const handleFilterChange = (newFilters) => {
  setFilters(newFilters);
};
```
