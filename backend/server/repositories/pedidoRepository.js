const { Op } = require("sequelize");
const Pedidos = require("../../Dados/models/pedidos");
const PedidoItens = require("../../Dados/models/pedidoItens");
const Clientes = require("../../Dados/models/clientes");
const Products = require("../../Dados/models/products");

const includePedido = [
  {
    model: Clientes,
    as: "cliente",
    attributes: ["id", "nome", "tipoPessoa", "cpf", "cnpj", "telefone", "email"]
  },
  {
    model: PedidoItens,
    as: "itens",
    include: [{ model: Products, as: "produto", attributes: ["id", "name", "price", "estoque"] }]
  }
];

async function listarPedidos(filtros = {}) {
  const where = {};

  if (filtros.status) {
    where.status = filtros.status;
  }

  if (filtros.clienteId) {
    where.clienteId = filtros.clienteId;
  }

  return Pedidos.findAll({
    where,
    include: includePedido,
    order: [["createdAt", "DESC"]]
  });
}

async function buscarPedidoPorId(id, transaction = null) {
  const options = { include: includePedido };
  if (transaction) {
    options.transaction = transaction;
  }

  return Pedidos.findByPk(id, options);
}

async function buscarUltimoNumeroPedido() {
  const ultimo = await Pedidos.findOne({
    order: [["numeroPedido", "DESC"]],
    attributes: ["numeroPedido"]
  });

  return ultimo ? Number(ultimo.numeroPedido) : 0;
}

async function criarPedido(dadosPedido, transaction = null) {
  return Pedidos.create(dadosPedido, transaction ? { transaction } : {});
}

async function criarItensPedido(itens, transaction = null) {
  return PedidoItens.bulkCreate(itens, transaction ? { transaction } : {});
}

async function atualizarPedido(id, dadosPedido) {
  const pedido = await Pedidos.findByPk(id);
  if (!pedido) return null;

  await pedido.update(dadosPedido);
  return pedido;
}

async function atualizarStatusPedido(id, status) {
  const pedido = await Pedidos.findByPk(id);
  if (!pedido) {
    return null;
  }

  pedido.status = status;
  await pedido.save();
  return pedido;
}

async function listarItensPedidoPorPedido(pedidoId) {
  return PedidoItens.findAll({
    where: { pedidoId },
    include: [{ model: Products, as: "produto", attributes: ["id", "name", "price", "estoque"] }],
    order: [["createdAt", "ASC"]]
  });
}

async function atualizarEstoqueProduto(produtoId, novaQuantidade, transaction = null) {
  const produto = await Products.findByPk(produtoId, transaction ? { transaction } : {});
  if (!produto) {
    return null;
  }

  produto.estoque = novaQuantidade;
  await produto.save({ transaction });
  return produto;
}

module.exports = {
  listarPedidos,
  buscarPedidoPorId,
  buscarUltimoNumeroPedido,
  criarPedido,
  criarItensPedido,
  atualizarPedido,
  atualizarStatusPedido,
  atualizarEstoqueProduto,
  listarItensPedidoPorPedido
};
