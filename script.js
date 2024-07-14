var baseUrl = "https://cinexunidos-production.up.railway.app/";
var asientosSeleccionados = [];
async function obtenerCines() {
  try {
    const response = await fetch(baseUrl + 'theatres');
    if (!response.ok) {
      throw new Error('Error al obtener cines');
    }
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error en obtenerCines:', error);
    return [];
  }
}

function obtenerInfoCineDeterminado(id) {
  fetch(baseUrl + 'theatres/' + id)
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al obtener información del cine');
      }
      return response.json();
    })
    .then(data => console.log(data))
    .catch(error => console.error('Error en obtenerInfoCineDeterminado:', error));
}

function obtenerSalasCine(id) {
  fetch(baseUrl + 'theatres/' + id + '/auditoriums')
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al obtener salas del cine');
      }
      return response.json();
    })
    .then(data => console.log(data))
    .catch(error => console.error('Error en obtenerSalasCine:', error));
}

function obtenerInfoSalaCine(idCine, idSala) {
  fetch(baseUrl + 'theatres/' + idCine + '/auditoriums/' + idSala)
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al obtener información de la sala');
      }
      return response.json();
    })
    .then(data => console.log(data))
    .catch(error => console.error('Error en obtenerInfoSalaCine:', error));
}

async function obtenerInfoFuncionSalaCine(idCine, idSala, idFuncion) {
  try {
    const response = await fetch(baseUrl + 'theatres/' + idCine + '/auditoriums/' + idSala + '/showtimes/' + idFuncion);
    if (!response.ok) {
      throw new Error('Error al obtener información de la función');
    }
    const data = await response.json();
    console.log("si");
    console.log(data);

    return data;
  } catch (error) {
    console.error('Error en obtenerInfoFuncionSalaCine:', error);
    return [];
  }
}

async function reservarAsiento(parametrosSala, seatId) {
  try {
    const response = await fetch(baseUrl + 'theatres/' + parametrosSala.idCine + '/auditoriums/' + parametrosSala.idSala + '/showtimes/' + parametrosSala.idFuncion + '/reserve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        seat: seatId
      })
    });

    if (!response.ok) {
      throw new Error('Error al reservar asiento');
    }
    asientosSeleccionados.push(seatId)
    console.log(asientosSeleccionados)
    await delay(600);
    recargarAsientos(seatId, 'reservado', parametrosSala);
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error en reservarAsiento:', error);
  }
}


function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function delayedFunction(milliseconds) {
  await new Promise(resolve => setTimeout(resolve, milliseconds));

  console.log("¡Después del retardo!");
}

function cancelarReserva(parametrosSala, seatId) {
  fetch(baseUrl + 'theatres/' + parametrosSala.idCine + '/auditoriums/' + parametrosSala.idSala + '/showtimes/' + parametrosSala.idFuncion + '/reserve', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      seat: seatId
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al cancelar reserva');
      }
      asientosSeleccionados.pop(seatId)
      return response.json();
    })
    .then(data => console.log(data))
    .catch(error => console.error('Error en cancelarReserva:', error));
}
function infoAsiento(parametrosSala) {

  const evtSource = new EventSource(baseUrl + 'theatres/' + parametrosSala.idCine + '/auditoriums/' + parametrosSala.idSala + '/showtimes/' + parametrosSala.idFuncion + '/reservation-updates');
  evtSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log(data);
    if (data.result === "SEAT_RESERVED") {

      recargarAsientos(data.seat, 'reservado2', parametrosSala);
    } else if (data.result === "SEAT_RELEASED") {

      recargarAsientos(data.seat, 'disponible', parametrosSala);
    }
  };
}

async function cargarYMostrarCines() {
  try {
    const cines = await obtenerCines();
    if (Array.isArray(cines)) {
      mostrarCines(cines);
    } else {
      console.error('obtenerCines no devolvió un arreglo');
    }
  } catch (error) {
    console.error('Error al obtener cines:', error);
  }
}

