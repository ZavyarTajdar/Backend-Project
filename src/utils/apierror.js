class apiError extends Error { // Here Error is pre-defined class , so there is no need for making class for "Error", thats why we are extending it without making Error class.
    constructor(
        statusCode,
        message = "Internal Server Error",
        errors = [],
        stack = ""
    ){ 
       super(message);
       this.statusCode = statusCode;
       this.errors = errors;
       this.stack = stack;
       this.data = null;
       this.success = false;


       if (stack) {
           this.stack = stack;
       }else{
        Error.captureStackTrace(this, this.constructor);
       }
    }
}

export { apiError }


//--------------------------Extends----------------------------
/*
    extends ka matlab hai ek class doosri class ki properties 
    aur methods ko inherit (yaani use) kar sakti hai.
*/
//--------------------------Super----------------------------
/*
    Super ka matlab hai parent class ke constructor ko call karna.
    Jab hum child class banate hain, to hume parent class ke constructor ko
    call karna padta hai taaki parent class ki properties initialize ho sakein.
*/