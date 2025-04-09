
class ExpressError extends Error {
    constructor(status, message) {
        super();
        this.status = status || 500;
        this.message = message || "Something went wrong!";
    }
}

module.exports = ExpressError;