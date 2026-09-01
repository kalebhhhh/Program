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
        allowNull: true
    },

    categoria: {
        type: db.Sequelize.STRING,
        allowNull: true,
        defaultValue: ""
    },

    estoque: {
        type: db.Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 0
    },
    image: {
        type: db.Sequelize.STRING,
        allowNull: true
    }
    

});
module.exports = Products;