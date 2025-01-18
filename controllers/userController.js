const connection = require('../config/db');
const bcrypt = require('bcrypt');
const deleteFile = require('../utils/deletefile');

class UserController {
  showFormAddUser = (req, res) => {
    res.render('formAddUser');
  }
  addUser = (req,res) => {
    const {user_name, user_lastname, email,user_description,user_phone,password,reppassword} = req.body;
    if (!user_name || !user_lastname || !email || !user_description || !user_phone || !password || !reppassword) {
      res.render('formAddUser', {message: 'All fields are mandatory'});
    }
    else {
      if (password != reppassword) {
        res.render('formAddUser', {message: 'Passwords do not match'});
      }
      else {
        bcrypt.hash(password, 10, (errorHash, hash) => {
          if (errorHash) {
            throw errorHash;
          }
          else {
            let sql = 'INSERT INTO user (user_name, user_lastname, email,user_description,user_phone,password) VALUES (?, ?, ?, ?, ?, ?)';
            let values = [user_name, user_lastname, email,user_description,user_phone,hash];
            if (req.file) {
              sql = 'INSERT INTO user (user_name, user_lastname, email,user_description,user_phone,password,user_img) VALUES (?, ?, ?, ?, ?, ?, ?)';
              values = [user_name, user_lastname, email,user_description,user_phone,hash,req.file.filename];
            }
            connection.query(sql,values,(error, result) => {
            if (error) {
              if (error = 1062) {
                res.render('formAddUser', {message: 'Email already registered'});
              }
              else {
                throw error;
              }
            }
            else {
              res.redirect('/');
            }
           })
          }
        });
      }
    }
  }

  login = (req,res) => {
    res.render('login');
  }

  checkLogin = (req,res) => {
    const {email, password} = req.body;
    if (!email || !password) {
      res.render('login', {message: "All fields are mandatory"});
    }
    else {
      let sql = 'SELECT * FROM user WHERE email = ?';
      connection.query(sql,[email], (error, result) => {
        if (error) {
          throw error;
        }
        else {
          if (!result.length) {
            res.render('login', {message: 'Invalid credentials!s'});
          }
          else {
            let hash = result[0].password;
            bcrypt.compare(password, hash, (errorHash, resultCompare) => {
              if (!resultCompare) {
                res.render('login', {message: "Invalid credentials"});
              }
              else {
                let user_id = result[0].user_id;
                let sql1 = 'SELECT * FROM pet WHERE pet.user_id = ?';
                connection.query(sql1,[user_id], (error,result1) => {
                  if (error) {
                    throw error;
                  }
                  else {
                    res.render('oneUserAdmin', {result: result[0], result1});
                  }
                })
              }
            })
          }
        }
      })
    }
  }

  allUsers = (req,res) => {
    let sql = 'SELECT * FROM user WHERE user_is_deleted = 0';
    connection.query(sql, (error, result) => {
      if (error) {
        throw error;
      }
      else {
        let sql2 = 'SELECT count(pet_id) AS count FROM pet WHERE pet_is_deleted = 0 GROUP BY pet.user_id';
        connection.query(sql2, (error2, result2) => {
          if (error2) {
            throw error2;
          }
          else {
            res.render('allUsers', {result, result2});
          }
        })
      }
    })
  }

  oneUser = (req,res) => {
    const {user_id} = req.params;
    
    let sql = 'SELECT * FROM user WHERE user_is_deleted = 0 AND user_id = ?';
    connection.query(sql,[user_id], (error,result) => {
      if (error) {
        throw error;
      }
      else {
        let sql1 = 'SELECT * FROM pet WHERE pet_is_deleted = 0 AND pet.user_id = ? ORDER BY pet_likes DESC';
        connection.query(sql1,[user_id], (error,result1) => {
          if (error) {
            throw error;
          }
          else {
            res.render('oneUser', {result: result[0], result1});
          }
        })
      }
    })
  }

