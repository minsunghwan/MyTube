import express from "express";
import { home, logout } from "../Controllers/rootController";
import {
  getLogin,
  postLogin,
  getJoin,
  postJoin,
} from "../Controllers/userController";
import { publicOnlyMiddleware, protectorMiddleware } from "../middlewares";

const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter
  .route("/login")
  .all(publicOnlyMiddleware)
  .get(getLogin)
  .post(postLogin);
rootRouter.route("/join").all(publicOnlyMiddleware).get(getJoin).post(postJoin);

rootRouter.get("/logout", protectorMiddleware, logout);

export default rootRouter;
