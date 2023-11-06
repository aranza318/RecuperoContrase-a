import { userModel } from "./models/user.model.js";
import { createHash, isValidPassword } from "../midsIngreso/bcrypt.js";


class UserManager {
  async addUser({ first_name, last_name, email, age, password, role, cart}) {
    try {
      const existingUser = await userModel.findOne({ email });

      if (existingUser) {
        console.log("User already exists");
        return null;
      }

      const hashedPassword = createHash(password);
      const user = await userModel.create({
        first_name,
        last_name,
        email,
        age,
        password: hashedPassword,
        role,
        cart
      });

      console.log("User added!", user);
      return user;
    } catch (error) {
      console.error("Error adding user:", error);
      throw error;
    }
  }
    async login(user, pass) {
      try {
        const userLogged = await userModel.findOne({ email: user });
  
        if (userLogged && isValidPassword(userLogged, pass)) {
          const role =
            userLogged.email === "adminCoder@coder.com" ? "admin" : "usuario";
  
          return userLogged;
        }
        return null;
      } catch (error) {
        console.error("Error durante el login:", error);
        throw error;
      }
    }

    async findOne(email) {

      const result = await userModel.findOne({ email }).lean();
      return result;
  };

  async restorePassword(email, hashedPassword) {
    try {
      const user = await userModel.findOne({ email });
      if (!user) {
        console.log("Usuario no encontrado.");
        return false;
      }

      user.password = hashedPassword;

      await user.save();

      console.log("Contraseña restaurada correctamente.");
      return true;
    } catch (error) {
      console.error("Error restoring password:", error);
      return false;
    }
  }

  async updateUser(userId, userToReplace){
    const filter = {email: userId};
    const update = {$set: userToReplace};
    const result = await userModel.updateOne(filter, update);
    return result;
  };

}

export default UserManager;