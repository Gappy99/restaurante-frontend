const sampleRestaurants = [
  {
    _id: '1',
    nombre: 'La Casa del Sabor',
    descripcion: 'Restaurante familiar con comida tradicional y ambiente cálido.',
    logo: 'https://images.unsplash.com/photo-1555992336-c4b7b7a6b4b9?auto=format&fit=crop&w=600&q=80',
    telefono: '+57 300 123 4567',
    email: 'contacto@lacasadelsabor.com',
    direccion: 'Calle 45 #12-34',
    ciudad: 'Medellín, Colombia',
    categoria: 'Gourmet',
    tipoCocina: 'Colombiana',
    redes: {
      facebook: 'facebook.com/lacasadelsabor',
      instagram: 'instagram.com/lacasadelsabor',
      whatsapp: '+573001234567',
    },
    horarios: {
      lunes: '8:00 – 18:00',
      martes: '8:00 – 18:00',
      miercoles: '8:00 – 18:00',
      jueves: '8:00 – 18:00',
      viernes: '8:00 – 20:00',
      sabado: '9:00 – 22:00',
      domingo: 'Cerrado',
    },
    pedidosOnline: true,
    delivery: true,
    moneda: 'COP',
    impuestos: 19,
  },
  {
    _id: '2',
    nombre: 'Street Food Express',
    descripcion: 'Rápido, delicioso y perfecto para comidas informales.',
    logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
    telefono: '+502 6483 2638',
    email: 'pedido@streetfoodexpress.com',
    direccion: 'Carrera 10 #15-20',
    ciudad: 'Bogotá, Colombia',
    categoria: 'Comida rápida',
    tipoCocina: 'Street food',
    redes: {
      facebook: 'facebook.com/streetfoodexpress',
      instagram: 'instagram.com/streetfoodexpress',
      whatsapp: '+573012345678',
    },
    horarios: {
      lunes: '10:00 – 22:00',
      martes: '10:00 – 22:00',
      miercoles: '10:00 – 22:00',
      jueves: '10:00 – 22:00',
      viernes: '10:00 – 23:00',
      sabado: '11:00 – 23:00',
      domingo: '12:00 – 20:00',
    },
    pedidosOnline: true,
    delivery: false,
    moneda: 'COP',
    impuestos: 16,
  },
]

export const restaurantService = {
  getRestaurants: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(sampleRestaurants), 200)
    })
  },
}
