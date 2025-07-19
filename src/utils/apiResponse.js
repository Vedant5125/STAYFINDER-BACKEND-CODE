class apiResponse {
    constructor(statusCode, data, message = "Success"){
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = new Error().stack; 
        }
    }
}