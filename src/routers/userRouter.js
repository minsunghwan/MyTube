import express from "express";
import {
  getEdit,
  postEdit,
  startGithubLogin,
  finishGithubLogin,
  getChangePassword,
  postChangePassword,
} from "../Controllers/userController";
import { protectorMiddleware, avatarUpload } from "../middlewares";

const userRouter = express.Router();

userRouter
  .route("/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(avatarUpload.single("avatar"), postEdit);

userRouter.get("/github/start", protectorMiddleware, startGithubLogin);
userRouter.get("/github/finish", protectorMiddleware, finishGithubLogin);

userRouter
  .route("/change-password")
  .all(protectorMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);

export default userRouter;
