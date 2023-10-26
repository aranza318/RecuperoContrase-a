import { Router } from "express";

const logRouter = new Router();

logRouter.get("/", (req, res) =>{
    req.logger.fatal("Error catastrofico, algo salio muy mal");
    req.logger.error("Error de alto nivel"); // Activa a ErroHandler
    req.logger.info(`Este es un log de informacion. Tu nombre de usuario es ${req.user}`);
    req.logger.http("Http log");
    req.loggeer.debug("Este es un log de informacion de developer");
    res.send({message:"Test de logger"})

});

export default logRouter;