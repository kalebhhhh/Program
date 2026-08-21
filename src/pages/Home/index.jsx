import { useState, useRef, useEffect } from 'react'
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
const [showEstoqueForm, setShowEstoqueForm] = useState(null);
const [showForm, setShowForm] = useState(false);
const [showImageForm, setShowImageForm] = useState(null);
const [newProduct, setNewProduct] = useState({
  name: "",
  description: "",
  price: "",
  estoque: "",
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
    setNewProduct({ name: "", description: "", price: "", estoque: "", imageFile: null });
  } catch (err) {
    console.error("Erro ao cadastrar:", err);
  }
};

// Atualizar img
const updateImage = async (id) => {
  if (!newProduct.imageFile) {
    alert("Selecione ou pesquise uma imagem antes de salvar!");
    return;
  }

  const formData = new FormData();
  formData.append("image", newProduct.imageFile);

  console.log("Enviando arquivo:", newProduct.imageFile);

  try {
    const res = await axios.patch(
      `http://localhost:3322/atualizar-imagem/${id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    setProducts(res.data.products);
    setShowImageForm(null);
    setNewProduct({ ...newProduct, imageFile: null });
  } catch (err) {
    console.error("Erro ao atualizar imagem:", err);
  }
};

// pesquisa teste
const [imageSearchTerm, setImageSearchTerm] = useState("");
const [searchResults, setSearchResults] = useState([]);

const searchImages = async () => {
  try {
    const res = await axios.get("http://localhost:3322/search-images", {
      params: { q: imageSearchTerm }
    });
    setSearchResults(res.data);
  } catch (err) {
    console.error("Erro ao buscar imagens:", err);
  }
};

 // atualizar produt
const updateProduct = async (id) => {
  const formData = new FormData();
  formData.append("name", newProduct.name);
  formData.append("description", newProduct.description);
  formData.append("price", parseFloat(newProduct.price));
  formData.append("estoque", parseFloat(newProduct.estoque));

  if (newProduct.imageFile) {
    formData.append("image", newProduct.imageFile);
  }

  try {
    const res = await axios.patch(`http://localhost:3322/atualizar/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    setProducts(res.data.products);
    setShowEstoqueForm(null);
    setNewProduct({ name: "", description: "", price: "", estoque: "", imageFile: null });
  } catch (err) {
    console.error("Erro ao atualizar produto:", err);
  }
};
// baixar texte
const handleSelectImage = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // cria um objeto File com nome e tipo
    const fileName = `google-${Date.now()}.jpg`; 
    const file = new File([blob], fileName, { type: blob.type });

    setNewProduct({ ...newProduct, imageFile: file });
    console.log("Imagem selecionada:", file);
  } catch (err) {
    console.error("Erro ao baixar imagem:", err);
  }
};
// usar img
const usarImagem = async (id, imageUrl) => {
  try {
    const res = await axios.post(`http://localhost:3322/baixar-imagem/${id}`, { imageUrl });
    setProducts(res.data.products); // atualiza lista após salvar
    setShowImageForm(null);         // fecha o formulário
  } catch (err) {
    console.error("Erro ao usar imagem:", err);
  }
};

// Deletar produto
  function deleteProduct(id) {
    axios.delete(`http://localhost:3322/deletar/${id}`)
      .then(() => {
        setProducts(products.filter(p => p.id !== id));
      })
      .catch(err => console.error("Erro ao deletar produto:", err));
  }

