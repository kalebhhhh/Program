const db = require("./db");

const Products = db.sequelize.define("products",{
    name: {
        type: db.Sequelize.STRING,
        allowNull: false
    },

    price: {
        type: db.Sequelize.DOUBLE,
        allowNull: false
    },

    description: {
        type: db.Sequelize.TEXT,
    },

    estoque: {
        type: db.Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
    },
    image: {
        type: db.Sequelize.STRING,
    }
    

});

Products.sync({force: false});

module.exports = Products;