import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "택배 관리 시스템 API",
      version: "1.0.0",
      description:
        "택배 배송 과정을 관리하는 REST API입니다. 운송장, 작업자, 배송지 정보를 조회할 수 있습니다. 모든 목록 조회 API는 페이지네이션을 지원합니다.",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3050",
        description: "개발 서버",
      },
    ],
    components: {
      schemas: {
        // 공통 응답 형식
        ApiResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              description: "요청 성공 여부",
            },
            data: {
              description: "응답 데이터",
            },
            pagination: {
              $ref: "#/components/schemas/PaginationInfo",
            },
            message: {
              type: "string",
              description: "응답 메시지",
            },
          },
        },
        // 페이지네이션 정보 스키마
        PaginationInfo: {
          type: "object",
          properties: {
            page: {
              type: "integer",
              description: "현재 페이지 번호 (1부터 시작)",
              example: 1,
            },
            limit: {
              type: "integer",
              description: "페이지당 데이터 개수",
              example: 20,
            },
            total: {
              type: "integer",
              description: "전체 데이터 개수",
              example: 150,
            },
            totalPages: {
              type: "integer",
              description: "전체 페이지 개수",
              example: 8,
            },
          },
        },
        // 소포 관련 스키마 (물건 정보만)
        Parcel: {
          type: "object",
          properties: {
            id: { type: "integer" },
            waybillId: { type: "integer" },
            declaredValue: { type: "integer", description: "물건 가격" },
            waybill: { $ref: "#/components/schemas/Waybill" },
          },
        },
        // 운송장 관련 스키마 (처리 정보 통합)
        Waybill: {
          type: "object",
          properties: {
            id: { type: "integer" },
            number: { type: "string", description: "운송장 번호" },
            unloadDate: {
              type: "string",
              format: "date",
              description: "하차 예정일",
            },
            operatorId: {
              type: "integer",
              nullable: true,
              description: "처리한 작업자/기계 ID",
            },
            locationId: { type: "integer", description: "배송지 ID" },
            status: {
              type: "string",
              enum: ["PENDING_UNLOAD", "UNLOADED", "NORMAL", "ACCIDENT"],
              description: "처리 상태",
            },
            processedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "처리 일시",
            },
            isAccident: { type: "boolean", description: "사고 여부" },
            operator: { $ref: "#/components/schemas/Operator" },
            location: { $ref: "#/components/schemas/Location" },
            parcel: { $ref: "#/components/schemas/Parcel" },
          },
        },
        // 작업자 관련 스키마
        Operator: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            code: { type: "string" },
            type: {
              type: "string",
              enum: ["HUMAN", "MACHINE"],
            },
            createdAt: { type: "string", format: "date-time" },
            _count: {
              type: "object",
              properties: {
                shifts: { type: "integer" },
                works: { type: "integer" },
                waybills: { type: "integer" },
              },
            },
          },
        },
        // 배송지 관련 스키마
        Location: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            address: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            _count: {
              type: "object",
              properties: {
                waybills: { type: "integer" },
                operatorWorks: { type: "integer" },
              },
            },
          },
        },
        // 근무 기록 스키마
        OperatorShift: {
          type: "object",
          properties: {
            id: { type: "integer" },
            operatorId: { type: "integer" },
            date: {
              type: "string",
              format: "date",
              description: "근무 날짜 (하루 단위)",
            },
            startTime: {
              type: "string",
              format: "date-time",
              description: "해당 날의 근무 시작 시간",
            },
            endTime: {
              type: "string",
              format: "date-time",
              description: "해당 날의 근무 종료 시간",
            },
            operator: { $ref: "#/components/schemas/Operator" },
          },
        },
        // 작업 통계 스키마
        OperatorWork: {
          type: "object",
          properties: {
            id: { type: "integer" },
            operatorId: { type: "integer" },
            date: {
              type: "string",
              format: "date",
              description: "작업 날짜 (하루 단위)",
            },
            locationId: { type: "integer" },
            processedCount: {
              type: "integer",
              description: "처리한 운송장 수",
            },
            accidentCount: {
              type: "integer",
              description: "사고 처리 건수",
            },
            revenue: {
              type: "integer",
              description: "발생 매출 (정산 기준 단가 × 수량)",
            },
            errorCount: {
              type: "integer",
              description: "기타 오류 수",
            },
            createdAt: { type: "string", format: "date-time" },
            operator: { $ref: "#/components/schemas/Operator" },
            location: { $ref: "#/components/schemas/Location" },
          },
        },
        // 배송지 통계 스키마
        LocationStats: {
          type: "object",
          properties: {
            total: {
              type: "integer",
              description: "전체 배송지 개수",
            },
            locations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  name: { type: "string" },
                  address: { type: "string", nullable: true },
                  waybillCount: { type: "integer" },
                  workCount: { type: "integer" },
                  pendingUnloadCount: {
                    type: "integer",
                    description: "하차 예정 수량",
                  },
                  totalProcessedCount: {
                    type: "integer",
                    description: "전체 처리 개수",
                  },
                  accidentCount: {
                    type: "integer",
                    description: "사고 건수",
                  },
                  totalRevenue: {
                    type: "integer",
                    description: "처리 금액",
                  },
                  accidentAmount: {
                    type: "integer",
                    description: "사고 금액",
                  },
                },
              },
            },
          },
        },
        // 작업자 통계 스키마
        OperatorStats: {
          type: "object",
          properties: {
            total: {
              type: "integer",
              description: "전체 작업자 개수",
            },
            byType: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    enum: ["HUMAN", "MACHINE"],
                  },
                  count: { type: "integer" },
                },
              },
            },
            operators: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  name: { type: "string" },
                  code: { type: "string" },
                  type: {
                    type: "string",
                    enum: ["HUMAN", "MACHINE"],
                  },
                  totalProcessedCount: {
                    type: "integer",
                    description: "총 처리한 운송장 수",
                  },
                  accidentCount: {
                    type: "integer",
                    description: "사고 처리 건수",
                  },
                  totalRevenue: {
                    type: "integer",
                    description: "총 처리 금액",
                  },
                  accidentAmount: {
                    type: "integer",
                    description: "사고 금액",
                  },
                  averageDailyProcessed: {
                    type: "integer",
                    description: "일평균 처리량",
                  },
                },
              },
            },
          },
        },
        // 작업자 통계 요약 스키마
        OperatorsStats: {
          type: "object",
          properties: {
            operatorId: {
              type: "integer",
              description: "작업자 ID",
            },
            code: {
              type: "string",
              description: "작업자 코드",
            },
            name: {
              type: "string",
              description: "작업자 이름",
            },
            type: {
              type: "string",
              enum: ["HUMAN", "MACHINE"],
              description: "작업자 타입",
            },
            workDays: {
              type: "integer",
              description: "작업일수",
            },
            normalCount: {
              type: "integer",
              description: "정상처리 갯수",
            },
            accidentCount: {
              type: "integer",
              description: "사고처리 갯수",
            },
            firstWorkDate: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "최초 작업일",
            },
            operator: {
              $ref: "#/components/schemas/Operator",
            },
          },
        },
      },
      parameters: {
        // 공통 파라미터
        ParcelId: {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
          description: "소포 ID",
        },
        WaybillId: {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
          description: "운송장 ID",
        },
        OperatorId: {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
          description: "작업자 ID",
        },
        LocationId: {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
          description: "배송지 ID",
        },
        // 쿼리 파라미터
        WaybillStatus: {
          name: "status",
          in: "query",
          schema: {
            type: "string",
            enum: ["PENDING_UNLOAD", "UNLOADED", "NORMAL", "ACCIDENT"],
          },
          description: "운송장 상태 필터",
        },
        OperatorType: {
          name: "type",
          in: "query",
          schema: {
            type: "string",
            enum: ["HUMAN", "MACHINE"],
          },
          description: "작업자 유형 필터",
        },
        IsAccident: {
          name: "isAccident",
          in: "query",
          schema: { type: "boolean" },
          description: "사고 여부 필터",
        },
        StartDate: {
          name: "startDate",
          in: "query",
          schema: { type: "string", format: "date" },
          description: "시작일 (YYYY-MM-DD)",
        },
        EndDate: {
          name: "endDate",
          in: "query",
          schema: { type: "string", format: "date" },
          description: "종료일 (YYYY-MM-DD)",
        },
        // 페이지네이션 파라미터
        Page: {
          name: "page",
          in: "query",
          schema: {
            type: "integer",
            minimum: 1,
            default: 1,
          },
          description: "페이지 번호 (1부터 시작)",
        },
        Limit: {
          name: "limit",
          in: "query",
          schema: {
            type: "integer",
            minimum: 1,
            maximum: 100,
            default: 20,
          },
          description: "페이지당 데이터 개수 (최대 100개)",
        },
        GetAll: {
          name: "getAll",
          in: "query",
          schema: {
            type: "boolean",
            default: false,
          },
          description: "전체 데이터 조회 여부 (true일 때 페이지네이션 무시)",
        },
      },
    },
    tags: [
      {
        name: "운송장 (Waybills)",
        description: "운송장 관련 API",
      },
      {
        name: "작업자 (Operators)",
        description: "작업자 관련 API",
      },
      {
        name: "배송지 (Locations)",
        description: "배송지 관련 API",
      },
      {
        name: "Sales",
        description: "매출 관련 API",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"], // API 라우트 파일들
};

export const specs = swaggerJsdoc(options);
