import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/style.css';
import '../styles/fleet.css';
import ChatWidget from '../chatbot/ChatWidget.jsx';

const Fleet = ({ onAuthClick, isLoggedIn, onSignOut, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});

  const openModal = (name, desc, img) => {
    setModalData({ name, desc, img, vehicleUrl: `/quote?vehicle=${encodeURIComponent(name)}` });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData({});
  };

  const vehicles = [
    { id: 1, name: "4 Seater Sedan", image: "/_images/4 seater sedan.png", description: "Compact and affordable option for small groups or individuals", fullDesc: "Our compact 4-seater sedan is perfect for airport transfers, business meetings, or small group travel. Featuring comfortable seating, air conditioning, and professional driver service." },
    { id: 2, name: "Minibus Mercedes Viano", image: "/_images/minibus mercedes viano.png", description: "Ideal for smaller groups with luxury comfort", fullDesc: "The Mercedes Viano offers luxury and comfort for smaller groups. Perfect for corporate transfers, family trips, or small tour groups with premium amenities." },
    { id: 3, name: "15 Seater Quantum", image: "/_images/15 seater quantum.png", description: "Versatile for group and family use", fullDesc: "Our 15-seater Quantum is perfect for medium-sized groups, family outings, or corporate teams. Spacious interior with comfortable seating and ample luggage space." },
    { id: 4, name: "17 Seater Luxury Sprinter", image: "/_images/17 seater luxury sprinter.png", description: "Perfect for airport transfers & small groups", fullDesc: "The luxury Sprinter offers premium comfort for up to 17 passengers. Ideal for airport transfers, corporate shuttles, and small group tours with business-class amenities." },
    { id: 5, name: "22 Seater Luxury Coach", image: "/_images/22 seater luxury coach.png", description: "Ideal for corporate shuttle hire", fullDesc: "Perfect for corporate events, conference shuttles, and medium group travel. Features comfortable seating, air conditioning, and professional presentation." },
    { id: 6, name: "28 Seater Semi Luxury", image: "/_images/28 seater semi luxury.png", description: "Great for sports tours & team transport", fullDesc: "Designed for sports teams and larger groups. Ample space for equipment and comfortable travel for extended journeys." },
    { id: 7, name: "39 Seater Luxury Coach", image: "/_images/39 seater luxury coach.png", description: "Balanced choice for medium groups", fullDesc: "The perfect balance of capacity and comfort. Ideal for school trips, corporate events, and large family gatherings with premium amenities." },
    { id: 8, name: "60 Seater Semi Luxury", image: "/_images/60 seater semi luxury.png", description: "Cost-effective solution for bigger groups", fullDesc: "Our cost-effective solution for large groups without compromising on comfort. Perfect for school tours, large events, and corporate transfers." },
    { id: 9, name: "70 Seater Semi Luxury", image: "/_images/70 seater semi luxury.png", description: "Spacious travel for schools & tours", fullDesc: "Maximum capacity with comfortable seating. Ideal for large school groups, church outings, and major events requiring substantial passenger transport." }
  ];

  return (
    <>
      <Header 
        onAuthClick={onAuthClick} 
        isLoggedIn={isLoggedIn} 
        user={currentUser}
        onSignOut={onSignOut}
      />

      <div className="fleet-container">
        <h1 className="center-title fleet-title">OUR FLEET</h1>

        <section className="fleet-grid">
          {vehicles.map(vehicle => (
            <article key={vehicle.id} className="vehicle-card">
              <img src={vehicle.image} alt={vehicle.name} />
              <div className="vehicle-body">
                <h3>{vehicle.name}</h3>
                <p className="muted">{vehicle.description}</p>
                <div className="card-actions">
                  <button 
                    className="btn view-details" 
                    onClick={() => openModal(vehicle.name, vehicle.fullDesc, vehicle.image)}
                  >
                    View Details
                  </button>
                  <Link 
                    to={`/quote?vehicle=${encodeURIComponent(vehicle.name)}`} 
                    className="btn btn-ghost"
                  >
                    Book Vehicle
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>

      {/* Modal - Rendered conditionally */}
      {isModalOpen && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal} aria-label="Close modal">
              ✕
            </button>
            <img src={modalData.img} alt={modalData.name} id="modalImg" />
            <h3 id="modalTitle">{modalData.name}</h3>
            <p id="modalDesc">{modalData.desc}</p>
            <div className="modal-actions">
              <Link 
                to={modalData.vehicleUrl} 
                className="btn"
                onClick={closeModal}
              >
                Book this vehicle
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Floating chat icon */}
      <Footer />

<ChatWidget />

</>
  );
};

export default Fleet;