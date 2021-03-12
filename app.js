
const express = require('express')
const app = express()
// const cors = require('cors')
// app.use(cors())
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
const { v4: uuidV4 } = require('uuid')

app.use('/peerjs', peerServer);

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.get('/',(req,res)=>{
  res.render('index')
})

app.get('/room', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})



app.post('/connect', (req, res) => {
  const code=req.body.code;
  const username=req.body.uname;
  res.redirect(`/${code}`)
})
app.get('/:room', (req, res) => {
  res.render('room', {roomId: req.params.room })
})





io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId);
    // messages
    socket.on('message', (message) => {
      //send message to the same room
      io.to(roomId).emit('createMessage', message)
  }); 

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

const port=process.env.PORT||8081;
server.listen(port,'127.0.0.3',()=>{
    console.log("listining");
});