const UserModel = require('../../models/user')

const addGoogleUser =
  (UserModel) =>
  ({ id, email, firstName, lastName, profilePhoto }) => {
    const user = new UserModel({
      id,
      email,
      firstName,
      lastName,
      profilePhoto,
      source: "google",
    });
    return user.save();
  };

const getUsers = (UserModel) => () => {
  return User.find({});
};

const getUserByEmail =
  (UserModel) =>
  async ({ email }) => {
    return await UserModel.findOne({
      email,
    });
  };

module.exports = (UserModel) => {
  return {
    addGoogleUser: addGoogleUser(UserModel),
    getUsers: getUsers(UserModel),
    getUserByEmail: getUserByEmail(UserModel),
  };
};
