import React, { useState } from 'react'
import { Link } from 'react-router-dom'

// Datos del Menú Principal
const menuItems = [
  { id: 1, logoText: "CLIO'S", specialClass: "font-bold text-lg", alt: "Clio's Principal" },
  { id: 2, logoText: "LA TIENDA de CLIO'S", alt: "La Tienda de Clio's" },
  { id: 3, logoText: "||C CLIO'S catering", alt: "Clio's Catering" },
  { id: 4, logoText: "El Patio de CLIO'S", specialClass: "italic", alt: "El Patio de Clio's" },
  { id: 5, logoText: "CLIO'S Antigua", specialClass: "italic", alt: "Clio's Antigua" },
  { id: 6, logoText: "VILLA Los Mil Flores", alt: "Villa Los Mil Flores" },
  { id: 7, logoText: "La Plaza de CLIO'S", specialClass: "italic", alt: "La Plaza de Clio's" }
];

/**
 * Página de Dashboard - Menú Principal
 */
const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      
      {/* Menú Principal (Barra Superior) */}
      <header className="border-b border-gray-800 py-10 px-6">
        <nav className="flex flex-col items-center gap-6 max-w-7xl mx-auto">
          
          {/* Título superior */}
          <span className="text-gray-400 text-xs uppercase tracking-widest mb-4">
            Conozca nuestras ramas
          </span>

          {/* Fila de Logos */}
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {menuItems.map((item) => (
              <a 
                key={item.id} 
                href="#" 
                className={`text-gray-200 hover:text-white transition-colors duration-200 ${item.specialClass || 'text-sm'}`}
              >
                <span className="tracking-wider uppercase">
                  {item.logoText}
                </span>
              </a>
            ))}
          </div>
        </nav>
      </header>

      {/* Sección Hero */}
      <main className="relative">
        <div className="w-full h-screen md:h-[70vh] bg-gray-900 flex flex-col items-center justify-center pt-24 relative overflow-hidden">
          
          {/* Imagen de Fondo */}
          <img 
            src="https://static.wixstatic.com/media/00fb00_858f44146f614385a542ac5de52678a4~mv2.jpg/v1/fill/w_980,h_653,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/00fb00_858f44146f614385a542ac5de52678a4~mv2.jpg" 
            alt="Interior del restaurante elegante" 
            className="absolute inset-0 w-full h-full object-cover object-center" 
          />
          
          {/* Overlay oscuro para mejorar legibilidad del texto */}
          <div className="absolute inset-0 bg-black/40"></div>

          {/* Contenido superpuesto */}
          <div className="relative z-10 flex flex-col items-center gap-6 text-center px-4">
            <h1 className="text-white text-5xl md:text-7xl font-extrabold tracking-tight">
              CLIO'S
            </h1>
            
            {/* Botón de Reserva */}
            <Link
              to="/restaurants"
              className="bg-white hover:bg-gray-200 text-black font-mono text-xs uppercase tracking-widest px-10 py-4 transition-all duration-300 font-semibold"
            >
              Explorar Restaurantes
            </Link>
          </div>
        </div>
      </main>

    </div>
  );
};

export default DashboardPage
