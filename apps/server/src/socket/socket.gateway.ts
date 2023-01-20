import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Room } from 'src/database/entities/Room';
import { User } from 'src/database/entities/User';
import { Repository } from 'src/database/repository/Repository';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private userRepository: Repository<User>,
    private roomRepository: Repository<Room>,
  ) {}

  @WebSocketServer()
  server: Server;

  handleConnection(@ConnectedSocket() client: Socket) {
    console.log('user connected', client.id);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log('user disconnected', client.id);
    const user = this.userRepository.find({
      key: 'socketId',
      value: client.id,
    });
    if (!user) return;

    const rooms = this.roomRepository.getAll();
    const room = rooms.find(
      (r) => r.ownerId === user.id || r.guestId === user.id,
    );

    this.userRepository.remove(user.id);

    console.log({ room });

    client.broadcast.emit('user-disconnected', client.id);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { userId: string; roomId: string; peerId: string; socketId: string },
  ) {
    console.log('user joining room:', data);

    this.userRepository.save(data.userId, {
      id: data.userId,
      name: 'undefined',
      socketId: data.socketId,
      peerId: data.peerId,
    });

    let room = this.roomRepository.get(data.roomId);

    if (room) {
      if (room.ownerId !== data.userId) {
        if (room.guestId && room.guestId !== data.userId) {
          client.disconnect();
        } else {
          room = this.roomRepository.save(data.roomId, {
            ...room,
            guestId: data.userId,
          });
        }
      }
    } else {
      room = this.roomRepository.save(data.roomId, {
        id: data.roomId,
        ownerId: data.userId,
      });
    }

    client.join(data.roomId);
    client.broadcast.to(data.roomId).emit('user-connected', data.userId);

    this.server.to(data.roomId).emit('room-updated', {
      roomId: room.id,
      owner: this.userRepository.get(room.ownerId),
      guest: this.userRepository.get(room.guestId),
    });
  }

  @SubscribeMessage('call-user')
  handleCallUser(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    console.log({ data });
    client.broadcast.to(data.roomId).emit('called-user', {
      ...data,
    });
  }

  @SubscribeMessage('broadcast-message')
  handleBroadcastMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; message: string; userId: string },
  ) {
    console.log('broadcasting message', { data });
    const user = this.userRepository.get(data.userId);

    client.broadcast.to(data.roomId).emit('message-recived', {
      user,
      message: data.message,
    });
  }
}
