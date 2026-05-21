import asyncio
import json
import websockets

rooms = {}
client_room = {}

async def broadcast_room(code, message):
    room = rooms.get(code)
    if not room:
        return

    payload = json.dumps(message)
    for client in set(room["clients"]):
        try:
            await client.send(payload)
        except Exception:
            pass

async def unregister_client(websocket):
    code = client_room.pop(websocket, None)
    if not code:
        return

    room = rooms.get(code)
    if not room:
        return

    room["clients"].discard(websocket)

    if websocket == room.get("host"):
        room["host"] = None
        await broadcast_room(code, {
            "type": "error",
            "message": "O host desconectou. Aguarde o host reconectar."
        })

    if not room["clients"]:
        rooms.pop(code, None)

async def send_error(websocket, message):
    await websocket.send(json.dumps({"type": "error", "message": message}))

async def handler(websocket):
    try:
        async for raw_message in websocket:
            try:
                message = json.loads(raw_message)
            except json.JSONDecodeError:
                await send_error(websocket, "Mensagem inválida.")
                continue

            message_type = message.get("type")

            if message_type == "create_room":
                code = message.get("code", "").strip().upper()
                quiz = message.get("quiz")

                if not code or not quiz:
                    await send_error(websocket, "Código de sala ou quiz ausente.")
                    continue

                room = rooms.get(code)
                if room and room.get("open") is False:
                    await send_error(websocket, "Esta sala já foi fechada.")
                    continue

                if not room:
                    room = {
                        "quiz": quiz,
                        "players": {},
                        "open": True,
                        "host": websocket,
                        "clients": {websocket},
                        "current_round": -1
                    }
                    rooms[code] = room
                else:
                    room["host"] = websocket
                    room["quiz"] = quiz
                    room["open"] = True
                    room["clients"].add(websocket)
                    room["current_round"] = -1

                client_room[websocket] = code

                await websocket.send(json.dumps({
                    "type": "room_created",
                    "code": code,
                    "open": room["open"],
                    "players": list(room["players"].keys())
                }))
                await broadcast_room(code, {
                    "type": "room_update",
                    "code": code,
                    "open": room["open"],
                    "players": list(room["players"].keys())
                })

            elif message_type == "join_room":
                code = message.get("code", "").strip().upper()
                name = message.get("name", "").strip()

                if not code or not name:
                    await send_error(websocket, "Código de sala ou nome ausente.")
                    continue

                room = rooms.get(code)
                if not room:
                    await send_error(websocket, "Sala não encontrada.")
                    continue

                if not room.get("open"):
                    await send_error(websocket, "A sala já está fechada.")
                    continue

                if name in room["players"]:
                    await send_error(websocket, "Nome de jogador já usado.")
                    continue

                room["players"][name] = websocket
                room["clients"].add(websocket)
                client_room[websocket] = code

                await broadcast_room(code, {
                    "type": "joined_room",
                    "code": code,
                    "players": list(room["players"].keys()),
                    "open": room["open"]
                })

            elif message_type == "rejoin_room":
                code = message.get("code", "").strip().upper()
                name = message.get("name", "").strip()
                print(code, name)

                if not code or not name:
                    await send_error(websocket, "Código de sala ou nome ausente.")
                    continue

                room = rooms.get(code)
                if not room:
                    await send_error(websocket, "Sala não encontrada.")
                    continue

                if name not in room["players"]:
                    await send_error(websocket, "Nome de jogador não encontrado na sala.")
                    continue

                room["clients"].add(websocket)
                room["players"][name] = websocket
                client_room[websocket] = code

                await broadcast_room(code, {
                    "type": "rejoined_room",
                    "code": code,
                    "players": list(room["players"].keys()),
                    "open": room["open"]
                })


            elif message_type == "start_round":
                code = message.get("code", "").strip().upper()
                room = rooms.get(code)

                if not room:
                    await send_error(websocket, "Sala não encontrada.")
                    continue

                if websocket != room.get("host"):
                    if room.get("host") is None:
                        # Permite que o host reassuma o controle após recarregar/navegar de página.
                        room["host"] = websocket
                        room["clients"].add(websocket)
                        client_room[websocket] = code
                    else:
                        await send_error(websocket, "Apenas o host pode iniciar a rodada.")
                        continue

                room["open"] = False
                room["current_round"] = room.get("current_round", -1) + 1

                if room["current_round"] >= len(room["quiz"]):
                    await broadcast_room(code, {"type": "game_over"})
                    continue
                clients_info = [str(client.remote_address) for client in room["clients"]]
                # question = room["quiz"][room["current_round"]]
                await broadcast_room(code, {
                    "type": "round_started",
                    "code": code,
                    "round": room["current_round"] + 1,
                    "indexRound": room["current_round"],
                    # "question": question["question"],
                    # "options": question["options"],
                    "totalRounds": len(room["quiz"]),
                    "players": list(room["players"].keys()),
                    "open": room["open"],
                    "clients": clients_info,
                    "quiz": room["quiz"]
                })

            else:
                await send_error(websocket, "Tipo de mensagem desconhecido.")

    except websockets.ConnectionClosed:
        pass
    finally:
        await unregister_client(websocket)

async def main():
    print("Servidor WebSocket rodando em ws://localhost:8765")
    async with websockets.serve(handler, "0.0.0.0", 8765):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
