const connection = require('../config/db');
const deleteFile = require('../utils/deletefile');

class PetController {

  showFormAddPet = (req, res) => {
    let sql = 'SELECT user_id, user_name FROM user WHERE user_is_deleted = 0';
    connection.query(sql,(error, result) => {
      if (error) {
        throw error;
      }
      else {
        res.render('formAddPet', {result});
      }
    })
  }

  showAllPets = (req,res) => {
    let sql = 'SELECT * FROM pet WHERE pet_is_deleted = 0 ORDER BY pet_likes DESC';
    connection.query(sql, (error, result) => {
      if (error) {
        throw error;
      }
      else {
        res.render('allPets', {result});
      }
    })
  }

  addPet = (req,res) => {
    const {pet_name, pet_description, pet_species, pet_adoption_year, user_id} = req.body;
    if (!pet_name || !pet_description || !pet_species || !pet_adoption_year || !user_id) {
      let sql = 'SELECT user_id, user_name FROM user WHERE user_is_deleted = 0';
      
      connection.query(sql, (error,result) => {
        if (error) {
          throw error;
        }
        else {
          res.render('formAddPet', {result,message: 'All fields are mandatory'});
        }
      }) 
    }
    else {
      let sql1 = 'INSERT INTO pet (pet_name,pet_description,pet_species,pet_adoption_year,user_id) VALUES (?,?,?,?,?)';
      let values = [pet_name,pet_description,pet_species,pet_adoption_year,user_id];
      if (req.file) {
        sql1 = 'INSERT INTO pet (pet_name,pet_description,pet_species,pet_adoption_year,user_id,pet_img) VALUES (?,?,?,?,?,?)';
        values = [pet_name,pet_description,pet_species,pet_adoption_year,user_id,req.file.filename];
      }
      connection.query(sql1, values, (error1, result1) => {
        if (error1) {
          throw error1;
        }
        else {
          res.redirect('/');
        }
      })
    }
  }
  
  like = (req,res) => {
    const {pet_id} = req.params;
    let sql = 'UPDATE pet SET pet_likes = pet_likes + 1 WHERE pet_id = ? AND pet_is_deleted = 0'
    connection.query(sql,[pet_id], (error, result) => {
      if (error) {
        throw error;
      }
      else {
        let sql1 = 'SELECT pet.user_id FROM user,pet WHERE pet.user_id = user.user_id AND pet_is_deleted = 0 AND user_is_deleted = 0 AND pet_id = ?';
        connection.query(sql1, [pet_id], (error1, result1) => {
          if (error1) {
            throw error1;
          }
          else {
            res.redirect(`/user/oneUser/${result1[0].user_id}`);
          }
        })
      }
    })
  }

  editPet = (req,res) => {
    const {pet_id} = req.params;
    let sql = 'SELECT * FROM pet WHERE pet_id = ? AND pet_is_deleted = 0';
    connection.query(sql,[pet_id], (error,result) => {
      if (error) {
        throw error;
      }
      else {
        res.render('editOnePet', {result: result[0]})
      }
    })
  }

  updatePet = (req,res) => {
    const {pet_id} = req.params;
    const {pet_name, pet_specie, pet_description, pet_adoption_year} = req.body;
    if (!pet_name || !pet_specie || !pet_description || !pet_adoption_year) {
      let sql = 'SELECT * FROM pet WHERE pet_id = ?';
        connection.query(sql,[pet_id], (error1, result) => {
          if (error1) {
            throw error1;
          }
          else {
            res.render('editOnePet', {result: result[0],message: 'All fields are mandatory'})
          }
        })
    }
    else {
      let sql2 = 'SELECT pet.user_id, pet_img FROM pet WHERE pet_id = ?';
        connection.query(sql2,[pet_id], (error2, result2) => {
          if (error2) {
            throw error2;
          }
          else {
            let user_id = result2[0].user_id;
            let sql1 = 'UPDATE pet SET pet_name = ?, pet_species = ?, pet_description = ?, pet_adoption_year = ? WHERE pet_id = ? AND pet_is_deleted = 0';
            let values = [pet_name, pet_specie, pet_description, pet_adoption_year,pet_id];
            if(req.file) {
              sql1 = `UPDATE pet SET pet_name = ?, pet_species = ?, pet_description = ?, pet_adoption_year = ?, pet_img = ? WHERE pet_id = ? AND pet_is_deleted = 0`;
              values = [pet_name, pet_specie, pet_description, pet_adoption_year,req.file.filename,pet_id];
              let pet_img = result2[0].pet_img;
              if (pet_img) {
                deleteFile(pet_img, 'pet');
              }
            }
          connection.query(sql1,values, (error, result1) => {
          if (error) {
            throw error;
          }
          else {
            res.redirect(`/user/oneUser/${user_id}`);
          }
          })
          }
        })
    }
  }

  logicDelete = (req,res) => {
    const {pet_id, user_id} = req.params;
    let sql = 'UPDATE pet SET pet_is_deleted = 1 WHERE pet_id = ?';
    connection.query(sql,[pet_id], (error, result) => {
      if (error) {
        throw error;
      }
      else {
        res.redirect(`/user/oneUser/${user_id}`);
      }
    })
  }

  totalDelete = (req,res) => {
    const {pet_id, user_id} = req.params;
    let sql1 = 'SELECT pet_img FROM pet WHERE pet_id = ?';
    connection.query(sql1,[pet_id], (error1, result1) => {
      if (error1) {
        throw error1
      }
      else {
        if (result1[0].pet_img) {
          deleteFile(result1[0].pet_img, 'pet');
        }
        let sql = 'DELETE FROM pet WHERE pet_id = ?';
        connection.query(sql, [pet_id], (error, result) => {
          if (error) {
            throw error;
          }
          else {
            res.redirect(`/user/oneUser/${user_id}`);
          }
        })
      }
    })
  }

  addPetUser = (req,res) => {
    const {user_id} = req.params;
    res.render('addPet',{result: user_id})
  }

  addPetUserDB = (req,res) => {
    const {user_id} = req.params;
    const {pet_name, pet_description, pet_species,pet_adoption_year} = req.body;
    let sql = 'INSERT INTO pet (pet_name,pet_description,pet_species,pet_adoption_year,user_id) VALUES (?,?,?,?,?)';
    let values = [pet_name,pet_description,pet_species,pet_adoption_year,user_id];
    if (req.file) {
        sql = 'INSERT INTO pet (pet_name,pet_description,pet_species,pet_adoption_year,user_id,pet_img) VALUES (?,?,?,?,?,?)';
        values = [pet_name,pet_description,pet_species,pet_adoption_year,user_id,req.file.filename];
    }
    connection.query(sql, values, (error, result) => {
      if (error) {
        throw error;
      }
      else {
        res.redirect(`/user/oneUser/${user_id}`);
      }
    })
  }

  logicUpdate = (req,res) => {
    const {pet_id} = req.params;
    let sql = 'UPDATE pet SET pet_is_deleted = 0 WHERE pet_id = ?';
    connection.query(sql, [pet_id], (error, result) => {
      if (error) {
        throw error;
      }
      else {
        res.redirect('/pet/allPets');
      }
    })
  }
}

module.exports = new PetController();