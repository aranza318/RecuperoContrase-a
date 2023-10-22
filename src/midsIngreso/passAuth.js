import passport from "passport";

export const passportCall = (strategy) => {
  return async (req, res, next) => {
    console.log('Inicio de la autenticación');
    
    passport.authenticate(strategy, function (error, user, info) {
      console.log('Autenticación en proceso');
      
      if (error) {
        console.error('Error durante la autenticación', error);
        return next(error);
      }

      if (!user) {
        console.log('Autenticación fallida');
        return res.status(401).send({ error: info.messages ? info.messages : info.toString() });
      }

      req.user = user;
      console.log('Autenticación exitosa');
      next();
    })(req, res, next);
  };
};

export const authorization = (roles) => {
return async (req, res, next) => {
  if (!req.user) {
    console.log('User is not authenticated'); 
    return res
      .status(401)
      .send({ status: "error", message: "Unauthorizated" });
  }

  if (!roles.includes(req.user.role)) {
    console.log('User does not have the required role'); 
    return res
      .status(403)
      .send({ status: "error", message: "No permissions" });
  }

  next();
};
};


