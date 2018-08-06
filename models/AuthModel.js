const redis = global.utils.redis;
const jwt = require('jsonwebtoken');

/*******************
 *  Authenticate
 *  @param: (Access) token
 ********************/
exports.auth = (token, done) => {
  jwt.verify(token, global.env.JWT_CERT, (err, decoded) => {
    if (err) {
      let customErr = '';

      switch (err.message) {
        case 'jwt expired':
          customErr = new Error("Token is expired");
          return done(customErr);
        case 'invalid token':
          customErr = new Error("Token is invalid");
          return done(customErr);
        default:
          return done(err.message);
      }
    } else {
      const userData = {
        id: decoded.id,
        nickname: decoded.nickname,
        avatar: decoded.avatar
      }
      done(null, userData);
    }
  });
};


/*******************
 *  Authenticate
 *  @param: (Refresh) token
 ********************/
exports.refresh = (token, done) => {
  // 1. 먼저 해당 jwt가 유효한지 확인
  return new Promise((resolve, reject) => {
    this.auth(token, (err, userData) => {
      if (err) {
        reject(err);
      } else {
        resolve(userData);
      }
    });
  })
  .then((userData) => {
    // 2. redis에 존재하는지 확인
    return new Promise((resolve, reject) => {
      redis.get(token, (err, object) => {
        if (err){
          const customErr = new Error("Token is expired or invalid: " + err);
          reject(customErr);
        } else { // 토큰 체크 완료
          redis.set(token, userData.id, 'EX', 7*24*60*60); // 7일 후 삭제됨 (갱신)
          const result = {
            accessToken: jwt.sign(userData, global.env.JWT_CERT, {'expiresIn': "12h"})
          };
      
          resolve(result);
        }
      });
    });
  });
};