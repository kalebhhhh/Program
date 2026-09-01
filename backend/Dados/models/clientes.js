const db = require("./db");

const Clientes = db.sequelize.define(
  "clientes",
  {
    id: {
      type: db.Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nome: {
      type: db.Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    tipoPessoa: {
      type: db.Sequelize.ENUM("FISICA", "JURIDICA"),
      allowNull: false,
      defaultValue: "FISICA"
    },
    cpf: {
      type: db.Sequelize.STRING,
      allowNull: true
    },
    cnpj: {
      type: db.Sequelize.STRING,
      allowNull: true
    },
    telefone: {
      type: db.Sequelize.STRING,
      allowNull: true
    },
    email: {
      type: db.Sequelize.STRING,
      allowNull: true
    },
    endereco: {
      type: db.Sequelize.STRING,
      allowNull: true
    },
    observacoes: {
      type: db.Sequelize.TEXT,
      allowNull: true
    },
    createdAt: {
      type: db.Sequelize.DATE,
      allowNull: false,
      defaultValue: db.Sequelize.NOW
    },
    updatedAt: {
      type: db.Sequelize.DATE,
      allowNull: false,
      defaultValue: db.Sequelize.NOW
    }
  },
  {
    tableName: "clientes",
    timestamps: true,
    underscored: false
  }
);

module.exports = Clientes;