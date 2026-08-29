import { useState, useEffect } from 'react'
import './style.css'
import './editstyles.css'
import IconsProduct from './icos/caixa.png';
import IconsPedido from './icos/adicionar-produto.png';
import IconsBar from './icos/bar-chart.png';
import IconsUser from './icos/multiple-users-silhouette.png'
import IconConfig from './icos/config.com.png'
import IcoDelete from './icos/deleteico2.png'
import './carousels.css'
import axios from "axios";



function Home() {
// Estados
const [searchTerm, setSearchTerm] = useState("");
const [products, setProducts] = useState([]);
const [selectedProductId, setSelectedProductId] = useState(null);
const [showForm, setShowForm] = useState(false);
const [categoryFilter, setCategoryFilter] = useState("");
const [priceFilter, setPriceFilter] = useState("");
const [sortOrder, setSortOrder] = useState("name-asc");
const [imageSearchTerm, setImageSearchTerm] = useState("");
const [imageSearchResults, setImageSearchResults] = useState([]);
const [imageSearchLoading, setImageSearchLoading] = useState(false);
const [newProduct, setNewProduct] = useState({
  name: "",
  description: "",
  price: "",
  estoque: "",
  categoria: "",
  imageFile: null
});

// Carregar produtos
useEffect(() => {
  axios.get("http://localhost:3322/")
    .then(res => setProducts(res.data.products))
    .catch(err => console.error("Erro ao carregar produto", err));
}, []);

// Cadastrar 
const addProduct = async () => {
  if (!newProduct.name || !newProduct.estoque || !newProduct.description || !newProduct.price) {
    alert("Preencha todos os campos antes de salvar!");
    return;
  }

  const formData = new FormData();
  formData.append("name", newProduct.name);
  formData.append("description", newProduct.description);
  formData.append("price", parseFloat(newProduct.price));
  formData.append("estoque", parseFloat(newProduct.estoque));
  formData.append("categoria", newProduct.categoria);

  if (newProduct.imageFile) {
    formData.append("image", newProduct.imageFile);
  }

  try {
    await axios.post("http://localhost:3322/cadastro", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    const res = await axios.get("http://localhost:3322/");
    setProducts(res.data.products);
    setShowForm(false);
    setNewProduct({ name: "", description: "", price: "", estoque: "", categoria: "", imageFile: null });
  } catch (err) {
    console.error("Erro ao cadastrar:", err);
  }
};

 // atualizar produt
const updateProduct = async (id) => {
  const formData = new FormData();
  formData.append("name", newProduct.name);
  formData.append("description", newProduct.description);
  formData.append("price", parseFloat(newProduct.price));
  formData.append("estoque", parseFloat(newProduct.estoque));
  formData.append("categoria", newProduct.categoria);

  if (newProduct.imageFile) {
    formData.append("image", newProduct.imageFile);
  }

  try {
    const res = await axios.patch(`http://localhost:3322/atualizar/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    setProducts(res.data.products);
    setSelectedProductId(id);
    setNewProduct(current => ({ ...current, imageFile: null }));
  } catch (err) {
    console.error("Erro ao atualizar produto:", err);
  }
};

const searchImages = async () => {
  if (!imageSearchTerm.trim()) return;

  setImageSearchLoading(true);
  try {
    const res = await axios.get("http://localhost:3322/search-images", {
      params: { q: imageSearchTerm.trim() }
    });
    setImageSearchResults(res.data);
  } catch (err) {
    console.error("Erro ao buscar imagens:", err);
  } finally {
    setImageSearchLoading(false);
  }
};

const saveSearchedImage = async (imageUrl) => {
  if (!selectedProduct) return;

  try {
    const res = await axios.post(`http://localhost:3322/baixar-imagem/${selectedProduct.id}`, { imageUrl });
    setProducts(res.data.products);
    setImageSearchResults([]);
  } catch (err) {
    console.error("Erro ao salvar imagem:", err);
  }
};
// Deletar produto
  function deleteProduct(id) {
    axios.delete(`http://localhost:3322/deletar/${id}`)
      .then(() => {
        setProducts(products.filter(p => p.id !== id));
        if (selectedProductId === id) setSelectedProductId(null);
      })
      .catch(err => console.error("Erro ao deletar produto:", err));
  }

// Filtrar produtos
const categories = [...new Set(products.map(product => product.categoria).filter(Boolean))].sort();
const filteredProducts = products
  .filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
  .filter(product => !categoryFilter || product.categoria === categoryFilter)
  .filter(product => !priceFilter || (priceFilter === "low" ? Number(product.price) < 50 : priceFilter === "medium" ? Number(product.price) >= 50 && Number(product.price) <= 200 : Number(product.price) > 200))
  .sort((first, second) => sortOrder === "price-asc" ? Number(first.price) - Number(second.price) : sortOrder === "price-desc" ? Number(second.price) - Number(first.price) : sortOrder === "stock-desc" ? Number(second.estoque) - Number(first.estoque) : first.name.localeCompare(second.name));

const selectedProduct = products.find(product => product.id === selectedProductId);


  return (
    <div className="wrapper">
      <div className="menusLeft">
        <div className="backgroundMENU">
          <div className="menuICO" style={{ backgroundColor: "rgb(77, 86, 99)", marginRight: "9px", width: "230px"}}>
            <img src={IconsProduct} alt="Produto" width="40px" style={{ marginLeft: "4px" }} />
            <span className="menu-text">Produtos</span>
          </div>
          <div className="menuICO">
            <img src={IconsPedido} alt="ped" width="40px" style={{ marginLeft: "6px" }} />
            <span className="menu-text" style={{ marginLeft: "16px" }}>Pedidos</span>
          </div>
          <div className="menuICO">
            <img src={IconsBar} alt="bar" width="30px" style={{ marginLeft: "8px" }} />
            <span className="menu-text" style={{ marginLeft: "24px" }}>Estatísticas</span>
          </div>
          <div className="menuICO">
            <img src={IconsUser} alt="Usuarios" width="30px" style={{ marginLeft: "8px" }} />
            <span className="menu-text" style={{ marginLeft: "23px" }}>Usuários</span>
          </div>
          <div className="menuICO">
            <img src={IconConfig} alt="Config" width="30px" style={{ marginLeft: "8px" }} />
            <span className="menu-text" style={{ marginLeft: "22px" }}>Configurações</span>
          </div>
        </div>
      </div>

      <div className="containers">
        <div className="othersconteiner">
          
  <input
        type="text"
        placeholder="Pesquisar produto..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="product-search"
      />

      <div className="filters" aria-label="Filtros de produtos">
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">Todas as categorias</option>
          {categories.map(category => <option key={category} value={category}>{category}</option>)}
        </select>
        <select value={priceFilter} onChange={e => setPriceFilter(e.target.value)}>
          <option value="">Qualquer preço</option>
          <option value="low">Até R$ 50</option>
          <option value="medium">R$ 50 a R$ 200</option>
          <option value="high">Acima de R$ 200</option>
        </select>
        <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
          <option value="name-asc">A-Z</option>
          <option value="price-asc">Menor preço</option>
          <option value="price-desc">Maior preço</option>
          <option value="stock-desc">Maior estoque</option>
        </select>
      </div>


      <div className="row">
        {filteredProducts.map(product => (
          <div className="column" key={product.id}>
            <div className={`card ${selectedProductId === product.id ? "card-selected" : ""}`} onClick={() => {
              setSelectedProductId(product.id);
              setNewProduct({
                name: product.name,
                description: product.description,
                price: product.price,
                estoque: product.estoque,
                categoria: product.categoria || "",
                imageFile: null
              });
            }}>
              <div className="cardImg">
  {product.image ? (
    <img
      style={{ width: "100%", height: "100%", borderRadius: "26px"}}
      src={`http://localhost:3322/uploads/imgProducts/${product.image}`}
      alt={product.name}
    />
  ) : (
    <span>Sem imagem</span>
  )}

</div>
            <div className="infoProducts">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              {product.categoria && <span className="category-badge">{product.categoria}</span>}
              <div className='price1'>R${product.price}</div>
              <div className='stock1'>Estoque: {product.estoque}</div>
              <div className="infoTooltip">
    <h4>{product.name}</h4>
    <p>{product.description}</p>
  </div>
            </div>
            

            

              
              <button className="buttonDEL" onClick={event => { event.stopPropagation(); deleteProduct(product.id); }}>
                <img className="imgdel" src={IcoDelete} alt="" />
              </button>
            </div>
          </div>
        ))}

        {/* Card para adicionar */}
        <div className="column">
          <div className="card add-card" onClick={() => setShowForm(true)}>
            +
          </div>
        </div>
      </div>

      {/* Formulário modal */}
      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Adicionar Produto</h2>
            <input
              type="text"
              placeholder="Nome do produto"
              value={newProduct.name}
              onChange={e => setNewProduct({ ... newProduct, name: e.target.value})}
            />
            <input
              type="text"
              placeholder="Descrição do produto"
              value={newProduct.description}
              onChange={e => setNewProduct({ ...newProduct, description: e.target.value})}
            />
            <input 
               type="number" 
                placeholder="Preço" 
               value={newProduct.price} 
               onChange={e => setNewProduct({ ...newProduct, price: e.target.value === "" ? "" : parseFloat(e.target.value) 
                })} 
                />
              <input type="number" 
              placeholder="Estoque"
              value={newProduct.estoque}
              onChange={e => setNewProduct({ ...newProduct, estoque: e.target.value === "" ? "" : parseFloat(e.target.value)
              })}
              />
            <input type="text" placeholder="Categoria ou tipo" value={newProduct.categoria} onChange={e => setNewProduct({ ...newProduct, categoria: e.target.value })} />

            <button onClick={addProduct}>Salvar</button>
            <button onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}


    </div>

        <div className="othersconteiner"></div>
        <div className="othersconteiner"></div>
      </div>

      <aside className={`menusRight ${selectedProduct ? "menusRight-open" : ""}`}>
        {selectedProduct ? (
          <div className="details-panel">
            <div className="details-header">
              <div>
                <span className="details-kicker">Produto selecionado</span>
                <h2>Editar item</h2>
              </div>
              <button className="panel-close" aria-label="Fechar detalhes" onClick={() => setSelectedProductId(null)}>×</button>
            </div>
            <div className="details-preview">
              {selectedProduct.image ? <img src={`http://localhost:3322/uploads/imgProducts/${selectedProduct.image}`} alt={selectedProduct.name} /> : <span>Sem imagem</span>}
              <div><strong>{selectedProduct.name}</strong><span>ID #{selectedProduct.id}</span></div>
            </div>
            <div className="details-form">
              <label>Nome<input type="text" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} /></label>
              <label>Preço<input type="number" min="0" step="0.01" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} /></label>
              <label>Quantidade em estoque<input type="number" min="0" step="1" value={newProduct.estoque} onChange={e => setNewProduct({ ...newProduct, estoque: e.target.value })} /></label>
              <label>Categoria ou tipo<input type="text" value={newProduct.categoria} onChange={e => setNewProduct({ ...newProduct, categoria: e.target.value })} /></label>
              <label>Descrição<textarea rows="5" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} /></label>
              <label>Substituir imagem<input type="file" accept="image/*" onChange={e => setNewProduct({ ...newProduct, imageFile: e.target.files[0] })} /></label>
              <button className="details-save" onClick={() => updateProduct(selectedProduct.id)}>Salvar alterações</button>
            </div>
            <div className="image-search-panel">
              <div className="image-search-heading">
                <span>Imagem do produto</span>
                <small>Pesquisar no Google</small>
              </div>
              <div className="image-search-controls">
                <input
                  type="search"
                  placeholder="Ex.: caneta azul"
                  value={imageSearchTerm}
                  onChange={e => setImageSearchTerm(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") searchImages(); }}
                />
                <button type="button" onClick={searchImages} disabled={imageSearchLoading}>
                  {imageSearchLoading ? "..." : "Buscar"}
                </button>
              </div>
              {imageSearchResults.length > 0 && (
                <div className="image-search-results">
                  {imageSearchResults.slice(0, 8).map((image, index) => (
                    <button type="button" className="image-result" key={`${image.thumbnail}-${index}`} onClick={() => saveSearchedImage(image.original)}>
                      <img src={image.thumbnail} alt={image.title || "Imagem encontrada"} />
                      <span>Usar imagem</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="details-empty"><span>+</span><h2>Detalhes do produto</h2><p>Selecione um card para visualizar e editar o item.</p></div>
        )}
      </aside>
    </div>
  )
}

export default Home