function mostrarCines(cines) {
  const cinesContenedor = document.getElementById('cines-contenedor');

  cines.forEach(cine => {
    const cineCard = document.createElement('div');
    cineCard.className = 'cine-card grow opacity-increase';
    const cineImagen = document.createElement('img');
    cineImagen.src = baseUrl + cine.images[0];
    cineImagen.alt = `Imagen de ${cine.name}`;
    cineCard.appendChild(cineImagen);
    const cineFooter = document.createElement('div');
    cineFooter.className = 'cine-footer';
    const cineNombre = document.createElement('h2');
    cineNombre.textContent = cine.name;
    cineFooter.appendChild(cineNombre);
    const cineUbicacion = document.createElement('p');
    cineUbicacion.textContent = cine.location;
    cineFooter.appendChild(cineUbicacion);
    cineCard.appendChild(cineFooter);
    cineCard.addEventListener('click', () => {
      document.getElementById('seleccionar-cine').style.display = 'none';
      document.getElementById('seleccionar-horario').style.display = 'block';
      document.getElementById('nombreCine').textContent = cine.name;
      colocarHorariosPorPelicula(cine);
    });
    cinesContenedor.appendChild(cineCard);

  });
}
function colocarHorariosPorPelicula(cine) {
  const horariosContenedor = document.getElementById('horarios-contenedor');
  horariosContenedor.innerHTML = '';
  console.log(cine);
  const peliculas = {};
  cine.auditoriums.forEach(sala => {
    sala.showtimes.forEach(funcion => {
      const peliculaId = funcion.movie.id;
      if (!peliculas[peliculaId]) {
        peliculas[peliculaId] = {
          nombre: funcion.movie.name,
          horarios: [],
          poster: funcion.movie.poster,
          salaId: sala.id,
        };
      }
      peliculas[peliculaId].horarios.push({
        sala: sala.name,
        idSala: sala.id,
        startTime: funcion.startTime,
        funcionId: funcion.id,

      });
    });
  });
  Object.values(peliculas).forEach(pelicula => {

    const peliculaContenedor = document.createElement('div');
    peliculaContenedor.className = 'pelicula-contenedor';
    const posterPelicula = document.createElement('img');
    posterPelicula.src = baseUrl + pelicula.poster;
    posterPelicula.alt = `Póster de ${pelicula.nombre}`;
    posterPelicula.className = 'poster-pelicula';
    peliculaContenedor.appendChild(posterPelicula);
    const tituloPelicula = document.createElement('h3');
    tituloPelicula.textContent = pelicula.nombre;
    peliculaContenedor.appendChild(tituloPelicula);

    pelicula.horarios.forEach(horario => {
      const horarioCard = document.createElement('div');

      horarioCard.className = 'horario-card opacity-increase grow';
      horarioCard.textContent = `${horario.sala} - ${horario.startTime}`;
      horarioCard.addEventListener('click', () => {

        console.log(`Clic en horario de ${horario.sala} a las ${horario.startTime}`);
        document.getElementById('seleccionar-horario').style.display = 'none';
        document.getElementById('contenedor-asientos').style.display = 'block';
        console.log(cine.id);
        console.log(horario.idSala);
        console.log(horario.funcionId);
        obtenerInformacionSala(cine.id, horario.idSala, horario.funcionId);
      });
      peliculaContenedor.appendChild(horarioCard);
    });
    horariosContenedor.appendChild(peliculaContenedor);
  });
}
async function obtenerInformacionSala(idCine, idSala, idFuncion) {
  try {
    const InfoSala = await obtenerInfoFuncionSalaCine(idCine, idSala, idFuncion);
    console.log(InfoSala);
    const parametrosSala = {
      idCine: idCine,
      idSala: idSala,
      idFuncion: idFuncion
    };
    crearLayoutAsientos(InfoSala, idSala, parametrosSala);
    colocarDatospelicula(InfoSala, idSala);
  } catch (error) {
    console.error('Error al obtener la información de la sala:', error);
  }
}

addEventListener('DOMContentLoaded', () => {
  cargarYMostrarCines();
});

