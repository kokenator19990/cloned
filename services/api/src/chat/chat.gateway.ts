import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({
  cors: { origin: ['http://localhost:3000', 'http://localhost:5173'], credentials: true },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(private chatService: ChatService) { }

  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;
    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const secret = process.env.JWT_SECRET || 'cloned-dev-secret';
      const decoded = jwt.verify(token, secret) as { sub: string; email: string };
      (client as any).userId = decoded.sub;
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage('chat:send')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; content: string; userId: string },
  ) {
    try {
      const stream = this.chatService.sendMessageStream(
        data.sessionId,
        data.userId,
        data.content,
      );

      for await (const chunk of stream) {
        client.emit('chat:stream', { sessionId: data.sessionId, chunk });
      }

      client.emit('chat:end', { sessionId: data.sessionId });
    } catch (error: any) {
      client.emit('chat:error', {
        sessionId: data.sessionId,
        error: error.message || 'Unknown error',
      });
    }
  }
}
