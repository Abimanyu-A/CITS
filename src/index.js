import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from 'cookie-parser';
import colors from 'colors';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';

const app = express()

dotenv.config({
    path: "./.env"
})

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

app.use(cookieParser());

// Prevent XSS attacks
app.use(xss());

app.set("trust proxy", 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Sanitize data
app.use(mongoSanitize());


app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}))

// connect DB

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 5000, ()=>{
        console.log(`Server is listening on port ${process.env.PORT}`.yellow.bold);
    })
})
.catch((error)=>{
    console.log("MongoDB connection failed: ", error);
})

// routes import
import authRouter from "./routes/authRoutes.js";
import deptRouter from "./routes/deptRoutes.js";
import empRouter from "./routes/empRoutes.js";
import clientRouter from "./routes/clientRoutes.js";
import teamRouter from "./routes/teamRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";

// routes declaration
app.use("/api/auth",authRouter);
app.use("/api/dept",deptRouter);
app.use("/api/emp",empRouter);
app.use("/api/client",clientRouter);
app.use("/api/team",teamRouter);
app.use("/api/review",reviewRouter);