function encontrarNumeroMaximoAsientos(datosSala) {
  if (!datosSala || !datosSala.seats) {
    console.error('datosSala o datosSala.seats no están definidos');
    return 0;
  }

  let numeroMaximoAsientos = 0;

  for (const fila in datosSala.seats) {
    const numeroAsientosFila = datosSala.seats[fila].length;

    if (numeroAsientosFila > numeroMaximoAsientos) {
      numeroMaximoAsientos = numeroAsientosFila;
    }
  }

  return numeroMaximoAsientos;
}
function crearLayoutAsientos(datosSala, idSala, parametrosSala) {
  const salaCine = document.getElementById('sala-cine');
  salaCine.innerHTML = '';
  const numeroMaximoAsientos = encontrarNumeroMaximoAsientos(datosSala);
  console.log(numeroMaximoAsientos);
  for (const fila in datosSala.seats) {
    const filaContenedor = document.createElement('div');
    filaContenedor.classList.add('fila');
    filaContenedor.id = `fila-${fila}`;

    const letraFila = document.createElement('span');
    letraFila.classList.add('letra-fila');
    letraFila.textContent = fila;

    filaContenedor.appendChild(letraFila);

    const asientosFila = datosSala.seats[fila];
    for (let asientoIndex = 0; asientoIndex < asientosFila.length; asientoIndex++) {
      const asiento = asientosFila[asientoIndex];
      const asientoHTML = crearAsiento(fila, asientoIndex, asiento, parametrosSala);
      filaContenedor.appendChild(asientoHTML);
    }

    salaCine.appendChild(filaContenedor);
  }
  const filaNumeros = document.createElement('div');
  filaNumeros.classList.add('fila');
  const numeros = document.createElement('span');
  numeros.classList.add('letra-fila');
  numeros.textContent = '';
  filaNumeros.appendChild(numeros);

  for (let numeroAsiento = 0; numeroAsiento < numeroMaximoAsientos; numeroAsiento++) {
    const numeroElemento = document.createElement('div');
    numeroElemento.classList.add('numero-asiento');
    numeroElemento.textContent = numeroAsiento;
    filaNumeros.appendChild(numeroElemento);
  }

  salaCine.appendChild(filaNumeros);

  infoAsiento(parametrosSala);
}
function crearAsiento(fila, numeroAsiento, estadoAsiento, parametrosSala) {
  const asientoHTML = document.createElement('div');
  asientoHTML.classList.add('asiento');
  asientoHTML.dataset.asiento = `${fila}${numeroAsiento}`;
  asientoHTML.id = `${fila}${numeroAsiento}`;
  switch (estadoAsiento) {
    case -1:
      asientoHTML.classList.add('no-disponible');
      asientoHTML.onclick = () => {
        showTemporaryAlert('Este asiento no está disponible',2000);
      };
      break;
    case 0:
      asientoHTML.classList.add('disponible');
      asientoHTML.onclick = () => {
        reservarAsiento(parametrosSala, `${fila}${numeroAsiento}`);
        showTemporaryAlert('Has reservado el asiento ' + `${fila}${numeroAsiento}`);
      };
      break;
    case 1:
      asientoHTML.classList.add('ocupado');
      asientoHTML.onclick = () => {
        showTemporaryAlert('Este asiento ya está ocupado',2000);
      };
      break;
    case 2:
      asientoHTML.classList.add('reservado3ro');
      asientoHTML.onclick = () => {
        showTemporaryAlert('Este asiento ya está reservado por otra persona',2000);
      }

      break;
    default:
      console.warn(`Unknown seat value: ${estadoAsiento}`);
      break;
  }

  return asientoHTML;
}
function showTemporaryAlert(message,ms) {

  const existingNotification = document.querySelector('.temporary-alert');
  if (existingNotification) {
    existingNotification.remove();
  }
  const notification = document.createElement('div');
  notification.classList.add('temporary-alert');
  notification.textContent = message;

  document.body.appendChild(notification);
  setTimeout(() => {
    notification.remove();
  }, ms);
}

