import {
  APPLICATION_JSON,
  BufferEncoders,
  encodeBearerAuthMetadata,
  encodeCompositeMetadata,
  encodeRoute,
  MESSAGE_RSOCKET_AUTHENTICATION,
  MESSAGE_RSOCKET_COMPOSITE_METADATA,
  MESSAGE_RSOCKET_ROUTING,
  RSocketClient
} from 'rsocket-core'
import RSocketWebSocketClient from 'rsocket-websocket-client'
import { Observable } from 'rxjs'

const maxRSocketRequestN = 2147483647
const keepAlive = 60000
const lifetime = 180000
const dataMimeType = APPLICATION_JSON.string
const metadataMimeType = MESSAGE_RSOCKET_COMPOSITE_METADATA.string

export function connectClient(url: string): Promise<RClient> {
  return new Promise<RClient>((resolve, reject) => {
    const client = new RSocketClient({
      setup: {
        dataMimeType,
        keepAlive,
        lifetime,
        metadataMimeType
      },
      transport: new RSocketWebSocketClient(
        {
          debug: false,
          url: url
        },
        BufferEncoders
      )
    })

    client.connect().subscribe({
      onComplete: socket => {
        resolve(new RClient(socket))
      },
      onError: error => reject(error),
      onSubscribe: cancel => {
        /* call cancel() to abort */
      }
    })
  })
}

export class RClient {
  private socket: any

  constructor(socket: any) {
    this.socket = socket
  }

  public fireAndForget(path: string, token: string, data: string): Observable<void> {
    return new Observable<void>((subscriber: any) => {
      this.socket.fireAndForget({
        data: Buffer.from(JSON.stringify(data)),
        metadata: encodeCompositeMetadata([
          [MESSAGE_RSOCKET_ROUTING, encodeRoute(path)],
          [MESSAGE_RSOCKET_AUTHENTICATION, encodeBearerAuthMetadata(token)]
        ])
      })
      subscriber.complete()
    })
  }

  public requestResponse(path: string, token: string, data: string): Observable<any> {
    return new Observable<void>((subscriber: any) => {
      this.socket
        .requestResponse({
          data: Buffer.from(JSON.stringify(data)),
          metadata: encodeCompositeMetadata([
            [MESSAGE_RSOCKET_ROUTING, encodeRoute(path)],
            [MESSAGE_RSOCKET_AUTHENTICATION, encodeBearerAuthMetadata(token)]
          ])
        })
        .subscribe({
          onComplete(data: any) {
            subscriber.next(JSON.parse(data.data.toString()))
            subscriber.complete()
          },
          onError: (error: any) => subscriber.error(error),
          onSubscribe: (cancel: any) => {
            /* call cancel() to stop onComplete/onError */
          }
        })
    })
  }

  public requestStream(path: string, token: string, data: string): Observable<any> {
    return new Observable<void>((subscriber: any) => {
      this.socket
        .requestStream({
          data: Buffer.from(JSON.stringify(data)),
          metadata: encodeCompositeMetadata([
            [MESSAGE_RSOCKET_ROUTING, encodeRoute(path)],
            [MESSAGE_RSOCKET_AUTHENTICATION, encodeBearerAuthMetadata(token)]
          ])
        })
        .subscribe({
          onNext(data: any) {
            subscriber.next(JSON.parse(data.data.toString()))
          },
          onComplete: () => subscriber.complete(),
          onError: (error: any) => subscriber.error(error),
          onSubscribe: (subscription: any) => {
            subscription.request(maxRSocketRequestN)
          }
        })
    })
  }
}
