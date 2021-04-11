import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { TargetDocument } from '../target/target.schema';

export type Connection = {
  target: TargetDocument;
  users: string[];
};

@Injectable()
export class ConnectionService {
  private logger: Logger = new Logger(ConnectionService.name);
  connections: Connection[] = [];

  getConnectedUsersByTarget(target: TargetDocument) {
    const connection = this.getConnectionByTarget(target);

    if (connection == undefined) return null;

    return connection.users;
  }

  findUserInConnections(user: string) {
    return this.connections.filter((t) => t.users.includes(user));
  }

  connectUserToTarget(user: Socket, target: TargetDocument): Connection {
    const foundConnections = this.findUserInConnections(user.id);

    if (foundConnections.length > 0) this.removeUserFromAllConnection(user);

    const foundConnection = this.getConnectionByTarget(target);

    if (foundConnection == undefined) {
      const createdConnection = this.addToArray(user, { target, users: [] });
      this.connections.push(createdConnection);
      return createdConnection;
    } else {
      return this.addToArray(user, foundConnection, target);
    }
  }

  private addToArray(user: Socket, connection: Connection, target?: TargetDocument): Connection {
    connection.users.push(user.id);

    if (target != undefined) connection.target = target;

    user.join(connection.target.slug);
    user.to(connection.target.slug).emit('updateRoom');

    this.logger.log(`Client: ${user.id} joined Room: ${connection.target.slug}`);

    return connection;
  }

  removeUserFromAllConnection(user: Socket) {
    this.connections.forEach((t) => {
      if (t.users.includes(user.id)) {
        user.leave(t.target.slug);
        user.to(t.target.slug).emit('updateRoom');
        this.logger.log(`Client: ${user.id} left Room: ${t.target.slug}`);
      }

      t.users = t.users.filter((u) => u != user.id);
    });
  }

  getConnectionByTarget(target: TargetDocument) {
    const connection = this.connections.find((t) => t.target.slug == target.slug);
    if (connection != undefined) connection.target = target;

    return connection;
  }

  getConnections() {
    return this.connections;
  }
}
