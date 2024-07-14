

const $onlineStatus = document.querySelector('#status-online');
const $offlineStatus = document.querySelector('#status-offline');
const $usersList = document.querySelector('#users-list');
const $chatForm = document.querySelector('form');
const $messageInput = document.getElementById('env');
const $chatElement = document.querySelector('#chat');
const $username = "";
const $lastSeen = document.querySelector('#last-seen');
const $usernamePic = document.querySelector('#username-pic');
const $disconnectBtn = document.querySelector('#disconnect-btn');
var soporteModal = document.getElementById('modal-help');
var modalNombre= document.getElementById('modalNombre');
var botonCerrar=document.getElementById('cerrar-chat');

botonCerrar.addEventListener('click',function(){
  socket.close();
});

function soporteChat(){
  modalNombre.style.display='none';
  soporteModal.style.display = 'block';
}

const renderMessage = (payload) => {
    const { id, message, name } = payload;
    const username = document.getElementById('nameInput').value
    console.log(username);
    if ((name=='30370861_Soporte') && message.includes('chat30370861_'+username)){
    const meselim='chat30370861_'+username;
    const message1=message.replace(meselim,'');
    const divElement = document.createElement('div');
    divElement.classList.add('message');    
  
    divElement.innerHTML = `<small>${'Soporte'}</small><p>${message1}</p>`;
    const chat = document.getElementById('chat');
    chat.appendChild(divElement);
  
    // Scroll al final de los mensajes...
    chat.scrollTop = chat.scrollHeight;
  } else if(id == socket.id){
    const divElement = document.createElement('div');
    divElement.classList.add('message');
    divElement.classList.add('incoming');
    divElement.innerHTML = `<p>${message}</p>`;
    const chat = document.getElementById('chat');
    chat.appendChild(divElement);
  }
};
const renderUsers = (users) => {
  let userFound = false; // Flag to indicate if the user is found
  users.forEach(user => {
    if (user.name === '30370861_Soporte') {      
      userFound = true; // Set flag to true
      return; // Stop iteration since user is found
    }
  });
  if (userFound == false){
    alert('Soporte no disponible, espere a que un empleado se conecte');
    window.location.reload();
  }else{
    console.log(`Usuario encontrado: `);
    soporteChat();

  }
};


// ------------------------------------------------------------------------------------------------
function getLastSeen() {
    // Obtener la fecha actual
    const now = new Date();

    // Convertir a huso horario de Venezuela (GMT-4)
    const venezuelaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Caracas' }));

    // Formatear la fecha
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    const formattedTime = venezuelaTime.toLocaleTimeString('es-VE', options);

    return `<small>Hoy a las ${formattedTime}</small>`;
}


var socket=io("https://cinexunidos-production.up.railway.app/",{auth: {
  name: 'pablo',
},});


  function iniciarConex() {
    const username = document.getElementById('nameInput').value    
    socket=io("https://cinexunidos-production.up.railway.app/",{auth: {
      name: '30370861_'+username,
    },});
    socket.on('online-users', renderUsers);
  }


socket.on('connect', () => {   


    $lastSeen.innerHTML = getLastSeen();

    
    console.log('Connected');
});

socket.on('disconnect', () => {
   
    console.log('Disconnected');
});



socket.on('new-message', renderMessage);



$chatForm.addEventListener('submit', (evt) => {
    evt.preventDefault();

    const message = $messageInput.value;
    $messageInput.value = '';

    socket.emit('send-message', message);
});
      
      
      

    
