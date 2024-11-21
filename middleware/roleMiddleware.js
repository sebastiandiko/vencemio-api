const checkRole = (requiredRole) => {
    return (req, res, next) => {
      if (!req.user || !req.user[requiredRole]) {
        return res.status(403).json({ message: 'No tienes permisos para esta acción.' });
      }
      next();
    };
  };
  
  module.exports = { checkRole };
  