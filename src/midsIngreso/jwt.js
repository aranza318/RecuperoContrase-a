import jwt from "jsonwebtoken";
import { JWT_KEY } from "../config/configs.js";

export const generateJWT = (user, expiresIn= '20m') =>{
    return jwt.sign({user}, JWT_KEY, {expiresIn: expiresIn});
};