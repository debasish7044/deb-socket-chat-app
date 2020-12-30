const socket = io();

//elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $message = document.querySelector('#message');

//Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML;
const $locationTemplate = document.querySelector('#location-message-template')
  .innerHTML;
const $sidebarTemplate = document.querySelector('#sidebar__template').innerHTML;

//Options we are using qs library for query string the serach term
//from here we are getting username and room data
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

//autoscroll
const autoscroll = () => {
  //New Message Element
  const newMessages = $message.lastElementChild;

  //height of the new message
  const newMessageStyles = getComputedStyle(newMessages);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = newMessages.offsetHeight + newMessageMargin;

  //visible height
  const visibleHeight = $message.offsetHeight;

  //container height
  const containerHeight = $message.scrollHeight;

  //how far i have scrolled?
  const scrollOffset = $message.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $message.scrollTop = $message.scrollHeight;
  }
};

//receving location message from server side and rendering the the client
socket.on('locationMessage', (message) => {
  const html = Mustache.render($locationTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format('h:mm a'),
  });
  $message.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

//receving every message from server side and rendering the the client
socket.on('message', (message) => {
  const html = Mustache.render($messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a'),
  });
  $message.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

//receving room and users information from server side
socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render($sidebarTemplate, {
    room,
    users,
  });
  document.querySelector('#sidebar').innerHTML = html;
});

//adding addEventListener to form
$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute('disabled', 'disabled');
  const message = $messageForm.search.value;
  $messageForm.reset();
  $messageFormInput.focus();

  //sending sendMessage event
  socket.emit('sendMessage', message, (error) => {
    $messageFormButton.removeAttribute('disabled');
    if (error) {
      return console.log(error);
    }
    console.log('your message has been delivered');
  });
});

//Adding addEventListener to sendLocation button
document.querySelector('#send-location').addEventListener('click', () => {
  $sendLocationButton.setAttribute('disabled', 'disabled');
  //getting location from user browser
  navigator.geolocation.getCurrentPosition((position) => {
    $sendLocationButton.removeAttribute('disabled');
    //sending sendLocation event & userLocation lat & long to server side
    socket.emit(
      'sendLocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        console.log('Location shared');
      }
    );
  });
});

//sending data with username and room
socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});
