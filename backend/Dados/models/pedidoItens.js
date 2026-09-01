const db = require("./db");

const PedidoItens = db.sequelize.define(
  "pedido_itens",
  {
    id: {
      type: db.Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    pedidoId: {
      type: db.Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "pedidos",
        key: "id"
      }
    },
    produtoId: {
      type: db.Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "products",
        key: "id"
      }
    },
    nomeProduto: {
      type: db.Sequelize.STRING,
      allowNull: false
    },
    quantidade: {
      type: db.Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    valorUnitario: {
      type: db.Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    valorTotal: {
      type: db.Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
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
    tableName: "pedido_itens",
    timestamps: true,
    underscored: false
  }
);

module.exports = PedidoItens;
