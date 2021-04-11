import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Connection, ConnectionService } from '../connection/connection.service';
import { TargetService } from './target.service';

type ErrorReturn = {
  error: string;
  description: string;
};

@WebSocketGateway()
export class TargetGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger(TargetGateway.name);

  constructor(private readonly targetService: TargetService, private readonly connectionService: ConnectionService) {}

  handleConnection(client: Socket): any {
    this.logger.log(`Client connected: ${client.id}`);
  }

  /**
   * Join the client on a room and send a update
   * to the other users in the room.
   *
   * @param targetSlug the target slug.
   * @param client the current client.
   */
  @SubscribeMessage('join')
  async handleJoin(
    @MessageBody() targetSlug: string,
    @ConnectedSocket() client: Socket
  ): Promise<WsResponse<ErrorReturn | Connection>> {
    const foundTarget = await this.targetService.findBySlug(targetSlug);
    if (foundTarget == null) {
      return this.logTargetError('joinedRoom', targetSlug);
    }
    const connectedConnection = this.connectionService.connectUserToTarget(client, foundTarget);

    client.to(connectedConnection.target.slug).emit('updateRoom');

    this.logger.log(`Client: ${client.id} joined Room: ${connectedConnection.target.slug}`);

    return { event: 'joinedRoom', data: connectedConnection };
  }

  /**
   * Send the latest room data to the client.
   *
   * @param targetSlug the target slug.
   * @param client the current client.
   */
  @SubscribeMessage('retrieveRoomData')
  async handleRetrieveRoomData(
    @MessageBody() targetSlug: string,
    @ConnectedSocket() client: Socket
  ): Promise<WsResponse<ErrorReturn | Connection>> {
    const foundTarget = await this.targetService.findBySlug(targetSlug);

    if (foundTarget == null) return this.logTargetError('receiveRoomData', targetSlug);

    return {
      event: 'receiveRoomData',
      data: this.connectionService.getConnectionByTarget(foundTarget)
    };
  }

  /**
   * Remove the client from the connected room and send to old room to update the data.
   *
   * @param targetSlug - The room to leave
   * @param client - Current client
   */
  @SubscribeMessage('leaveRoom')
  async handleLeaveTargetSession(
    @MessageBody() targetSlug: string,
    @ConnectedSocket() client: Socket
  ): Promise<WsResponse<ErrorReturn | string>> {
    const foundTarget = await this.targetService.findBySlug(targetSlug);

    if (foundTarget == null) {
      return this.logTargetError('leftRoom', targetSlug);
    }

    this.connectionService.removeUserFromAllConnection(client);
    this.server.in(targetSlug).emit('updateRoom');

    return {
      event: 'leftRoom',
      data: `Left room: ${targetSlug}`
    };
  }

  /**
   * Remove the disconnecting client from connected rooms
   *
   * @param client - Current client
   */
  handleDisconnect(client: Socket): any {
    this.connectionService.removeUserFromAllConnection(client);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private logTargetError(event: string, targetSlug: string): WsResponse<ErrorReturn> {
    this.logger.error(`The send target: ${targetSlug} is not found`);

    return {
      event,
      data: { error: `NoTargetFound`, description: `The send target: ${targetSlug} is not found` }
    };
  }
}
