import express from "express";
import dotenv from "dotenv";

const app = express();
dotenv.config();

const PORT: number = parseInt(process.env.PORT || "3000", 10);

app.listen(PORT, () => {
  console.log("Server listening on port:", PORT);
});
