const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const { sequelize } = require("../../Dados/models/db");
const Products = require("../../Dados/models/products");
const Pedidos = require("../../Dados/models/pedidos");
const PedidoItens = require("../../Dados/models/pedidoItens");
const Clientes = require("../../Dados/models/clientes");
const pedidoRepository = require("../repositories/pedidoRepository");

const PIX_KEY = process.env.PIX_KEY || "00000000000";
const EMPRESA = {
  nome: "PDV Sistema",
  cnpj: "12.345.678/0001-99",
  telefone: "(11) 99999-9999",
  endereco: "Rua da Comercial, 123 - Centro"
};

function toNumber(value) {
  return Number(value || 0);
}

function isValidNumero(value) {
  return Number.isFinite(Number(value)) && Number(value) > 0;
}

function normalizeItem(item) {
  return {
    produtoId: item.produtoId ? Number(item.produtoId) : null,
    nomeProduto: String(item.nomeProduto || "").trim(),
    quantidade: Number(item.quantidade || 0),
    valorUnitario: Number(item.valorUnitario || 0),
    valorTotal: Number(item.valorTotal || 0)
  };
}

function buildPixPayload(amount, key = PIX_KEY) {
  const valor = Number(amount || 0).toFixed(2);
  const valorSemMascara = valor.replace(".", "");
  const chavePix = String(key || "00000000000");
  const identificador = "PDV Sistema".slice(0, 25);
  const cidade = "Sao Paulo".slice(0, 15);

  const merchantAccountInfo = [
    "26",
    String(("0014br.gov.bcb.pix01" + chavePix.length + chavePix).length + 4).padStart(2, "0"),
    "00",
    "14",
    "br.gov.bcb.pix",
    "01",
    String(chavePix.length).padStart(2, "0"),
    chavePix
  ].join("");

  const payload = [
    "000201",
    "010212",
    merchantAccountInfo,
    "52040000",
    `5405${valorSemMascara}`,
    "5802BR",
    `5909${identificador}`,
    `60${String(cidade.length + 5).padStart(2, "0")}${cidade}`,
    "62070503",
    "***",
    "6304"
  ].join("");

  return payload;
}

async function gerarQrCodePix(valorTotal) {
  const payload = buildPixPayload(valorTotal, PIX_KEY);
  const qrCode = await QRCode.toDataURL(payload);

  return {
    pixQrCode: qrCode,
    pixCopiaCola: payload
  };
}

async function validarEstoqueItens(itens) {
  const itensSemEstoque = [];

  for (const item of itens) {
    const produto = await Products.findByPk(item.produtoId);
    if (!produto) {
      itensSemEstoque.push({ nomeProduto: item.nomeProduto || "Item não identificado", motivo: "Produto não encontrado" });
      continue;
    }

    if (produto.estoque < item.quantidade) {
      itensSemEstoque.push({
        nomeProduto: produto.name,
        quantidadeDisponivel: Number(produto.estoque || 0),
        quantidadeSolicitada: Number(item.quantidade || 0)
      });
    }
  }

  if (itensSemEstoque.length > 0) {
    const mensagem = itensSemEstoque
      .map((item) => item.nomeProduto ? `${item.nomeProduto}: estoque insuficiente` : item.motivo)
      .join("; ");
    const erro = new Error(`Estoque insuficiente para: ${mensagem}`);
    erro.statusCode = 400;
    erro.detalhes = itensSemEstoque;
    throw erro;
  }
}

