
const paramMiddleware = (page) => {
    return (req, res, next) => {

        const error = req.flash('error');
        const customError = req.flash('customError');
        if (error.length || customError.length) {
           
            return res.render('auth/' + page, {
                messages: error,
                customError,
            });
        }
        next();
    }
}

module.exports = paramMiddleware