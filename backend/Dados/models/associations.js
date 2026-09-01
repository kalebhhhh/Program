const Clientes = require("./clientes");
const Pedidos = require("./pedidos");
const PedidoItens = require("./pedidoItens");
const Products = require("./products");

function initAssociations() {
  Clientes.hasMany(Pedidos, {
    foreignKey: "clienteId",
    as: "pedidos"
  });

  Pedidos.belongsTo(Clientes, {
    foreignKey: "clienteId",
    as: "cliente"
  });

  Pedidos.hasMany(PedidoItens, {
    foreignKey: "pedidoId",
    as: "itens"
  });

  PedidoItens.belongsTo(Pedidos, {
    foreignKey: "pedidoId",
    as: "pedido"
  });

  Products.hasMany(PedidoItens, {
    foreignKey: "produtoId",
    as: "pedidoItens"
  });

  PedidoItens.belongsTo(Products, {
    foreignKey: "produtoId",
    as: "produto"
  });
}

module.exports = initAssociations;
