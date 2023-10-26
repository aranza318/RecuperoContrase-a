import AuthenticationService from "../services/auth.service.js";
import { authError } from "../services/errors/errorMessages/user.auth.error.js";
import CustomeError from "../services/errors/customeError.js";


class AuthController {
  constructor() {
    this.authService = new AuthenticationService();
  }

  async login(req, res, next) {
   try {
    console.log("Login request received:", req.body);

    const { email, password } = req.body;
    const userData = await this.authService.login(email, password);
    console.log("User data retrieved:", userData);

    if (!userData || !userData.user) {
      console.log("Invalid credentials");
      const customeError = new CustomeError({
        name: "Auth Error",
        message: "Credenciales invalidas",
        code:401,
        cause: authError(email),
      });
      return next(customeError)
    }
    

    if (userData && userData.user) {
      console.log("Setting session and cookie");
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

    console.log("Full user data object:", userData.user);

    console.log("Assigned session:", req.session); 

    res.cookie("coderCookieToken", userData.token, {
      httpOnly: true,
      secure: false,
    });

    console.log("Login successful, redirecting to /products");
    return res.status(200).json({ status: "success", user: userData.user, redirect: "/products" });
   } catch (error) {
    console.error("Ocurrio un error: ", error);
    return res.redirect("/login");
   }
    
  }
  async githubCallback(req, res) {
    console.log("Inside AuthController githubCallback");
    try {
      if (req.user) {
        req.session.user = req.user;
        req.session.loggedIn = true;
        return res.redirect("/products");
      } else {
        return res.redirect("/login");
      }
    } catch (error) {
      console.error("An error occurred:", error);
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