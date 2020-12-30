const users = [];

const addUser = ({ id, username, room }) => {
  //storing username and room
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //checking user and room is there
  if (!username && !room) {
    return {
      error: 'username and room is required',
    };
  }
  //creating username existing function
  const existingUser = users.find(
    (user) => user.room == room && user.username == username
  );
  if (existingUser) {
    return {
      error: 'username already in this room',
    };
  }

  // returning user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

//removing user
const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

//get user
const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