async function gerarReciboPedido(pedido, itens, cliente) {
  const recibosDir = path.join(__dirname, "..", "uploads", "recibos");
  fs.mkdirSync(recibosDir, { recursive: true });

  const nomeArquivo = `recibo-pedido-${pedido.numeroPedido}.pdf`;
  const caminhoArquivo = path.join(recibosDir, nomeArquivo);

  const doc = new PDFDocument({ margin: 40, size: "A4" });
  const stream = fs.createWriteStream(caminhoArquivo);

  doc.pipe(stream);

  doc.fontSize(20).text(EMPRESA.nome, { align: "center" });
  doc.fontSize(10).text(`CNPJ: ${EMPRESA.cnpj}`);
  doc.text(`Telefone: ${EMPRESA.telefone}`);
  doc.text(`Endereço: ${EMPRESA.endereco}`);
  doc.moveDown();

  doc.fontSize(16).text(`Recibo / Pedido Nº ${pedido.numeroPedido}`);
  doc.fontSize(10).text(`Data: ${new Date(pedido.createdAt).toLocaleDateString("pt-BR")}`);
  doc.text(`Hora: ${new Date(pedido.createdAt).toLocaleTimeString("pt-BR")}`);
  doc.text(`Status: ${pedido.status}`);
  doc.text(`Forma de pagamento: ${pedido.formaPagamento}`);

  if (cliente) {
    doc.moveDown();
    doc.fontSize(14).text("Cliente");
    doc.fontSize(10).text(`Nome: ${cliente.nome || pedido.nomeCliente}`);
    doc.text(`CPF/CNPJ: ${cliente.cpf || cliente.cnpj || pedido.cpfCnpj || "Não informado"}`);
  }

  doc.moveDown();
  doc.fontSize(12).text("Produtos");
  doc.moveDown(0.5);

  const tableTop = doc.y;
  doc.fontSize(9);
  doc.text("Produto", 50, tableTop, { width: 180, continued: true });
  doc.text("Qtd", 255, tableTop, { width: 40, continued: true });
  doc.text("Unit.", 310, tableTop, { width: 80, continued: true });
  doc.text("Total", 395, tableTop, { width: 90 });

  let currentY = tableTop + 18;

  itens.forEach((item) => {
    doc.text(item.nomeProduto || "Produto", 50, currentY, { width: 180, continued: true });
    doc.text(String(item.quantidade), 255, currentY, { width: 40, continued: true });
    doc.text(`R$ ${Number(item.valorUnitario).toFixed(2)}`, 310, currentY, { width: 80, continued: true });
    doc.text(`R$ ${Number(item.valorTotal).toFixed(2)}`, 395, currentY, { width: 90 });
    currentY += 18;
  });

  doc.moveDown(2);
  doc.fontSize(10);
  doc.text(`Subtotal: R$ ${Number(pedido.subtotal || 0).toFixed(2)}`);
  doc.text(`Desconto: R$ ${Number(pedido.desconto || 0).toFixed(2)}`);
  doc.text(`Total Final: R$ ${Number(pedido.total || 0).toFixed(2)}`);
  doc.moveDown();
  doc.text("Obrigado pela preferência.");
  doc.text("Documento gerado automaticamente pelo sistema.");

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  return {
    nomeArquivo,
    caminhoArquivo,
    url: `/uploads/recibos/${nomeArquivo}`
  };
}

