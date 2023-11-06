const isUser = (req, res, next) => {

    if (req.user.role === "user") return next();
    req.logger.warn(`Unauthorized user. User role: ${req.user.role}`)
    return res.status(403).json({ status: "error", message: "User role required" });

};


const isAdminOrPremium = (req, res, next) => {

    if (req.user.role === "admin" || req.user.role === "premium") return next();
    req.logger.warn(`Unauthorized user. User role: ${req.user.role}`)
    return res.status(403).json({ status: "error", message: "Admin or Premium role required" });
};

export default { isAdminOrPremium, isUser };