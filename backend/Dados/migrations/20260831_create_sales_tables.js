const db = require("../models/db");
const Clientes = require("../models/clientes");
const Pedidos = require("../models/pedidos");
const PedidoItens = require("../models/pedidoItens");
const Products = require("../models/products");
const initAssociations = require("../models/associations");

module.exports = {
  up: async () => {
    initAssociations();
    await db.sequelize.sync({ alter: true, logging: false });
    console.log("Migração de tabelas de vendas concluída");
  },
  down: async () => {
    await PedidoItens.drop();
    await Pedidos.drop();
    await Clientes.drop();
    console.log("Rollback das tabelas de vendas concluído");
  }
};
