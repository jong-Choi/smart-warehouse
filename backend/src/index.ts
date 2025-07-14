import express from "express";
import cors from "cors";
import morgan from "morgan";
import "module-alias/register";
import todoRoutes from "@src/routes/todoRoutes";

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
app.use("/api/todos", todoRoutes);

// 헬스 체크
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Todo API is up and running",
    timestamp: new Date().toISOString(),
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
  console.log(`📝 API Documentation: http://localhost:${PORT}/api/todos`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});
