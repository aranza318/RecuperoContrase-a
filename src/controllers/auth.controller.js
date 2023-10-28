import AuthenticationService from "../services/auth.service.js";
import { authError } from "../services/errors/errorMessages/user.auth.error.js";
import CustomeError from "../services/errors/customeError.js";


class AuthController {
  constructor() {
    this.authService = new AuthenticationService();
  }

  async login(req, res, next) {
   try {
    const { email, password } = req.body;
    const userData = await this.authService.login(email, password);
    req.logger.info("User data retrieved:", userData);

    if (!userData || !userData.user) {
      req.logger.error("Invalid credentials");
      const customeError = new CustomeError({
        name: "Auth Error",
        message: "Credenciales invalidas",
        code:401,
        cause: authError(email),
      });
      return next(customeError)
    }
    
    if (userData && userData.user) {
      req.session.user = {
        id: userData.user.id || userData.user._id,
        email: userData.user.email,
        first_name:  userData.user.first_name,
        last_name:  userData.user.last_name,
        age: userData.user.age,
        role: userData.user.role,
        cart: userData.user.cart
      };
      
    }

    req.logger.info("Full user data object:", userData.user);

    req.logger.info("Assigned session:", req.session); 

    res.cookie("coderCookieToken", userData.token, {
      httpOnly: true,
      secure: false,
    });

    return res.status(200).json({ status: "success", user: userData.user, redirect: "/products" });
   } catch (error) {
    req.logger.error("Ocurrio un error: ", error);
    return res.redirect("/login");
   }
    
  }
  async githubCallback(req, res) {

    try {
      if (req.user) {
        req.session.user = req.user;
        req.session.loggedIn = true;
        return res.redirect("/products");
      } else {
        return res.redirect("/login");
      }
    } catch (error) {
      req.logger.error("An error occurred:", error);
      return res.redirect("/login");
    }
  }

  logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        return res.redirect("/profile");
      }
      return res.redirect("/login");
    });
  }
}

export default AuthController;