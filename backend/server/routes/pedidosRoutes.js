const express = require("express");
const pedidosController = require("../controllers/pedidosController");

const router = express.Router();

router.get("/", pedidosController.listarPedidos);
router.get("/pendentes", pedidosController.listarPendentes);
router.get("/concluidos", pedidosController.listarConcluidos);
router.get("/:id", pedidosController.buscarPedido);
router.post("/", pedidosController.criarPedido);
router.patch("/:id/status", pedidosController.alterarStatusPedido);
router.patch("/:id/confirmar-pagamento", pedidosController.confirmarPagamento);
router.get("/:id/pdf", pedidosController.gerarRecibo);
router.get("/:id/pdf/download", pedidosController.baixarRecibo);

module.exports = router;
