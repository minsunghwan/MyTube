import express from "express";
import { getEdit, postEdit } from "../Controllers/userController";
import { protectorMiddleware } from "../middlewares";

const userRouter = express.Router();

userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(postEdit);

export default userRouter;
