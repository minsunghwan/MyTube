import "dotenv/config";
import app from "./server";
import "./models/Comment";
import "./models/User";
import "./models/Video";
import "./db";

const PORT = 3000;

const handleListening = () => {
  console.log(`✅ Server Listening on port http://localhost:${PORT} ❤️`);
};

app.listen(PORT, handleListening);
