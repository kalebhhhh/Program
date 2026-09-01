const Clientes = require("../../Dados/models/clientes");

async function listarClientes(req, res) {
  try {
    const clientes = await Clientes.findAll({ order: [["nome", "ASC"]] });
    return res.json({ clientes });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao listar clientes" });
  }
}

async function buscarCliente(req, res) {
  try {
    const cliente = await Clientes.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ message: "Cliente não encontrado" });
    return res.json({ cliente });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao buscar cliente" });
  }
}

async function criarCliente(req, res) {
  try {
    const cliente = await Clientes.create(req.body);
    return res.status(201).json({ cliente, message: "Cliente criado com sucesso" });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao criar cliente" });
  }
}

async function editarCliente(req, res) {
  try {
    const cliente = await Clientes.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ message: "Cliente não encontrado" });
    await cliente.update(req.body);
    return res.json({ cliente, message: "Cliente atualizado com sucesso" });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao atualizar cliente" });
  }
}

async function excluirCliente(req, res) {
  try {
    const cliente = await Clientes.findByPk(req.params.id);
    if (!cliente) return res.status(404).json({ message: "Cliente não encontrado" });
    await cliente.destroy();
    return res.json({ message: "Cliente removido com sucesso" });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao excluir cliente" });
  }
}

module.exports = {
  listarClientes,
  buscarCliente,
  criarCliente,
  editarCliente,
  excluirCliente
};
