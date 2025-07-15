import express from "express";
import cors from "cors";
import morgan from "morgan";
import "module-alias/register";
import parcelRoutes from "@src/routes/parcelRoutes";
import waybillRoutes from "@src/routes/waybillRoutes";
import operatorRoutes from "@src/routes/operatorRoutes";
import locationRoutes from "@src/routes/locationRoutes";

const app = express();
const PORT = process.env.PORT || 4000;

// 미들웨어
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// 라우트
app.use("/api/parcels", parcelRoutes);
app.use("/api/waybills", waybillRoutes);
app.use("/api/operators", operatorRoutes);
app.use("/api/locations", locationRoutes);

// 헬스 체크
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 택배 관리 시스템 API가 정상적으로 실행 중입니다",
    timestamp: new Date().toISOString(),
    endpoints: {
      parcels: "/api/parcels",
      waybills: "/api/waybills",
      operators: "/api/operators",
      locations: "/api/locations",
    },
  });
});

// 404 핸들러
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// 글로벌 에러 핸들러
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", error);

    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Parcels API: http://localhost:${PORT}/api/parcels`);
  console.log(`📋 Waybills API: http://localhost:${PORT}/api/waybills`);
  console.log(`👷 Operators API: http://localhost:${PORT}/api/operators`);
  console.log(`📍 Locations API: http://localhost:${PORT}/api/locations`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});
