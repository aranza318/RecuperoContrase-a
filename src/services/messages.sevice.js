import nodemailer from 'nodemailer';
import { GMAIL_PASSWORD, GMAIL_USER } from '../config/configs.js';


/*const transporter = nodemailer.createTransport({
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

export const sendResetMail = async (token, email) => {
    try {
        await transporter.sendMail({
            from: "Restaurar contraseña de Okuna" + GMAIL_USER,
            to: email,
            subject: "Okuna web - Recuperación de contraseña",
            html: `
                <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
                <a href="http://localhost:8080/resetpassword?token=${token}">Restablecer contraseña</a>
            `,
            attachments: []
        })
    } catch (error) {
        throw error
    }
}*/


export default class EmailService {
    static #transporter
    constructor(){
        if(!EmailService.#transporter){
            EmailService.#transporter = nodemailer.createTransport({
                service:'gmail',
                port: 587,
                auth:{
                    user: GMAIL_USER,
                    pass: GMAIL_PASSWORD,
                },
                tls: {
                    rejectUnauthorized: false,
                }
            });
            EmailService.#transporter.verify(function(error, success){
                if (error) {
                    console.warn(`Error al verificar transporter: ${error}`)
                } else {
                    console.info('Servicio listo para tomar nuestros mensajes')
                }
            })
        }
    }
    #mailOptions = (receiver, title, message) =>{
        return {
            from: "Okuna" + GMAIL_USER,
            to: receiver,
            subject: title ? title : "Email test",
            html: message ? message : `<div><h1>Este es un test</h1></div>`,
            attachments: [] 
        }
    }
    async sendEmail(email, message, title, callback){
        let finalEmail = email ? email : GMAIL_USER;
        EmailService.#transporter.sendMail(this.#mailOptions(finalEmail, title, message), (error, info)=>{
            if(error){
                function doSomething(callback) {
                    callback({
                        message: "Error",
                        payload: error,
                        code: 400
                    });
                  }
                  
                  function myCallback() {
                    console.log("El callback se ejecutó.");
                  }
                  
                  doSomething(myCallback);
            } else{
                
                function doSomething(callback) {
                    callback(null, {message:"Success", payload: info})
                  }
                  
                  function myCallback() {
                    console.log("El callback se ejecutó.");
                  }
                  
                  doSomething(myCallback);
            }
        })
    }
}