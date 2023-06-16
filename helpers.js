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

module.exports = { 
  findUserByEmail,
  generateRandomString
};