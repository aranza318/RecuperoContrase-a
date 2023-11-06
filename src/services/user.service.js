import UserManager from "../dao/userManager.js";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "../config/configs.js";
import CartManager from "../dao/cartManager.js";
import { UserRepositoryWithDao } from "../dao/userRepositoryWithDao.js";

class UserService {
  constructor() {
    this.userManager = new UserManager();
    this.cartManager = new CartManager();
  }

  async registerUser({ first_name, last_name, email, age, password, role }) {
    try {
      const cartResponse = await this.cartManager.newCart();
      console.log("Cart response:", cartResponse);
      if (cartResponse.status !== "ok") {
        return { status: "error", message: "Error creating cart" };
      }
      const role =
        email == ADMIN_EMAIL &&
        password === ADMIN_PASSWORD
          ? "admin"
          : "user";
      const cartId = cartResponse.id;
      console.log("Cart ID:", cartId);
      const user = await this.userManager.addUser({
        first_name,
        last_name,
        email,
        age,
        password,
        role,
        cart: cartId,
      });

      if (user) {
        return { status: "success", user, redirect: "/login" };
      } else {
        return { status: "error", message: "User already exists" };
      }
    } catch (error) {
      console.error("Error registering user:", error);
      return { status: "error", message: "Internal Server Error" };
    }
  }

  async swapUserRole(email) {

    if (!email) {
        return res.status(401).json({ status: 'error', error: "Email is required." });
    }

    try {

        let user = await UserRepositoryWithDao.findOne(email);
        log.logger.debug(`Get user data from: ${email}`);

        if (!user) {
            return res.status(401).json({ status: 'error', error: "Can't find user." });
        }

        if (user.role === "admin") {
            return res.status(403).json({ status: "error", message: "Admin users cant swap roles" });

        } else {

            // Check required documents por swap to Premium
            const requiredDocuments = ["Identification", "Proof of address", "Statement of Account"];

            const hasRequiredDocuments = requiredDocuments.every(document => {
                return user.documents.some(doc => doc.reference.includes(document) && doc.status === "Uploaded");
            });

            if (hasRequiredDocuments) {

                if (user.role === "user") {
                    user.role = "premium";
                    const changedRole = await UserRepositoryWithDao.updateUser(email, user);
                    return changedRole

                } else if (user.role === "premium") {
                    user.role = "user";
                    const changedRole = await UserRepositoryWithDao.updateUser(email, user);
                    return changedRole
                }

            } else {
                throw new Error('Something went wrong validating. Must have all 3 documents to swap role');
            }
        }
    } catch (error) {
        log.logger.warn(`Error updating user role: ${error.message}`);
        next(error);
    }
};

  async restorePassword(user, hashedPassword) {
    return await this.userManager.restorePassword(user, hashedPassword);
  }

  async findOne(email) {

    try {
        const result = await UserRepositoryWithDao.findOne(email);
        if (!email) {
            return res.status(401).json({ status: 'error', error: "Can't find user." });
        }

        return result;

    } catch (error) {
        console.log(error);
    }
};
  
  async updateUser(userId, userToReplace){
    const result = await this.userManager.updateUser(userId, userToReplace);
    return result;
  }
}

export default UserService;
