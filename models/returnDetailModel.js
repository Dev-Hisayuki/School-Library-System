const ReturnDetail = {
    validateCondition: (condition) => {
        return ['Good', 'Damaged', 'Lost'].includes(condition);
    }
};

module.exports = ReturnDetail;