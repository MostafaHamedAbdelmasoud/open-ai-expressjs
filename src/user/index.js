const UserModel = require("../../models/user");
const UserService = require("../../servies/user/user.service");

module.exports = UserService(UserModel);