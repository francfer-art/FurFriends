var express = require('express');
var router = express.Router();
const usercontroller = require('../controllers/userController');
const multer = require('../middleware/multer');

router.get('/addUser',usercontroller.showFormAddUser);
router.post('/addUser',multer('user'),usercontroller.addUser);
router.get('/login', usercontroller.login);
router.post('/login', usercontroller.checkLogin);
router.get('/allUsers', usercontroller.allUsers);
router.get('/oneUser/:user_id', usercontroller.oneUser);
router.get('/editUser/:user_id', usercontroller.editForm);
router.post('/editUser/:user_id',multer('user') ,usercontroller.updateForm);
router.get('/logicDeleteUser/:user_id', usercontroller.logicDelete);
router.get('/DeleteUser/:user_id', usercontroller.totalDelete);
router.get('/updateLogic/:user_id', usercontroller.updateLogic);
module.exports = router;