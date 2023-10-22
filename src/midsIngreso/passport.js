import passport from "passport"
import local from "passport-local"
import usersModel from "../dao/models/user.model.js"
import {createHash,isValidPassword} from "../midsIngreso/bcrypt.js"
import jwt from "passport-jwt"
import CartService from "../services/cart.service.js"
import UserService from "../services/user.service.js"
const userService = new UserService();
const cartService = new CartService();
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;
const LocalStrategy = local.Strategy;

//Estrategias de Passport

const initializePassport = ()=>{
  passport.use("register", new LocalStrategy({ passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body;
        try {
          let user = await usersModel.findOne({ email: username });
          if (user) {
            console.log("El usuario " + email + " ya se encuentra registrado!");
            return done(null, false);
          }
          user = {
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
            rol
          };
          console.log("Rol antes de la asignación:", user.role);
          if (user.email == "adminCoder@coder.com" && password === "adminCod3r123") {
            console.log("Asignando rol de admin");
            user.role = 'admin';
          } else {
            console.log("Asignando rol de usuario");
            user.role = 'user';
          }
          console.log("Rol después de la asignación:", user.rol);
          let result = await usersModel.create(user);
          console.log("Usuario después de guardar:", result);
          if (result) {
            return done(null, result);
          }
        } catch (error) {
          console.error("Error durante el proceso de registro:", error);
          return done(error);
        }
      }
    )
  );

passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (username, password, done) => {
        console.log("[Auth] Trying to authenticate user:", username);

        try {
          let user = await usersModel.findOne({ email: username });

          if (!user) {
            return done(null, false, { message: "Usuario incorrecto." });
          }
          if (!isValidPassword(user, password)) {
            return done(null, false, { message: "Contraseña incorrecta." });
          }
          if (!user.cart) {
       
            const cart = await cartService.createCart()
    
            user.cart = cart._id;
            await userService.updateUser(username, user)
        }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

passport.use("jwt", new JWTStrategy ({jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]), 
    secretOrKey:"S3CR3T0NTH3M0UNT41N", }, 
    async(jwt_payload, done)=>{
        try {
            const user = await usersModel.findOne({email: jwt_payload.email});
            if(!user){
                return done (null, false, {message: "Usuario no encontrado en nuestra base de datos"})
            }
            return done (null, user);
        } catch (error) {
            return done (error);
        }
    }))
}

passport.serializeUser((user, done) => {
    done(null, user._id)
})

passport.deserializeUser(async(id, done) => {
    let user = await usersModel.findById(id)
    done(null, user)
})

export default initializePassport;

const cookieExtractor = (req) => {
    let token = null;
  
    if (req && req.cookies) {
      token = req.cookies["coderCookieToken"];
    }
  
    return token;
  };