// Filtrar produtos
const filteredProducts = products.filter(product =>
  product.name.toLowerCase().includes(searchTerm.toLowerCase())
);


  return (
    <div className="wrapper">
      <div className="menusLeft">
        <div className="backgroundMENU">
          <div className="menuICO" style={{ backgroundColor: "rgb(77, 86, 99)", marginRight: "9px", width: "100%"}}>
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
        <div className="carousels">

          <section>
            <div className="container">
              <div className="carousel">
                <input type="radio" name="slides" defaultChecked id="slide-1" />
                <input type="radio" name="slides" id="slide-2" />
                <input type="radio" name="slides" id="slide-3" />
                <input type="radio" name="slides" id="slide-4" />
                <input type="radio" name="slides" id="slide-5" />
                <input type="radio" name="slides" id="slide-6" />

                <ul className="carousel__slides">
                  <li className="carousel__slide">
                    <figure>
                      <div>
                        <img src="https://picsum.photos/id/1041/800/450" alt="" />
                      </div>
                      <figcaption>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        <span className="credit">Photo: Tim Marshall</span>
                      </figcaption>
                    </figure>
                  </li>
                  <li className="carousel__slide">
                    <figure>
                      <div>
                        <img src="https://picsum.photos/id/1043/800/450" alt="" />
                      </div>
                      <figcaption>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        <span className="credit">Photo: Christian Joudrey</span>
                      </figcaption>
                    </figure>
                  </li>
                  <li className="carousel__slide">
                    <figure>
                      <div>
                        <img src="https://picsum.photos/id/1044/800/450" alt="" />
                      </div>
                      <figcaption>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        <span className="credit">Photo: Steve Carter</span>
                      </figcaption>
                    </figure>
                  </li>
                  <li className="carousel__slide">
                    <figure>
                      <div>
                        <img src="https://picsum.photos/id/1045/800/450" alt="" />
                      </div>
                      <figcaption>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        <span className="credit">Photo: Aleksandra Boguslawska</span>
                      </figcaption>
                    </figure>
                  </li>
                  <li className="carousel__slide">
                    <figure>
                      <div>
                        <img src="https://picsum.photos/id/1049/800/450" alt="" />
                      </div>
                      <figcaption>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        <span className="credit">Photo: Rosan Harmens</span>
                      </figcaption>
                    </figure>
                  </li>
                  <li className="carousel__slide">
                    <figure>
                      <div>
                        <img src="https://picsum.photos/id/1052/800/450" alt="" />
                      </div>
                      <figcaption>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        <span className="credit">Photo: Annie Spratt</span>
                      </figcaption>
                    </figure>
                  </li>
                </ul>

                <ul className="carousel__thumbnails">
                  <li><label htmlFor="slide-1"><img src="https://picsum.photos/id/1041/150/150" alt="" /></label></li>
                  <li><label htmlFor="slide-2"><img src="https://picsum.photos/id/1043/150/150" alt="" /></label></li>
                  <li><label htmlFor="slide-3"><img src="https://picsum.photos/id/1044/150/150" alt="" /></label></li>
                  <li><label htmlFor="slide-4"><img src="https://picsum.photos/id/1045/150/150" alt="" /></label></li>
                  <li><label htmlFor="slide-5"><img src="https://picsum.photos/id/1049/150/150" alt="" /></label></li>
                  <li><label htmlFor="slide-6"><img src="https://picsum.photos/id/1052/150/150" alt="" /></label></li>
                </ul>
              </div>
            </div>
          </section>


        </div>

        <div className="othersconteiner">
          
  <input
        type="text"
        placeholder="Pesquisar produto..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{ marginBottom: "20px", padding: "8px", width: "300px",marginLeft: "44%"}}
      />


      <div className="row">
        {filteredProducts.map(product => (
          <div className="column" key={product.id}>
            <div className="card">
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

  <button onClick={() => setShowImageForm(product.id)}>
    📷 Alterar imagem
  </button>

  {showImageForm === product.id && (
    <div className="image-form">
      <h3>Enviar nova imagem</h3>

      {/* Aba de pesquisa */}
      <input style={{ marginLeft: "21px", marginTop: "4px", height: "32px"}}
        type="text"
        placeholder="Pesquisar no Google Imagens..."
        value={imageSearchTerm}
        onChange={e => setImageSearchTerm(e.target.value)}
      />
      <button style={{width: "91px", height: "32px"}} onClick={searchImages}>🔍 Pesquisar</button>

      {/* Resultados da pesquisa */}
      <div className="search-results">
        {searchResults.map((img, index) => (
          <div key={index} className="search-card">
            <img
              src={img.thumbnail}
              alt={img.title}
              style={{ width: "120px", borderRadius: "8px" }}
            />
            <button onClick={() => usarImagem(product.id, img.original)}>
              Usar esta imagem
            </button>
          </div>
        ))}
      </div>

      {/* Upload manual */}
      <input
        type="file"
        accept="image/*"
        onChange={e =>
          setNewProduct({ ...newProduct, imageFile: e.target.files[0] })
        }
      />

      <div className="form-buttons">
        <button style={{marginTop: "-7px", position: "fixed", marginLeft: "94px"}} onClick={() => updateImage(product.id)}>Salvar imagem</button>
        <button onClick={() => setShowImageForm(null)}>Cancelar</button>
      </div>
    </div>
  )}
</div>
            <div className="infoProducts">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <div className='price1'>R${product.price}</div>
              <div className='stock1'>Estoque: {product.estoque}</div>
              <button className="buttonSTOC" onClick={() => {
    setShowEstoqueForm(product.id);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      estoque: product.estoque,
      imageFile: null
    });
  }}
>Editar</button>
              <div className="infoTooltip">
    <h4>{product.name}</h4>
    <p>{product.description}</p>
  </div>
            </div>
            

            

{showEstoqueForm === product.id && (
  <div className="estoque-form">
    <h3>Editar Produto</h3>

    <label>Nome</label>
    <input
      type="text"
      value={newProduct.name}
      onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
    />

    <label>Preço</label>
    <input
      type="number"
      value={newProduct.price}
      onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
    />

    <label>Descrição</label>
    <textarea
      value={newProduct.description}
      onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
    />

    <label>Estoque</label>
    <input
      type="number"
      value={newProduct.estoque}
      onChange={e => setNewProduct({ ...newProduct, estoque: e.target.value })}
    />

    <div className="form-buttons">
      <button
        className="btn-save"
        onClick={() =>
          updateProduct(
            product.id,
            parseInt(newProduct.estoque),
            newProduct.name,
            parseFloat(newProduct.price),
            newProduct.description
          )
        }
      >
        💾 Salvar
      </button>
      <button className="btn-cancel" onClick={() => setShowEstoqueForm(null)}>
        ❌ Cancelar
      </button>
    </div>
  </div>
)}




              
              <button className="buttonDEL" onClick={() => deleteProduct(product.id)}>
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

            <button onClick={addProduct}>Salvar</button>
            <button onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}


    </div>

        <div className="othersconteiner"></div>
        <div className="othersconteiner"></div>
      </div>
      <div className='menusRight'></div>
    </div>
  )
}

export default Home