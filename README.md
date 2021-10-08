# RClient - RSocket Client Library

## Description

RClient is a simplified way to use RSocket in the browser. It is setup to support routing, bearer
authentication and json serialization out of the box. It utilises rxjs library to provide a
convenient way to deal with streams.

## Installation

npm:

```bash
npm install rclient
```

yarn:

```
yarn add rclient
```

## Usage

### Connection to the server

```javascript
import { connect } from "rclient";

const client = await connect("ws://localhost:8888/rsocket");
```

### Fire and forget

Sends the data to the server and doesn't wait for the response

Signature:
```javascript
fireAndForget(path: string, token: string, data: string): Observable<void>
```
path: message/x.rsocket.routing.v0 route

token: bearer token sent to the server

data: java object

Usage:
```javascript
this.client.fireAndForget("messages", "", { text: "Hello World" }).subscribe()

```

### Request response

Sends the data to the server and returns a single response

Signature:
```javascript
requestResponse(path: string, token: string, data: string): Observable<any>
```
path: message/x.rsocket.routing.v0 route

token: bearer token sent to the server

data: java object

Usage:
```javascript
this.client.requestResponse("messages", "", { text: "Hello World" })
  .subscribe(response => console.log(response))
```

### Request stream

Sends the data to the server and returns a stream of responses

Signature:
```javascript
requestStream(path: string, token: string, data: string): Observable<any>
```
path: message/x.rsocket.routing.v0 route

token: bearer token sent to the server

data: java object

Usage:
```javascript
this.client.requestStream("messages", "", { text: "Hello World" })
  .subscribe(response => console.log(response))
```

### Request channel
- NOT IMPLEMENTED
