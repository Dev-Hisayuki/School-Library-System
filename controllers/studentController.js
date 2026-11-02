const studentModel = require('../models/studentModel');

const validateStudent = (student) => {
    if (!student.student_number || !student.student_name) {
        return 'Student number and full name are required.';
    }

    if (student.student_number.length > 30) {
        return 'Student number cannot exceed 30 characters.';
    }

    if (student.student_name.length > 150) {
        return 'Student name cannot exceed 150 characters.';
    }

    if (student.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
        return 'Please enter a valid email address.';
    }

    if (student.course.length > 100) {
        return 'Course cannot exceed 100 characters.';
    }

    if (student.year_level.length > 20) {
        return 'Year level cannot exceed 20 characters.';
    }

    if (student.contact_number.length > 30) {
        return 'Contact number cannot exceed 30 characters.';
    }

    return null;
};

const prepareStudent = (body) => ({
    student_number: String(body.student_number || '').trim(),
    student_name: String(body.student_name || '').trim(),
    email: String(body.email || '').trim(),
    course: String(body.course || '').trim(),
    year_level: String(body.year_level || '').trim(),
    contact_number: String(body.contact_number || '').trim()
});

const getAllStudents = async (req, res) => {
    try {
        const search = String(req.query.search || '').trim();
        const students = await studentModel.getAllStudents(search);

        return res.status(200).json({
            success: true,
            data: students
        });
    } catch (error) {
        console.error('Get students error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve students.'
        });
    }
};

const getStudentById = async (req, res) => {
    try {
        const student = await studentModel.getStudentById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found.'
            });
        }

        return res.status(200).json({
            success: true,
            data: student
        });
    } catch (error) {
        console.error('Get student error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve student.'
        });
    }
};

const createStudent = async (req, res) => {
    try {
        const student = prepareStudent(req.body);
        const validationError = validateStudent(student);

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        const studentId = await studentModel.createStudent(student);

        return res.status(201).json({
            success: true,
            message: 'Student registered successfully.',
            data: {
                student_id: studentId
            }
        });
    } catch (error) {
        console.error('Create student error:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Student number or email already exists.'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to register student.'
        });
    }
};

const updateStudent = async (req, res) => {
    try {
        const student = prepareStudent(req.body);
        const validationError = validateStudent(student);

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        const affectedRows = await studentModel.updateStudent(
            req.params.id,
            student
        );

        if (!affectedRows) {
            const existingStudent = await studentModel.getStudentById(req.params.id);

            if (!existingStudent) {
                return res.status(404).json({
                    success: false,
                    message: 'Student not found.'
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Student updated successfully.'
        });
    } catch (error) {
        console.error('Update student error:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Student number or email already exists.'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to update student.'
        });
    }
};

const deleteStudent = async (req, res) => {
    try {
        const affectedRows = await studentModel.deleteStudent(req.params.id);

        if (!affectedRows) {
            return res.status(404).json({
                success: false,
                message: 'Student not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Student deleted successfully.'
        });
    } catch (error) {
        console.error('Delete student error:', error);

        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                success: false,
                message: 'This student has existing library records and cannot be deleted.'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to delete student.'
        });
    }
};

module.exports = {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent
};