  editForm = (req,res) => {
    const {user_id} = req.params;
    let sql = 'SELECT * FROM user WHERE user_id = ? AND user_is_deleted = 0';
    connection.query(sql,[user_id], (error, result) => {
      if (error) {
        throw error;
      }
      else {
        res.render('editOneUser', {result: result[0]});
      }
    })
  }

  updateForm = (req,res) => {
    const {user_id} = req.params;
    const {user_name, user_lastname, user_description, user_phone} = req.body;
    if (!user_name || !user_lastname || !user_description || !user_phone) {
      let sql = 'SELECT * FROM user WHERE user_id = ? AND user_is_deleted = 0';
      connection.query(sql,[user_id], (error, result) => {
        if (error) {
          throw error;
        }
        else {
          res.render('editOneUser', {result: result[0],message: 'All fields are mandatory'});
        }
      })
    }
    else {
      let sql3 = 'SELECT * FROM user WHERE user_id = ? AND user_is_deleted = 0';
      connection.query(sql3, [user_id], (error3, result3) => {
        if (error3) {
          throw error3;
        }
        else {
          let sql1 = `UPDATE user SET user_name = ?, user_lastname = ?, user_description = ?, user_phone = ? WHERE user_id = ${user_id}`;
          let values = [user_name, user_lastname, user_description, user_phone];
          if (req.file) {
            sql1 = `UPDATE user SET user_name = ?, user_lastname = ?, user_description = ?, user_phone = ?, user_img = ? WHERE user_id = ${user_id}`;
            values = [user_name, user_lastname, user_description, user_phone,req.file.filename];
            if (result3[0].user_img) {
              deleteFile(result3[0].user_img, 'user');
            }
      }
      connection.query(sql1, values, (error1, result1) => {
        if (error1) {
          throw error1;
        }
        else {
          res.redirect(`/user/oneUser/${user_id}`);
        }
      });
        }
      })
    }
  }

  logicDelete = (req,res) => {
    const {user_id} = req.params;
    let sql = 'UPDATE user SET user_is_deleted = 1 WHERE user_id = ?';
    connection.query(sql,[user_id], (error, result) => {
      if (error) {
        throw error;
      }
      else {
        let sql1 = 'UPDATE pet SET pet_is_deleted = 1 WHERE pet.user_id = ?';
        connection.query(sql1, [user_id], (error1, result1) => {
          if (error1) {
            throw error1;
          }
          else {
            res.redirect('/user/allUsers');
          }
        })
      }
    })
  }

  totalDelete = (req,res) => {
    const {user_id} = req.params;
    let sql = 'SELECT pet_img FROM pet WHERE pet.user_id = ?';
    connection.query(sql,[user_id], (error, result) => {
      if (error) {
        throw error;
      }
      else {
        let sql1 = 'SELECT user_img FROM user WHERE user_id = ?';
        connection.query(sql1, [user_id], (error1, result1) => {
          if (error1) {
            throw error1;
          }
          else {
            let sql2 = 'DELETE FROM user WHERE user_id = ?';
            connection.query(sql2, [user_id], (error2, result2) => {
              if (error2) {
                throw error2;
              }
              else {
                if (result1[0].user_img) {
                  deleteFile(result1[0].user_img, 'user')
                }
                for (let photo of result) {
                  if (photo.pet_img) {
                    deleteFile(photo.pet_img, 'pet')
                  }
                }
                res.redirect('/user/allUsers');
              }
            })
          }
        })
      }
    })
  }

  updateLogic = (req,res) => {
    const {user_id} = req.params;
    let sql = 'UPDATE user SET user_is_deleted = 0';
    connection.query(sql,[user_id], (error, result) => {
      if (error) {
        throw error;
      }
      else {
        let sql1 = 'UPDATE pet SET pet_is_deleted = 0 WHERE pet.user_id = ?';
        connection.query(sql1, [user_id], (error1, result1) => {
          if (error1) {
            throw error1;
          }
          else {
            res.redirect('/user/allUsers');
          }
        })
      }
    })
  }
}

module.exports = new UserController();