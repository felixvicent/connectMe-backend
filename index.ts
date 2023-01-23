import express from "express";
import bodyParser from "body-parser";
import { Server } from "socket.io";

const io = new Server({
  cors: {},
});
const app = express();

app.use(bodyParser.json());

const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();

io.on("connection", (socket) => {
  socket.on("join-room", (data) => {
    const { roomId, emailId } = data;
    console.log("joined ", emailId);

    emailToSocketMapping.set(emailId, socket.id);
    socketToEmailMapping.set(socket.id, emailId);

    socket.join(roomId);
    socket.emit("joined-room", { roomId });
    socket.broadcast.to(roomId).emit("user-joined", { emailId });
  });

  socket.on("call-user", (data) => {
    const { emailId, offer } = data;
    console.log("call ", emailId);
    const socketId = emailToSocketMapping.get(emailId);
    const fromEmail = socketToEmailMapping.get(socket.id);

    console.log(socketId);

    socket.to(socketId).emit("incomming-call", { from: fromEmail, offer });
  });

  socket.on("call-accepted", (data) => {
    const { emailId, ans } = data;
    console.log("call acceptd", emailId);
    const socketId = emailToSocketMapping.get(emailId);

    socket.to(socketId).emit("call-accepted", { ans });
  });
});

app.listen(8000, () => console.log("Http server running at PORT 8000"));
io.listen(8001);