function recargarAsientos(idAsiento, accion, parametrosSala) {
  console.log(idAsiento);
  const asientoElement = document.getElementById(idAsiento);
  const classList = asientoElement.classList;

  switch (accion) {
    case 'reservado2':
      classList.remove('disponible');
      classList.add('reservado3ro');

      break;
    case 'disponible':
      classList.remove('reservado');
      classList.remove('reservado3ro');
      classList.add('disponible');

      asientoElement.onclick = () => {
        reservarAsiento(parametrosSala, idAsiento);
      };
      break;
    case 'ocupado':
      classList.add('ocupado');
      break;
    case 'reservado':
      classList.remove('disponible');
      classList.add('reservado');

      asientoElement.onclick = () => {
        cancelarReserva(parametrosSala, idAsiento);
      };
      break;
    default:

      console.warn('Clase de asiento no reconocida:', classList.value);
  }
}
function colocarDatospelicula(datosSala, idSala) {

  if (!datosSala || !datosSala.movie) {
    console.error('Datos de la sala o película no proporcionados o incompletos');
    return;
  }
  const imagenPelicula = document.getElementById('imagenPelicula');
  const nombrePelicula = document.getElementById('nombrePelicula');
  const clasificacionPelicula = document.getElementById('clasificacionPelicula');
  const duracionPelicula = document.getElementById('duracionPelicula');
  const horaFuncion = document.getElementById('horaFuncion');
  const salaFuncion = document.getElementById('salaFuncion');

  if (!imagenPelicula || !nombrePelicula || !clasificacionPelicula || !duracionPelicula || !horaFuncion || !salaFuncion) {
    console.error('Uno o más elementos del DOM no se encontraron');
    return;
  }

  const { movie, startTime, id } = datosSala;
  const { name, rating, runningTime, poster } = movie;


  imagenPelicula.src = baseUrl + poster;
  imagenPelicula.alt = `Imagen de la película ${name}`;
  nombrePelicula.textContent = name;
  clasificacionPelicula.textContent = `Clasificación: ${rating}`;
  duracionPelicula.textContent = `Duración: ${runningTime} minutos`;
  horaFuncion.textContent = `Hora de la función: ${startTime}`;
  salaFuncion.textContent = `Sala: ${idSala}`;
}

var mobileMenu = document.getElementById('mobile-menu');
var seleccionarCine = document.getElementById('seleccionar-cine');
var seleccionarHorario = document.getElementById('seleccionar-horario');
var contenedorAsientos = document.getElementById('contenedor-asientos');
var contenedorResumen = document.getElementById('contenedor-resumen');
var dulceriaContenedor = document.getElementById('dulceria-contenedor');
var promocionesContenedor = document.getElementById('promociones-contenedor');
var soporteModal = document.getElementById('modal-help');
var modalNombre= document.getElementById('modalNombre');

function home() {
  seleccionarCine.style.display = 'flex';
  seleccionarHorario.style.display = 'none';
  contenedorAsientos.style.display = 'none';
  dulceriaContenedor.style.display = 'none';
  promocionesContenedor.style.display = 'none';
  mobileMenu.style.display = 'none';
  asientosSeleccionados = [];
};

function promocion() {
  seleccionarCine.style.display = 'none';
  seleccionarHorario.style.display = 'none';
  contenedorAsientos.style.display = 'none';
  dulceriaContenedor.style.display = 'none';
  promocionesContenedor.style.display = 'block';
  mobileMenu.style.display = 'none';
  asientosSeleccionados = [];
};

function dulceria() {
  seleccionarCine.style.display = 'none';
  seleccionarHorario.style.display = 'none';
  contenedorAsientos.style.display = 'none';
  dulceriaContenedor.style.display = 'block';
  promocionesContenedor.style.display = 'none';
  mobileMenu.style.display = 'none';
  asientosSeleccionados = [];
  mostrarProductos(productos);
};

/*function dulceria() {
  seleccionarCine.style.display = 'none';
  seleccionarHorario.style.display = 'none';
  contenedorAsientos.style.display = 'none';
  dulceriaContenedor.style.display = 'block';
  promocionesContenedor.style.display = 'none';
  mobileMenu.style.display = 'none';
  mostrarProductos(productos);
};*/

function soporte(){
  modalNombre.style.display='block';
  //soporteModal.style.display = 'block';
}
function soporteChat(){
  modalNombre.style.display='none';
  soporteModal.style.display = 'block';
}
function cerrarModal(){
  modalNombre.style.display='none';
}

