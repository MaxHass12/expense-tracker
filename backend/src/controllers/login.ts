import express, { Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import catchError from "../utils/catchError";
import userHelpers from "./routesHelpers/usersHelpers";
import { HydratedDocument } from "mongoose";
import { IUser, RequestWithUserId } from "../types";
import config from "../utils/config";

const loginRouter = express.Router();

loginRouter.post(
  "/",
  catchError(async (req: RequestWithUserId, res: Response) => {
    const { username, password } = userHelpers.parseCreateUserData(req.body);

    const user: HydratedDocument<IUser> = await userHelpers.findUserByName(
      username
    );

    const passwordCorrect: Boolean =
      user === null ? false : await bcrypt.compare(password, user.passwordHash);

    if (!(user && passwordCorrect)) {
      return res.status(401).json({
        error: "invalid username or password",
      });
    }

    // Henceforth, username and password are valid

    if (user.username === "guest") {
      await userHelpers.clearGuestUserData();
    }

    const userForToken = {
      username: user.username,
      id: user._id,
    };

    const token = jwt.sign(userForToken, config.SECRET as string);

    return res.status(200).send({ token, username: user.username });
  })
);

export default loginRouter;
