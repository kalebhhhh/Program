import { useState, useRef, useEffect } from 'react'
import './style.css'
import IconsProduct from './icos/caixa.png';
import IconsPedido from './icos/adicionar-produto.png';
import IconsBar from './icos/bar-chart.png';
import IconsUser from './icos/multiple-users-silhouette.png'
import IconConfig from './icos/config.com.png'
import './carousels.css'
import axios from "axios";



function Home() {

const [searchTerm, setSearchTerm] = useState("");
const [newEstoque, setNewEstoque] = useState("");
const [products, setProducts] = useState([]);
const [showEstoqueForm, setShowEstoqueForm] = useState(null);
const [showForm, setShowForm] = useState(false);
const [newProduct, setNewProduct] = useState ({
  name: "",
  description: "",
  price: "",
  estoque: ""
});

useEffect(() => {
  axios.get("http://localhost:3322/")
  .then(res => setProducts(res.data.products))
  .catch(err => console.error("Erro ao carregar produto", err));

}, []);

const addProduct = () => {
  if (!newProduct.name || !newProduct.estoque || !newProduct.description || !newProduct.price) {
    alert("Preencha todos os campos antes de salvar!");
    return;
  }
    const productToSend = {
    ...newProduct,
    price: parseFloat(newProduct.price)
  };
    const estoqueToSend = {
      ...newProduct, estoque: parseFloat(newProduct.estoque)
    };


  axios.post("http://localhost:3322/cadastro", productToSend, estoqueToSend)
    .then(() => axios.get("http://localhost:3322/"))
    .then(res => {
      setProducts(res.data.products);
      setShowForm(false);
      setNewProduct({ name: "", description: "", price: "", estoque: ""});
    })
    .catch(err => console.error("Erro ao cadastrar:", err));
};

const updateEstoque = (id, novoEstoque) => {
  axios.patch(`http://localhost:3322/atualizar/${id}`, {
    estoque: novoEstoque
  })
  .then(res => {
    setProducts(res.data.products);
  })
  .catch(err => console.error("Erro ao atualizar estoque:", err));
};


const deleteProduct = (id) => {
  axios.delete(`http://localhost:3322/deletar/${id}`).then(() => {
    setProducts(products.filter(p => p.id !== id));
  }).catch(err => console.error("Erro ao deletar produto:", err));
};
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div style={{ display: "flex" }}>
      <div className="menusLeft">
        <div className="backgroundMENU">
          <div className="menuICO" style={{ backgroundColor: "rgb(30 44 59 / 42%)", marginRight: "9px" }}>
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
        style={{ marginBottom: "20px", padding: "8px", width: "300px" }}
      />


      <div className="row">
        {filteredProducts.map(product => (
          <div className="column" key={product.id}>
            <div className="card">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p>R${product.price}</p>
              <p>Qtd: {product.estoque}</p>
              <button onClick={() => setShowEstoqueForm(product.id)}>➕ Estoque</button>

          {showEstoqueForm === product.id && (
                    <div className="estoque-form">
                      <input
                        type="number"
                        placeholder="Novo estoque"
                        value={newEstoque}
                        onChange={e => setNewEstoque(e.target.value)}
                      />
                      <button onClick={() => updateEstoque(product.id, parseInt(newEstoque))}>
                        Salvar
                      </button>
                      <button onClick={() => setShowEstoqueForm(null)}>Cancelar</button>
                    </div>
                  )}


              
              <button onClick={() => deleteProduct(product.id)}>Excluir</button>
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
    </div>
  )
}

export default Home