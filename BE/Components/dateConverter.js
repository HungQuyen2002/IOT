const moment = require('moment-timezone');

exports.convertToVietnameseTime = (utcTime) => {
  return moment.utc(utcTime).subtract(7, 'hours').tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');
};
