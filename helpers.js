const findUserByEmail = function(email, userDatabase) {
  return Object.values(userDatabase).find(user => user.email === email);
};

const generateRandomString = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
};

const isLoggedIn = function(reqBodyObj) {
  if (!Object.keys(reqBodyObj.session).includes('user_id')) return false;
  return true;
};

const isUsersURL = function(urlID, usersURLObj) {
  return Object.keys(usersURLObj).includes(urlID);
};

module.exports = { 
  findUserByEmail,
  generateRandomString,
  isLoggedIn,
  isUsersURL
};