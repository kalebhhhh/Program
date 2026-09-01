const express = require("express");
const clientesController = require("../controllers/clientesController");

const router = express.Router();

router.get("/", clientesController.listarClientes);
router.get("/:id", clientesController.buscarCliente);
router.post("/", clientesController.criarCliente);
router.put("/:id", clientesController.editarCliente);
router.delete("/:id", clientesController.excluirCliente);

module.exports = router;
