import UserService from "../services/user.service.js";
import UserResponse from "../dao/dtos/user.response.js";
import { generateUserError } from "../services/errors/errorMessages/user.creation.error.js";
import EErrors from "../services/errors/errorsEnum.js";
import CustomeError from "../services/errors/customeError.js";
import { createHash, isValidPassword } from "../midsIngreso/bcrypt.js";
import { userModel } from "../dao/models/user.model.js";
import { generateJWT } from "../midsIngreso/jwt.js";
import EmailService from "../services/messages.sevice.js";
import jwt from "jsonwebtoken";
import { JWT_KEY } from "../config/configs.js";
import UserManager from "../dao/userManager.js";

const userService = new UserService();

class UserController {
  constructor() {
    this.userService = new UserService();
    this.emailService = new EmailService();
    this.userManager = new UserManager();
  }

  async register(req, res, next) {
    try {
      const { first_name, last_name, email, age, password, role } = req.body;
    if( !first_name || !email || !age || !password){
      const customeError = new CustomeError({
        name: "User creation error",
        cause: generateUserError({
          first_name, last_name, email, age, password,
        }),
        message: "Error al intentar registrar al usuario",
        code:400,
      });
      return next(customeError);
    }
    const response = await this.userService.registerUser({
      first_name,
      last_name,
      email,
      age,
      password,
      role,
    });

    return res.status(response.status === "success" ? 200 : 400).json({
      status: response.status,
      data: response.user,
      redirect: response.redirect,
    });
    } catch (error) {
      return next(error);
    }
    
  }

  async recoverPass(req, res){
       try {
     
        const email = req.body;
        const user = await userModel.findOne(email);
       
        console.log({email});
        const correo = JSON.stringify(email);
        
        req.logger.info(`Creando un token de restauracion para el email: ${correo}`);
        if(!user){
          return res.status(401).json({status:"error", error: "No se pudo encontrar a este usuario"})
        }
        let restorePasswordToken = generateJWT(email, '1h')
        req.logger.info(restorePasswordToken);
        const from = 'agalvaliz318@gmail.com';
        const subjet = 'Restaurar contraseña en Okuna';
        const message = `<div style="display:flex; flex-direction:column; justify-content:center; aling-items:center">
        <h1>Para restaurar tu constraseña haz click <a href="http://localhost:8080/users/recoverLanding/${restorePasswordToken}">aqui</a></h1>
        </div>`
        this.emailService.sendEmail(from, email, message, subjet, (error, result)=>{
          if(error){
            throw {
              error: result.error,
              message: result.message,
            }
          }
        })
        req.logger.info(`El token de reseteo de contraseña fue enviado`);
        res.status(200).json({status:"Success", message: `El token de reseteo de contraseña fue enviado`})
       } catch (error) {
         console.error(error);
         res.status(500).json({error:error, message: "La contraseña no pudo ser reestablecida"})
       }
  }
  
  async swapUserRole  (req, res, next) {
    try {

        const email = req.params.uid;

        let dbUser = await this.userService.swapUserRole(email);
        res.send({ status: 'success', data: dbUser });

    } catch (error) {
        next(error)
    }
}
/*async  sendResetToken  (req, res, next) {
    req.logger.http(`Petición llegó al controlador (sendResetToken).`);
    const { email } = req.body;
    if (!email) {
        return res.status(404).json({
            message: "Debe ingresar un email válido"
        });
    }

    try {
        const user = await userModel.findOne(email);
        if (!user) {
            return res.status(404).json({
                message: "El email no esta registrado"
            });
        }
        const token = jwt.sign({ userId: user._id }, JWT_KEY, { expiresIn: '1h' });
        req.logger.debug(token)
        await sendResetMail(token, email);
        return res.status(200).json({
            message: "Ha sido enviado un email con el link para recuperar la contraseña"
        });

    } catch (error) {
        req.logger.error(error.message)
        next(error)
    }
};

 async resetUserPassword  (req, res, next){
  req.logger.http(`Petición llegó al controlador (resetUserPassword).`);
  const { newPassword, token } = req.body;
  if (!newPassword) {
      return res.status(404).json({
          message: "Debe ingresar una contraseña válida"
      });
  }

  try {
      const decodedToken = jwt.verify(token, JWT_KEY);
      req.logger.debug(decodedToken)
      const userId = decodedToken.userId;
      const userDB = await userModel.findById(userId);
      if (!userDB) {
          return res.status(404).json({ 
              message: 'Usuario no encontrado.'
          });
      }
      if (comparePassword(newPassword, userDB.password)) {
          return res.status(404).json({ 
              message: 'La nueva contraseña no puede ser la misma que la anterior'
          });
      }
      const hashPassword = createHash(newPassword);
      await updateUser(userId, {password: hashPassword})
      
      return res.status(200).json({
          message: "La contraseña ha sido actualizada"
      });

  } catch (error) {
      req.logger.error(error.message)
      next(error)
  }
 };*/

async restorePassword(req, res, next) {
    
    try {
      const { token, password: newPassword } = req.query;
      const decodedToken = jwt.verify(token, JWT_KEY);
      if(!newPassword || newPassword.trim()=== ""){
        return res.send({status:"error", message: "La contraseña no puede estar vacia"});
      };
      const email = decodedToken.user;
      const user = await userModel.findOne(email);
      req.logger.info(`Chekear si el usuario existe mediante el correo: ${email}`);
      if(!user){
        return res.status(401).json({status:"error", message: "No se pudo encontrar al usuario"});
      }
      if(isValidPassword(user, newPassword)){
        return res.send({status: "error", message: "La contraseña no puede ser la misma"})
      }
      const hashedPass = createHash(newPassword);
      const result = await this.userService.updateUser({email: email},{password: hashedPass});
 
      return res.status(200).json({status:"OK", message:"La contraseña se ha actualizado correctamente"});

    } catch (error) {
      if(error.name == 'TokenExpiredError'){
        req.logger.warn('El token ha esperido')
        return res.status(401).json({error: 'El token ha esperido'})
      }
      req.logger.error(error);
      return next(error);
    }
  }

  currentUser(req, res, next) {
    if (req.session.user) {
      return res.send({
        status: "OK",
        payload: new UserResponse(req.session.user),
      });
    } else {
      const customeError = new CustomeError({
        name: "Auth Error",
        massage: "No fue posible acceder a Current",
        code: EErrors.AUTHORIZATION_ERROR,
      });
      return next(customeError);  
    }
  }
}

export default UserController;