async function criarPedido(data) {
  const itens = (data.itens || []).map(normalizeItem);

  if (!itens.length) {
    const erro = new Error("Pedido sem itens");
    erro.statusCode = 400;
    throw erro;
  }

  itens.forEach((item) => {
    if (!item.nomeProduto || item.quantidade <= 0 || !isValidNumero(item.valorUnitario)) {
      throw Object.assign(new Error("Item inválido no pedido"), { statusCode: 400 });
    }
  });

  const subtotal = itens.reduce((sum, item) => sum + Number(item.valorUnitario || 0) * Number(item.quantidade || 0), 0);
  const total = Number(subtotal) - Number(data.desconto || 0);

  if (total <= 0) {
    const erro = new Error("Valor total do pedido deve ser maior que zero");
    erro.statusCode = 400;
    throw erro;
  }

  if (!data.formaPagamento) {
    const erro = new Error("Forma de pagamento obrigatória");
    erro.statusCode = 400;
    throw erro;
  }

  if (data.formaPagamento === "DINHEIRO") {
    const valorRecebido = Number(data.valorRecebido || 0);
    if (valorRecebido < total) {
      const erro = new Error("Valor recebido é menor que o valor total da compra");
      erro.statusCode = 400;
      throw erro;
    }
  }

  await validarEstoqueItens(itens);

  const cliente = data.clienteId ? await Clientes.findByPk(data.clienteId) : null;
  const numeroPedidoBase = await pedidoRepository.buscarUltimoNumeroPedido();
  const numeroPedido = numeroPedidoBase + 1;

  const pedidoPayload = {
    numeroPedido,
    clienteId: data.clienteId || null,
    nomeCliente: data.nomeCliente || (cliente ? cliente.nome : null),
    cpfCnpj: data.cpfCnpj || (cliente ? cliente.cpf || cliente.cnpj : null),
    subtotal: subtotal.toFixed(2),
    desconto: Number(data.desconto || 0).toFixed(2),
    total: total.toFixed(2),
    formaPagamento: data.formaPagamento,
    valorRecebido: data.formaPagamento === "DINHEIRO" ? Number(data.valorRecebido || 0).toFixed(2) : null,
    troco: data.formaPagamento === "DINHEIRO" ? (Number(data.valorRecebido || 0) - total).toFixed(2) : 0,
    status: "AGUARDANDO_PAGAMENTO",
    observacoes: data.observacoes || "",
    pixQrCode: null,
    pixCopiaCola: null
  };

  const resultado = await sequelize.transaction(async (transaction) => {
    const novoPedido = await pedidoRepository.criarPedido({ ...pedidoPayload }, transaction);

    const itensPedido = itens.map((item) => ({
      pedidoId: novoPedido.id,
      produtoId: item.produtoId,
      nomeProduto: item.nomeProduto,
      quantidade: item.quantidade,
      valorUnitario: Number(item.valorUnitario).toFixed(2),
      valorTotal: (Number(item.valorUnitario) * Number(item.quantidade)).toFixed(2)
    }));

    await pedidoRepository.criarItensPedido(itensPedido, transaction);

    for (const item of itens) {
      const produto = await Products.findByPk(item.produtoId, { transaction });
      if (!produto) {
        throw Object.assign(new Error(`Produto ${item.nomeProduto || item.produtoId} não encontrado`), { statusCode: 400 });
      }

      const novaQuantidade = Number(produto.estoque || 0) - Number(item.quantidade || 0);
      if (novaQuantidade < 0) {
        throw Object.assign(new Error(`Estoque insuficiente para ${produto.name}`), { statusCode: 400 });
      }

      await pedidoRepository.atualizarEstoqueProduto(produto.id, novaQuantidade, transaction);
    }

    if (data.formaPagamento === "PIX") {
      const pix = await gerarQrCodePix(total);
      await novoPedido.update({
        pixQrCode: pix.pixQrCode,
        pixCopiaCola: pix.pixCopiaCola
      }, { transaction });
    }

    const pedidoAtualizado = await pedidoRepository.buscarPedidoPorId(novoPedido.id, transaction);
    if (!pedidoAtualizado) {
      throw Object.assign(new Error("Pedido não foi encontrado após a criação."), { statusCode: 500 });
    }

    const itensPedidoAtualizados = pedidoAtualizado.itens || [];
    const recibo = await gerarReciboPedido(pedidoAtualizado, itensPedidoAtualizados, cliente);

    await novoPedido.update({
      observacoes: JSON.stringify({ recibo })
    }, { transaction });

    return {
      ...pedidoAtualizado.toJSON(),
      itens: itensPedidoAtualizados,
      recibo
    };
  });

  return resultado;
}

async function listarPedidosPorStatus(status) {
  const pedidos = await pedidoRepository.listarPedidos({ status });
  return pedidos.map((pedido) => ({
    ...pedido.toJSON(),
    itens: pedido.itens || []
  }));
}

async function listarTodosPedidos() {
  const pedidos = await pedidoRepository.listarPedidos();
  return pedidos.map((pedido) => ({
    ...pedido.toJSON(),
    itens: pedido.itens || []
  }));
}

async function confirmarPagamento(id) {
  const pedido = await pedidoRepository.buscarPedidoPorId(id);
  if (!pedido) {
    const erro = new Error("Pedido não encontrado");
    erro.statusCode = 404;
    throw erro;
  }

  pedido.status = "CONCLUIDO";
  await pedido.save();
  return pedido;
}

async function alterarStatusPedido(id, status) {
  const pedido = await pedidoRepository.atualizarStatusPedido(id, status);
  if (!pedido) {
    const erro = new Error("Pedido não encontrado");
    erro.statusCode = 404;
    throw erro;
  }

  return pedido;
}

async function buscarPedido(id) {
  const pedido = await pedidoRepository.buscarPedidoPorId(id);
  if (!pedido) {
    const erro = new Error("Pedido não encontrado");
    erro.statusCode = 404;
    throw erro;
  }

  return pedido;
}

module.exports = {
  criarPedido,
  listarTodosPedidos,
  listarPedidosPorStatus,
  confirmarPagamento,
  alterarStatusPedido,
  buscarPedido,
  gerarReciboPedido
};