const atras = document.getElementById('atras');
atras.addEventListener('click', () => {
  document.getElementById('seleccionar-cine').style.display = 'none';
  document.getElementById('seleccionar-horario').style.display = 'block';
  document.getElementById('contenedor-asientos').style.display = 'none';
  document.getElementById('dulceria-contenedor').style.display = 'none';
  document.getElementById('promociones-contenedor').style.display = 'none';
  asientosSeleccionados = [];
});

const resumen = document.getElementById('pagar');
resumen.addEventListener('click', () => {
  if(asientosSeleccionados.length === 0){
    showTemporaryAlert('Debes seleccionar al menos un asiento',3000);
    return;
  }
  showTemporaryAlert('ERROR al relaizar la compra,porfavor contactese con alguno de nuestros asesores en la sección de Soporte',5000);
  // document.getElementById('seleccionar-cine').style.display = 'none';
  // document.getElementById('contenedor-resumen').style.display = 'block';
  // document.getElementById('seleccionar-horario').style.display = 'none';
  // document.getElementById('contenedor-asientos').style.display = 'none';
  // document.getElementById('dulceria-contenedor').style.display = 'none';
  // document.getElementById('promociones-contenedor').style.display = 'none';
  // colocarAsientoResumen(asientosSeleccionados);
});

function colocarAsientoResumen(asientosSeleccionados) {
  const asientosResumen = document.getElementById('asientos-resumen');
  asientosResumen.innerHTML = '';
  const asientosTexto = asientosSeleccionados.join(', ');
  const p = document.createElement('p');
  p.textContent = asientosTexto;
  asientosResumen.appendChild(p);
}

const cerrar = document.getElementById('cerrar-chat');
cerrar.addEventListener('click', () => {
  document.getElementById('modal-help').style.display = 'none';
});

const menu = document.getElementById('menu');
menu.addEventListener('click', () => {
  document.getElementById("mobile-menu").style.display = "block";
});

const cerrarMenu = document.getElementById('cerrar-menu');
cerrarMenu.addEventListener('click', () => {
  document.getElementById("mobile-menu").style.display = "none";
});

function closeMenu() {
  mobileMenu.style.display = 'none';
}

function checkScreenWidth() {
  if (window.innerWidth > 999 && mobileMenu.style.display === 'block') {
    closeMenu();
  }
}

menu.addEventListener('click', function () {
  mobileMenu.style.display = 'block';
});

cerrarMenu.addEventListener('click', closeMenu);

window.addEventListener('resize', checkScreenWidth);

