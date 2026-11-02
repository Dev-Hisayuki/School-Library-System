const express = require('express');
const router = express.Router();

const studentController = require('../controllers/studentController');

// GET all students
router.get('/', studentController.getAllStudents);

// GET one student
router.get('/:id', studentController.getStudentById);

// REGISTER student
router.post('/', studentController.createStudent);

// UPDATE student
router.put('/:id', studentController.updateStudent);

// DELETE student
router.delete('/:id', studentController.deleteStudent);

module.exports = router;