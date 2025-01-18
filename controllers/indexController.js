const connection = require('../config/db');

class IndexController {

  index = (req,res) => {
    let sql = 'SELECT user_img,user_id FROM user WHERE user_is_deleted = 0';
    connection.query(sql, (error, result) => {
      if (error) {
        throw error;
      }
      else {
        res.render('index', {result: result})
      }
    })
  }

  search = (req,res) => {
    const {text} = req.body;
    let newText = text.toLowerCase();
    if (text[text.length - 1] == 's'){
      newText = text.slice(0, 3);
    }
    else {
      newText = text.slice(0, 3);
    }
    let sql = `SELECT * FROM pet WHERE pet_is_deleted = 0 AND pet_species LIKE "${newText}%" ORDER BY pet_likes DESC`;
    connection.query(sql, (error, result) => {
      if (error) {
        throw error;
      }
      else {
        res.render('search',{result});
      }
    });
  }

}

module.exports = new IndexController();