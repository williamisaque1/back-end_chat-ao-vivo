const express = require("express");
const socket = require("socket.io");
const cors = require("cors");
const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "X-PINGOTHER, Content-Type, Authorization"
  );
  app.use(cors());
  next();
});

app.get("/", function (req, res) {
  res.send("Bem vindo!");
});

const server = app.listen(process.env.PORT || 8080, () => {
  console.log("Servidor iniciado na porta 8080: http://localhost:8080");
});
let cont = 0;
io = socket(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log(socket.id);
  cont = cont + 1;
  io.emit("total", {
    cont,
    info: socket.handshake.headers["user-agent"].substring(
      socket.handshake.headers["user-agent"].indexOf("(") + 1,
      socket.handshake.headers["user-agent"].indexOf(")")
    ),
  });

  socket.on("disconnect", () => {
    console.info(`Client saiu ${socket.id}`);
    console.log(`usuarios na sala ${(cont = cont - 1)}`);
    io.emit("total", cont);
  });

  socket.on("sala_conectar", (dados) => {
    console.log("Sala selecionada : " + dados);
    socket.join(dados);
  });

  socket.on("enviar_mensagem", (dados) => {
    console.log(dados);
    socket.to(dados.sala).emit("receber_mensagem", dados.conteudo);
  });
});
