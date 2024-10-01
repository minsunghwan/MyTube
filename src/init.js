import "dotenv/config";
import app from "./server";
import "./db";

const PORT = 8080;

const handleListening = () => {
  console.log(`✅ Server Listening on port http://localhost:${PORT} ❤️`);
};

app.listen(PORT, handleListening);
