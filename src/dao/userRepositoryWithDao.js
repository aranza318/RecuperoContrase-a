import UserManager from "./userManager.js";
import UserRepository from "./user.repository.js";

const userDao = new UserManager();

export const UserRepositoryWithDao = new UserRepository(userDao);