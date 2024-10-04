import express from "express";
import { createComment, DeleteComment } from "../Controllers/videoController";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/comment", createComment);
apiRouter.delete("/comments/:commentId([0-9a-f]{24})/delete", DeleteComment);

export default apiRouter;
