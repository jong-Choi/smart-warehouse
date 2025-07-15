import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "택배 관리 시스템 API",
      version: "1.0.0",
      description:
        "택배 배송 과정을 관리하는 REST API입니다. 소포, 운송장, 작업자, 배송지 정보를 조회할 수 있습니다.",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: "http://localhost:4000",
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
            count: {
              type: "integer",
              description: "데이터 개수",
            },
            message: {
              type: "string",
              description: "응답 메시지",
            },
          },
        },
        // 소포 관련 스키마
        Parcel: {
          type: "object",
          properties: {
            id: { type: "integer" },
            waybillId: { type: "integer" },
            operatorId: { type: "integer", nullable: true },
            locationId: { type: "integer" },
            status: {
              type: "string",
              enum: ["PENDING_UNLOAD", "UNLOADED", "NORMAL", "ACCIDENT"],
            },
            declaredValue: { type: "integer" },
            processedAt: { type: "string", format: "date-time" },
            isAccident: { type: "boolean" },
            operator: { $ref: "#/components/schemas/Operator" },
            location: { $ref: "#/components/schemas/Location" },
            waybill: { $ref: "#/components/schemas/Waybill" },
          },
        },
        // 운송장 관련 스키마
        Waybill: {
          type: "object",
          properties: {
            id: { type: "integer" },
            number: { type: "string" },
            status: {
              type: "string",
              enum: ["IN_TRANSIT", "DELIVERED", "RETURNED", "ERROR"],
            },
            shippedAt: { type: "string", format: "date-time" },
            deliveredAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            parcels: {
              type: "array",
              items: { $ref: "#/components/schemas/Parcel" },
            },
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
                parcels: { type: "integer" },
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
                parcels: { type: "integer" },
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
              description: "처리한 소포 수",
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
        ParcelStatus: {
          name: "status",
          in: "query",
          schema: {
            type: "string",
            enum: ["PENDING_UNLOAD", "UNLOADED", "NORMAL", "ACCIDENT"],
          },
          description: "소포 상태 필터",
        },
        WaybillStatus: {
          name: "status",
          in: "query",
          schema: {
            type: "string",
            enum: ["IN_TRANSIT", "DELIVERED", "RETURNED", "ERROR"],
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
        Limit: {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 50 },
          description: "조회할 데이터 수",
        },
      },
    },
    tags: [
      {
        name: "소포 (Parcels)",
        description: "소포 관련 API",
      },
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
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"], // API 라우트 파일들
};

export const specs = swaggerJsdoc(options);
