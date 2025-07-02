import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import nftsRouter from "./routes/nfts";
import imagesRouter from "./routes/images";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(helmet());
app.use(morgan("tiny"));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.use("/nfts", nftsRouter);
app.use("/images", imagesRouter);

app.use(errorHandler);

export default app;