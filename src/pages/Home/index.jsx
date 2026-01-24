import { useState, useRef } from 'react'
import viteLogo from '/vite.svg'
import './style.css'
import IconsProduct from './icos/caixa.png';
import IconsPedido from './icos/adicionar-produto.png';
import IconsBar from './icos/bar-chart.png';
import IconsUser from './icos/multiple-users-silhouette.png'
import IconConfig from './icos/config.com.png'
import './carousels.css'
import fowardbutton from './icos/arrowfoward.png'
import cadernoexemplo from './icos/caderno.png'



function Home() {

  // Estado que guarda os produtos
  const [products, setProducts] = useState([
    { id: 1, name: "Produto 1", description: "Descrição do produto 1" },
    { id: 2, name: "Produto 2", description: "Descrição do produto 2" }
  ]);

  // Função para adicionar novo produto
  const addProduct = () => {
    const newId = products.length + 1;
    const newProduct = {
      id: newId,
      name: `Produto ${newId}`,
      description: `Descrição do produto ${newId}`
    };
    setProducts([...products, newProduct]);
  };


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

 <div className="row">
      {products.map((product) => (
        <div className="column" key={product.id}>
          <div className="card">
            <h3>{product.name}</h3>
            <p>{product.description}</p>
          </div>
        </div>
      ))}

      {/* Card especial para adicionar */}
      <div className="column">
        <div className="card add-card" onClick={addProduct}>
          +
        </div>
      </div>
    </div>


        </div>

        <div className="othersconteiner"></div>
        <div className="othersconteiner"></div>
      </div>
    </div>
  )
}

export default Home