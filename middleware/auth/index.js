

function IsNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        // The user is logged in
        return res.redirect('/')
    } else {
        // The user is logged out
        next();
    }
}

module.exports = IsNotAuthenticated
