const { values } = require("lodash");
const AppError = require("../appError");

const handleCastErrorDB = (err) => {
  const message = `invalid ${err.path} cann't be ${err.value}`;
  return new AppError(message, 400);
};

const handleDupplicateFieldsDB = (err) => {
  const value = err.keyValue.name;
  const message = `Dupplicate field value: ${value} please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB=err=>{
    const errors=Object.values(err.errors).map(el=>el.message)
    const message=`invalid input data ${errors.join('. ')}`;
    return new AppError(message,400);
}
const handleJWTError=()=>{
  return new AppError('invalid token please login again',401)
}
const handleJWTExpiredError=()=>{
  return new AppError('token had been expired please login again',401)
}

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  //opertional error
  if (err.isOpertional) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    //programming errorf
  } else {
    //1-log error to console
    //console.error(err);
    //2- send response to client
    res.status(500).json({
      status: "error",
      message: "something went very worng",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    if (err.name === "CastError") {
      error = handleCastErrorDB(error, res);
    }
    if (err.code === 11000) {
      error = handleDupplicateFieldsDB(error);
    }
    if(err.name==='ValidationError'){
        error=handleValidationErrorDB(error);
    }
    if(err.name==='JsonWebTokenError'){
      error=handleJWTError();
    }
    if(err.name==='TokenExpiredError'){
      error=handleJWTExpiredError();
    }
    sendErrorProd(error, res);
  }
};
