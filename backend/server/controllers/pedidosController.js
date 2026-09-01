const pedidoService = require("../services/pedidoService");

async function listarPedidos(req, res) {
  try {
    const pedidos = await pedidoService.listarTodosPedidos();
    return res.json({ pedidos });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Erro ao listar pedidos" });
  }
}

async function listarPendentes(req, res) {
  try {
    const pedidos = await pedidoService.listarPedidosPorStatus("AGUARDANDO_PAGAMENTO");
    return res.json({ pedidos });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Erro ao listar pedidos pendentes" });
  }
}

async function listarConcluidos(req, res) {
  try {
    const pedidos = await pedidoService.listarPedidosPorStatus("CONCLUIDO");
    return res.json({ pedidos });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Erro ao listar pedidos concluídos" });
  }
}

async function buscarPedido(req, res) {
  try {
    const pedido = await pedidoService.buscarPedido(req.params.id);
    return res.json({ pedido });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Erro ao buscar pedido" });
  }
}

async function criarPedido(req, res) {
  try {
    const pedido = await pedidoService.criarPedido(req.body);
    return res.status(201).json({ pedido, message: "Pedido criado com sucesso" });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Erro ao criar pedido" });
  }
}

async function alterarStatusPedido(req, res) {
  try {
    const pedido = await pedidoService.alterarStatusPedido(req.params.id, req.body.status);
    return res.json({ pedido, message: "Status atualizado" });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Erro ao atualizar status" });
  }
}

async function confirmarPagamento(req, res) {
  try {
    const pedido = await pedidoService.confirmarPagamento(req.params.id);
    return res.json({ pedido, message: "Pagamento confirmado" });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Erro ao confirmar pagamento" });
  }
}

async function gerarRecibo(req, res) {
  try {
    const pedido = await pedidoService.buscarPedido(req.params.id);
    const pedidoJSON = pedido.toJSON ? pedido.toJSON() : pedido;
    const cliente = pedidoJSON.cliente || null;
    const produtos = pedidoJSON.itens || [];
    const recibo = await pedidoService.gerarReciboPedido(pedidoJSON, produtos, cliente);
    return res.json({ recibo, message: "Recibo gerado" });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Erro ao gerar recibo" });
  }
}

async function baixarRecibo(req, res) {
  try {
    const pedido = await pedidoService.buscarPedido(req.params.id);
    const pedidoJSON = pedido.toJSON ? pedido.toJSON() : pedido;
    const cliente = pedidoJSON.cliente || null;
    const produtos = pedidoJSON.itens || [];
    const recibo = await pedidoService.gerarReciboPedido(pedidoJSON, produtos, cliente);
    return res.download(recibo.caminhoArquivo);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Erro ao baixar recibo" });
  }
}

module.exports = {
  listarPedidos,
  listarPendentes,
  listarConcluidos,
  buscarPedido,
  criarPedido,
  alterarStatusPedido,
  confirmarPagamento,
  gerarRecibo,
  baixarRecibo
};
