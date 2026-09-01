const db = require("./db");

const Pedidos = db.sequelize.define(
  "pedidos",
  {
    id: {
      type: db.Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    numeroPedido: {
      type: db.Sequelize.INTEGER,
      allowNull: false,
      unique: true
    },
    clienteId: {
      type: db.Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "clientes",
        key: "id"
      }
    },
    nomeCliente: {
      type: db.Sequelize.STRING,
      allowNull: true
    },
    cpfCnpj: {
      type: db.Sequelize.STRING,
      allowNull: true
    },
    subtotal: {
      type: db.Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    desconto: {
      type: db.Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    total: {
      type: db.Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    formaPagamento: {
      type: db.Sequelize.ENUM("PIX", "DINHEIRO", "CARTAO_CREDITO", "CARTAO_DEBITO"),
      allowNull: false,
      defaultValue: "DINHEIRO"
    },
    valorRecebido: {
      type: db.Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    },
    troco: {
      type: db.Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    },
    pixQrCode: {
      type: db.Sequelize.TEXT,
      allowNull: true
    },
    pixCopiaCola: {
      type: db.Sequelize.TEXT,
      allowNull: true
    },
    status: {
      type: db.Sequelize.ENUM("AGUARDANDO_PAGAMENTO", "CONCLUIDO", "CANCELADO"),
      allowNull: false,
      defaultValue: "AGUARDANDO_PAGAMENTO"
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
    tableName: "pedidos",
    timestamps: true,
    underscored: false
  }
);

module.exports = Pedidos;
