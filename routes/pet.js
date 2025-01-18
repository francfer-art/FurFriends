var express = require('express');
var router = express.Router();
const petcontroller = require('../controllers/petController');
const multer = require('../middleware/multer');

router.get('/allPets', petcontroller.showAllPets);

router.get('/addPet',petcontroller.showFormAddPet);

router.post('/addPet',multer('pet'),petcontroller.addPet);

router.post('/like/:pet_id', petcontroller.like);

router.get('/editPet/:pet_id', petcontroller.editPet);
router.post('/editPet/:pet_id',multer('pet') ,petcontroller.updatePet);

router.get('/logicDeletePet/:pet_id/:user_id', petcontroller.logicDelete);
router.get('/totalDelete/:pet_id/:user_id', petcontroller.totalDelete);

router.get('/addFormPet/:user_id', petcontroller.addPetUser);
router.post('/addFormPet/:user_id', multer('pet'),petcontroller.addPetUserDB);

router.get('/updateLogic/:pet_id', petcontroller.logicUpdate);

module.exports = router;