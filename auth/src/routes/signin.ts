import express from "express";
import { body } from "express-validator";
import { BadRequestError, validateRequest } from "@nesoticks/common";
import { IUserDoc, User } from "../models/user";
import { Password } from "../services/password";
import jwt from "jsonwebtoken";
const router = express.Router();

router.post(
    "/api/users/signin",
    [
        body("email").isEmail().withMessage("Email must be valid"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("You must enter a password"),
    ],
    validateRequest,
    async (req: express.Request, res: express.Response) => {
        const { email, password } = req.body;
        const user = await User.findOne<IUserDoc>({ email });

        if (!user) {
            throw new BadRequestError("Invalid credentials");
        }

        const passwordsMatch = await Password.compare(user.password, password);
        if (!passwordsMatch) {
            throw new BadRequestError("Invalid credentials");
        }

        const userJwt = jwt.sign(
            {
                id: user._id,
                email: user.email,
            },
            process.env.JWT_KEY!
        );

        req.session = {
            ...req.session,
            jwt: userJwt,
        };

        res.status(200).send(user);
    }
);

export { router as signinRouter };
