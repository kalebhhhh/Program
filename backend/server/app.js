const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

const db = require("../Dados/models/db");
const Products = require("../Dados/models/products");
const initAssociations = require("../Dados/models/associations");
const clientesRoutes = require("./routes/clientesRoutes");
const pedidosRoutes = require("./routes/pedidosRoutes");

const aplic = express();

initAssociations();

aplic.use(cors());
aplic.use(bodyParser.urlencoded({ extended: false }));
aplic.use(bodyParser.json());
aplic.use("/uploads", express.static(path.join(__dirname, "uploads")));
aplic.use("/uploads", express.static(path.join(__dirname, "..", "Dados", "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const baseDir = "uploads";
    const uploadDir = path.join(__dirname, baseDir, "imgProducts");
    fs.mkdirSync(uploadDir, { recursive: true });
    req.uploadDir = uploadDir;
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = Date.now() + "-" + file.originalname;
    cb(null, filename);
  }
});
const upload = multer({ storage });

aplic.get("/search-images", async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: "Informe um termo de pesquisa (q)" });
  }

  try {
    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google_images",
        q: query,
        api_key: "0c9b9b837ee9e0eb3fce50447f69defcdef27d139d0b82e23da7f4ae448b7c4c"
      }
    });

    res.json(response.data.images_results);
  } catch (err) {
    console.error("Erro ao buscar imagens:", err.message);
    res.status(500).json({ error: "Erro ao buscar imagens" });
  }
});

aplic.post("/baixar-imagem/:id", async (req, res) => {
  const { imageUrl } = req.body;
  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const ext = path.extname(imageUrl).split("?")[0] || ".jpg";
    const filename = Date.now() + ext;
    const uploadDir = path.join(__dirname, "uploads", "imgProducts");
    fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(path.join(uploadDir, filename), response.data);

    await Products.update({ image: filename }, { where: { id: req.params.id } });
    const products = await Products.findAll();
    res.json({ products });
  } catch (err) {
    console.error("Erro ao baixar imagem:", err);
    res.status(500).send("Erro ao baixar imagem");
  }
});

aplic.post("/upload", upload.array("arquivo", 10), (req, res) => {
  if (!req.files) return res.status(401).json({ message: "arquivo inválido" });
  return res.json({ message: "arquivo enviado" });
});

aplic.patch("/atualizar-imagem/:id", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("Nenhum arquivo enviado");

    await Products.update({ image: req.file.filename }, { where: { id: req.params.id } });
    const products = await Products.findAll();
    res.json({ products });
  } catch (err) {
    res.status(500).send("Erro ao atualizar imagem: " + err);
  }
});

aplic.post("/cadastro", upload.single("image"), async (req, res) => {
  try {
    if (!req.body.name || !req.body.estoque || !req.body.description || !req.body.price) {
      return res.status(400).send("Todos os campos são obrigatórios");
    }
    const imagePath = req.file ? req.file.filename : null;

    await Products.create({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      estoque: req.body.estoque,
      categoria: req.body.categoria || "",
      image: imagePath
    });

    const products = await Products.findAll();
    res.json({ products });
  } catch (err) {
    res.status(500).send("Erro: " + err);
  }
});

aplic.get("/", (req, res) => {
  Products.findAll()
    .then((products) => res.json({ products }))
    .catch((err) => res.status(500).send("Erro ao acessar produtos: " + err));
});

aplic.patch("/atualizar/:id", upload.single("image"), async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      estoque: req.body.estoque,
      categoria: req.body.categoria || ""
    };

    if (req.file) updateData.image = req.file.filename;

    await Products.update(updateData, { where: { id: req.params.id } });
    const products = await Products.findAll();
    res.json({ products });
  } catch (err) {
    res.status(500).send("Erro ao atualizar: " + err);
  }
});

aplic.delete("/deletar/:id", async (req, res) => {
  try {
    await Products.destroy({ where: { id: req.params.id } });
    const products = await Products.findAll();
    res.json({ products });
  } catch (err) {
    res.status(500).send("Erro ao deletar: " + err);
  }
});

aplic.use("/clientes", clientesRoutes);
aplic.use("/pedidos", pedidosRoutes);

(async () => {
  try {
    await db.sequelize.sync({ alter: true, logging: false });
    aplic.listen(3322, () => console.log("API rodando na porta 3322"));
  } catch (error) {
    console.error("Erro ao conectar com o banco de dados:", error);
  }
})();