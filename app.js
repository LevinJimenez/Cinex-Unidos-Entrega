
var arrayChats = [];
const username = localStorage.getItem('name');
const $onlineStatus = document.querySelector('#status-online');
const $offlineStatus = document.querySelector('#status-offline');
const $usersList = document.querySelector('#users-list');
const $chatForm = document.querySelector('form');
const $messageInput = document.querySelector('input');
var chatElement = "";
const $username = document.querySelector('#username');
const $lastSeen = document.querySelector('#last-seen');
const $usernamePic = document.querySelector('#username-pic');
const $disconnectBtn = document.querySelector('#disconnect-btn');
const input = document.getElementById('input');


  const renderMessage = (payload) => {
    const { id, message, name } = payload;
    if (name.includes('30370861')&&id !== socket.id){
  
    const divElement = document.createElement('div');
    divElement.classList.add('message');
  
    if (id == socket.id) {
      divElement.classList.add('incoming');
    }
  
    divElement.innerHTML = `<small>${name}</small><p>${message}</p>`;    
    document.getElementById('chat'+name).appendChild(divElement);
   
  
    // Scroll al final de los mensajes...
    chat.scrollTop = chat.scrollHeight;
  };
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
  name: '30370861_Soporte',
},});

const salir = document.getElementById('disconnectBtn-btn');

salir.addEventListener('click', (evt) => {
  socket.close();
  window.location.href = 'Equipo11-Jimenez,Monasterio,Mondim.html';
});

const renderUsers = (users) => {
  const usersList = document.getElementById('users-list');
  const usersToAdd = [];
  const usersToRemove = [];

  users.forEach(user => {
      if (!arrayChats.includes(user.name) && user.name.includes('30370861') && user.name!=='30370861_Soporte') {
      usersToAdd.push(user);
    }
  });

  arrayChats.forEach(chat => {
    if (!users.includes(chat)) {
    usersToRemove.push(chat);
  }
  });

  usersToAdd.forEach(user => {
      console.log(user.name);
      const li = document.createElement('li');
      li.textContent = user.name;
      li.id = "fila"+user.name;
      arrayChats.push( user.name);
      crearDivCopia(user.name);
      li.onclick = () => mostrarChat(user.name);
      
      usersList.appendChild(li);
  });

  usersToRemove.forEach(chat => {
      console.log(chat);
      usersToRemove.pop( chat); 
      usersToAdd.pop( chat); 
      document.getElementById(chat).remove();
      document.getElementById('fila'+chat).remove();
  });
};
socket.on('connect', () => {
  

 
  $lastSeen.innerHTML = getLastSeen();

  
  console.log('Connected');
});

socket.on('disconnect', () => {
 
  console.log('Disconnected');
});


socket.on('online-users', renderUsers);

socket.on('new-message', renderMessage);


function mostrarChat(idChat){
  console.log(arrayChats);
  arrayChats.forEach((chat) => {
  document.getElementById(chat).style.display = 'none';
  });
  document.getElementById(idChat).style.display = 'block';
  chatElement = document.getElementById('chat'+idChat);
  console.log(chatElement);
   
  };

  
  $chatForm.addEventListener('submit', (evt) => {
      evt.preventDefault();
      const divElement = document.createElement('div');
      divElement.classList.add('message'); 
      divElement.classList.add('incoming');
      divElement.innerHTML = `<p>${$messageInput.value}</p>`;    
      chatElement.appendChild(divElement);
      const message = $messageInput.value + chatElement.id;
      $messageInput.value = '';   
        
  
      socket.emit('send-message', message);
  });
 

  function crearDivCopia(id) {
      const originalDiv = document.getElementById('chatOriginal');
      const copiaDiv = originalDiv.cloneNode(true);
      copiaDiv.id = id;
  
      // Append the cloned div to the body before accessing its children
      document.body.appendChild(copiaDiv);
      username
      // Access the child div within the cloned div
      const hijoDiv = copiaDiv.querySelector('#chat');
      hijoDiv.id = 'chat' + id;    
      const hijonombreUsuario = copiaDiv.querySelector('#username');     
      const idNombre=id.replace("30370861_",'');
      hijonombreUsuario.textContent =  idNombre; 

      const hijoImg = copiaDiv.querySelector("#username-pic1");
        
      console.log(hijoImg);    

      hijoImg.src = 'https://api.dicebear.com/9.x/initials/svg?seed='+idNombre;
      console.log(hijoImg.src);
      
  }

  
