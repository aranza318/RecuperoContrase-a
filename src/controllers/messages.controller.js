import crypto from "crypto";
import { GMAIL_USER, GMAIL_PASSWORD} from "../config/configs.js";
import nodemailer from "nodemailer";
import __dirname from "../../utils.js";
import mongoose from "mongoose";
import EmailService from "../services/messages.sevice.js";


const emailService = new EmailService();

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

const mailOptions = {
  from: "Coder Test " + GMAIL_USER,
  to: GMAIL_USER,
  subject: "Correo de prueba Coderhouse Programacion Backend.",
  html: "<div><h1>Esto es un Test de envio de correos con Nodemailer!</h1></div>",
  attachments: [],
};

const mailOptionsWithAttachments = {
  from: "Coder Test " + GMAIL_USER,
  to: GMAIL_USER,
  subject: "Correo de prueba Coderhouse Programacion Backend.",
  html:  `<h1>Esto es un Test de envio de correos con Nodemailer!</h1>
          <p>Ahora usando imagenes: </p>
          <img src="cid:okunaLogo"/>
          </div>`,
  attachments: [
    {
      filename: "Okuna",
      path: __dirname+'/src/public/images/okunaLogo.png',
      cid: "okunaLogo",
    },
  ],
};

export const sendEmail = (req, res) => {
  try {
    let result = transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(400).send({ message: "Error", payload: error });
      }
      req.logger.info("Message sent: %s", info.messageId);
      res.send({ message: "Success!", payload: info });
    });
  } catch (error) {
    req.logger.error(error);
    res
      .status(500)
      .send({
        error: error,
        message: "No se pudo enviar el email desde:" + config.gmailAccount,
      });
  }
};

export const sendEmailWithAttachments = (req, res) => {
  try {
    let result = transporter.sendMail(
      mailOptionsWithAttachments,
      (error, info) => {
        if (error) {
          req.logger.error(error);
          res.status(400).send({ message: "Error", payload: error });
        }
        req.logger.info("Message sent: %s", info.messageId);
        res.send({ message: "Success!", payload: info });
      }
    );
  } catch (error) {
    req.logger.error(error);
    res
      .status(500)
      .send({
        error: error,
        message: "No se pudo enviar el email desde:" + config.gmailAccount,
      });
  }
};

export const sendPasswordRecoveryEmail = (req, res) => {
  try {
    // Obtén el correo electrónico del usuario que necesita recuperar la contraseña desde el cuerpo de la solicitud
    const userEmail = req.body.email;
    console.log('Correo electrónico del usuario:', userEmail);

    // Genera un token único para la recuperación de contraseña
    const recoveryToken = generateToken();

    // Guarda el token y la fecha de expiración en tu base de datos o en algún otro lugar seguro
    saveToken(userEmail, recoveryToken, 60); // 60 minutos de expiración

    // Construye el enlace de recuperación de contraseña con el token
    const recoveryLink = `http://localhost:8080/reset-password?token=${recoveryToken}`;

    // Crea el objeto de opciones de correo electrónico con el enlace de recuperación
    const mailOptions = {
      from: `${process.env.GMAIL_USER} <agalvaliz318@gmail.com>`,
      to: userEmail, // Usar el correo electrónico del usuario
      subject: 'Recuperación de contraseña',
      html: `Haz clic en el siguiente enlace para restablecer tu contraseña: <a href="${recoveryLink}">Restablecer contraseña</a>`,
    };

    // Envía el correo electrónico
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log('Error al enviar el correo electrónico:', error);
        res.status(400).send({ message: 'Error', payload: error });
      } else {
        console.log('Correo electrónico enviado:', info.response);
        res.send({ message: 'Correo electrónico de recuperación enviado' });
      }
    });
  } catch (error) {
    console.log('Error en la solicitud de recuperación de contraseña:', error);
    res.status(500).send({ error: error, message: 'Error en la solicitud de recuperación de contraseña' });
  }
};


// Función para generar un token único
const generateToken = () => {
  // Genera un token único utilizando alguna biblioteca o algoritmo de generación de tokens
  // usamos cryto
  const token = crypto.randomBytes(20).toString('hex');
  return token;
};


// Definir el esquema para el token de recuperación de contraseña
const recoveryTokenSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  token: { type: String, required: true },
  expirationDate: { type: Date, required: true },
});

// Crear el modelo para el token de recuperación de contraseña
const RecoveryToken = mongoose.model('RecoveryToken', recoveryTokenSchema);

// Función para guardar el token y la fecha de expiración en la base de datos
const saveToken = async (userEmail, recoveryToken) => {
  const expirationDate = new Date();
  expirationDate.setMinutes(expirationDate.getMinutes() + 60);

  const token = new RecoveryToken({
    userEmail,
    token: recoveryToken,
    expirationDate,
  });

  try {
    await token.save();
    console.log('Token guardado exitosamente');
  } catch (error) {
    console.error('Error al guardar el token:', error);
  }
};


/*export const sendMail = (req, res) => {
  try {
    const { email } = req.user;
    const { message, title } = req.body;
    emailService.sendEmail(email, message, title, (error, info)=>{
      if (error){
        res.status(400).send({message:"Error", payload: error});
      }
      req.logger.info(`Mensaje enviado: %s ${info.messageId}`);
      res.send({message: "Success", payload:info});
    });
  } catch (error) {
    req.logger.warn(`Error al enviar el email: ${error}`);
    res.status(500).send({error:error, message: "No se pudo enviar el email desde el correo" + GMAIL_USER});
  };
};*/

