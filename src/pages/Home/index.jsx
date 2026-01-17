import { useState, useRef } from 'react'
import viteLogo from '/vite.svg'
import './style.css'
import IconsProduct from './icos/caixa.png';
import IconsPedido from './icos/adicionar-produto.png';
import IconsBar from './icos/bar-chart.png';
import IconsUser from './icos/multiple-users-silhouette.png'
import IconConfig from './icos/config.com.png'

import fowardbutton from './icos/arrowfoward.png'
import cadernoexemplo from './icos/caderno.png'



function Home() {

const [activeIndex, setActiveIndex] = useState(0);

  const cadernos = [
    { id: 1, nome: "Caderno1", img: cadernoexemplo },
    { id: 2, nome: "Caderno2", img: cadernoexemplo },
    { id: 3, nome: "Caderno3", img: cadernoexemplo },
  ];

  const prevSlide = () => {
    setActiveIndex((prev) => (prev === 0 ? cadernos.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev === cadernos.length - 1 ? 0 : prev + 1));
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
            <button className="arrow left" onClick={prevSlide}>‹</button>

      <div className="card-show">
        <img src={cadernos[activeIndex].img} alt={cadernos[activeIndex].nome} className="card-image" />
        <h2 className="card-title">{cadernos[activeIndex].nome}</h2>
      </div>

      <button className="arrow right" onClick={nextSlide}>›</button>


        </div>

        <div className="othersconteiner"></div>
        <div className="othersconteiner"></div>
        <div className="othersconteiner"></div>
      </div>
    </div>
  )
}

export default Home