const productos = [
  { name: 'COMBO PARA DOS', img: 'https://cdnecinesunidosweb.azureedge.net/concessions/10001531.jpg', precio: 10, tipo: 'combo' },
  { name: 'MEGA COMBO', img: 'https://cdnecinesunidosweb.azureedge.net/concessions/10001532.jpg', precio: 14, tipo: 'combo' },
  { name: 'COMBO HOT DOG', img: 'https://cdnecinesunidosweb.azureedge.net/concessions/10001357.jpg', precio: 6, tipo: 'combo' },
  { name: 'COMBO NUGGETS', img: 'https://cdnecinesunidosweb.azureedge.net/concessions/10001317.jpg', precio: 6, tipo: 'combo' },
  { name: 'COMBO TEQUEÑOS 6 UN', img: 'https://cdnecinesunidosweb.azureedge.net/concessions/10001313.jpg', precio: 7, tipo: 'combo' },
  { name: 'COTUFA X-GRANDE', img: 'https://cdnecinesunidosweb.azureedge.net/concessions/10001533.jpg', precio: 5, tipo: 'cotufas' },
  { name: 'MINALBA PET 600ML', img: 'https://cdnecinesunidosweb.azureedge.net/concessions/10000037.jpg', precio: 1.8, tipo: 'bebida' },
  { name: 'BEBIDA GRANDE', img: 'https://cdnecinesunidosweb.azureedge.net/concessions/10001307.jpg', precio: 3, tipo: 'bebida' },
  { name: 'BEBIDA MEDIANA', img: 'https://cdnecinesunidosweb.azureedge.net/concessions/10001308.jpg', precio: 2, tipo: 'bebida' },
  { name: 'COCOSETTE MAXI', img: 'https://cdnecinesunidosweb.azureedge.net/concessions/10000013.jpg', precio: 1.2, tipo: 'dulce' },
  { name: 'CRI CRI 27GR', img: 'https://cdnecinesunidosweb.azureedge.net/concessions/10000771.jpg', precio: 1.4, tipo: 'dulce' },
  { name: 'SAMBA 32GR', img: 'https://cdnecinesunidosweb.azureedge.net/concessions/10000772.jpg', precio: 0.9, tipo: 'dulce' },
  { name: 'GOMITAS SABROSITAS FAMILIAR 90 GR', img: 'https://cdnecinesunidosweb.azureedge.net/concessions/10000026.jpg', precio: 1.3, tipo: 'dulce' },
  { name: 'DORITOS MEGA QUESO 150 GR', img: 'https://cdnecinesunidosweb.azureedge.net/concessions/10000016.jpg', precio: 3.4, tipo: 'snack' },
  { name: 'CHEESE TRIS 150 GRS', img: 'https://cdnecinesunidosweb.azureedge.net/concessions/10001573.jpg', precio: 2.2, tipo: 'snack' },
  { name: 'NATUCHIPS PLATANITOS NAT 150 GR', img: 'https://cdnecinesunidosweb.azureedge.net/concessions/10000041.jpg', precio: 4, tipo: 'snack' },
  { name: 'RUFFLES QUESO 125 GRS', img: 'https://cdnecinesunidosweb.azureedge.net/concessions/10001385.jpg', precio: 3.9, tipo: 'snack' },
  { name: 'PEPITO 80GR', img: 'https://cdnecinesunidosweb.azureedge.net/concessions/10001574.jpg', precio: 1.5, tipo: 'snack' },
  { name: 'FLAQUITO DISPLAY 30GR', img: 'https://cdnecinesunidosweb.azureedge.net/concessions/10000892.jpg', precio: 0.6, tipo: 'dulce' },
  { name: 'SUSY CHOCOLATE MAXI', img: 'https://cdnecinesunidosweb.azureedge.net/concessions/10000056.jpg', precio: 1.2, tipo: 'dulce' },
]

let dulceriaMostrada = false;

function mostrarProductos(productos) {
  if (dulceriaMostrada) {
    return;
  }

  const comboContenedor = document.getElementById('combos');
  const bebidaContenedor = document.getElementById('bebidas');
  const dulceContenedor = document.getElementById('dulces');
  const snackContenedor = document.getElementById('snacks');
  const cotufasContenedor = document.getElementById('cotufas');
  productos.forEach(producto => {
    const productoCard = document.createElement('div');
    productoCard.className = 'producto-contenedor ';

    const productoImagen = document.createElement('img');
    productoImagen.className = 'img-dulceria';
    productoImagen.src = producto.img;
    productoImagen.alt = `Imagen de ${producto.name}`;
    productoCard.appendChild(productoImagen);

    const productoFooter = document.createElement('div');
    productoFooter.className = 'producto-footer';

    const productoNombre = document.createElement('p');
    productoNombre.className = 'info-dulceria';
    productoNombre.textContent = producto.name;
    productoFooter.appendChild(productoNombre);

    const productoPrecio = document.createElement('p');
    productoPrecio.className = 'info-dulceria';
    productoPrecio.textContent = `${producto.precio} $`;
    productoFooter.appendChild(productoPrecio);
    productoCard.appendChild(productoFooter);

    if (producto.tipo === 'combo') {
      comboContenedor.appendChild(productoCard);
    } else if (producto.tipo === 'bebida') {
      bebidaContenedor.appendChild(productoCard);
    } else if (producto.tipo === 'dulce') {
      dulceContenedor.appendChild(productoCard);
      dulceriaMostrada = true;
    } else if (producto.tipo === 'snack') {
      snackContenedor.appendChild(productoCard);
    } else if (producto.tipo === 'cotufas') {
      cotufasContenedor.appendChild(productoCard);
    }
  });
}