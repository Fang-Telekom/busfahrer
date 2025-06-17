from django.shortcuts import render
from django.http import JsonResponse
from channels.layers import get_channel_layer

import string, random, json
from .models import Party, User, Deck

# Create your views here.
def create (request):
    name = json.loads(request.body).get('name')
    if(name != "" or name == None):
        user = User(name=name, lvl=1)
        user.save()
    else:
        return JsonResponse({'error': "Party no for u"}, status=400)
    try:
        chars = string.ascii_uppercase + string.digits  # A-Z + 0-9
        code = ''.join(random.choices(chars, k=4))
        
        while(Party.objects.filter(code=code).exists()):
            code = ''.join(random.choices(chars, k=4))
        
        
        deck = Deck()    
        deck.save()
        deck.reset_deck()
        print(f"✅ Deck created: {deck.id}")

        party = Party(name=name, code=code)
        party.gameCards = deck
        party.save()
        print(f"✅ Party created: {party.id}")

        #add player
        party.player.add(user)
        print(f"✅ User added to party: {user.id}")

        #add Deck
        
        party.save()
        print("✅ Party updated with deck")

        return JsonResponse({"code": code}, status=200)
    except Exception as e:
        print("❌ Error during party creation:", str(e))
        return JsonResponse({'error': "Party no for u"}, status=405)
    
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

class play(WebsocketConsumer):
    party = {}

    
    def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"{self.room_name}"

        if("username" in self.scope["url_route"]["kwargs"]):
             self.username = self.scope["url_route"]["kwargs"]["username"]
        else:
            self.username = f"Guest_{random.randint(1000, 9999)}"
        
        if(self.room_name not in play.party):
            play.party[self.room_name] = {
                "players": {},
                "room": self.room_group_name,
                "master": self.username,
                "turn": 0,
                "pyramid": [], 
                "bus_cards": [],
                "phase": "lobby",
                "deck": []
            }
        elif(play.party[self.room_name]["phase"] != "lobby"):
            self.close()

        self.room = play.party[self.room_name]
        self.room["players"][self.channel_name] = {
            "username": self.username,
            "cards": [],
            "state": "waiting",
            "score": 0,
            "channel_name": self.channel_name
        }

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )

        self.accept()

        player = {
            "type": "player",
            "player": self.username
        }
        self.send_to_channel(player)
        self.broadcast_game_state()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )

        if self.channel_name in self.room["players"]:
            del self.room["players"][self.channel_name]

        if not self.room["players"]:
            del play.party[self.room_name]

        self.broadcast_game_state()

    # Receive message from WebSocket
    def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get("action")

        if action == "start":
            self.start_game()
        elif action == "guess":
            self.handle_guess(data)
        elif action == "next_phase":
            self.advance_phase()
        elif action == "reveal_pyramid":
            self.reveal_pyramidCard(data)
        elif action == "guessBus":
            self.handle_guess(data)
        elif action == "chat":
            self.send_to_group({
                "type": "chat",
                "username": self.username,
                "message": data.get("message")
            })

    def start_game(self):
        if(self.room["master"] == self.username):
            self.room["deck"] = self.generate_deck()
            random.shuffle(self.room["deck"])

            for p in self.room["players"].values():
                p["cards"] = []
                p["state"] = "guessing"
                p["score"] = 0

            self.room["phase"] = "qualifying"
            self.send_to_group({
                "type": "system",
                "message": "Game started! First phase: Guessing."
            })

            self.broadcast_game_state()

    def handle_guess(self, data):
        guess = data.get("guess")
        player = self.room["players"][self.channel_name]

        if self.room["phase"] == "qualifying" and self.username == list(self.room["players"].values())[self.room["turn"]]["username"]:
            card = self.room["deck"].pop()
            correct = self.evaluate_guess(guess, card, player["cards"])
            player["cards"].append(card)
            player["state"] = "done" if len(player["cards"]) >= 4 else "guessing"
   
            self.room["turn"] += 1
            if(self.room["turn"] >= len(list(self.room["players"].values()))):
                self.room["turn"] = 0
                
            self.send_to_group({
                "type": "guess_result",
                "correct": correct,
                "next_player": list(self.room["players"].values())[self.room["turn"]]["username"],
                "card": card
            })

        if self.room["phase"] == "bus" and self.username == list(self.room["players"].values())[self.room["turn"]]["username"]:
            card = self.room["deck"].pop()

            rank_order = {'2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
                      '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14}
            #suit = card[-1]
            rank = rank_order[card[:-1]]
            prev_rank = rank_order[player["cards"][0][:-1]]
            correct = (guess == "higher" and rank > prev_rank) or (guess == "lower" and rank < prev_rank)
            
            player["cards"].append(card)
            player["score"] += int(correct)
            player["state"] = "done" if player["score"] > 4 else "guessing"

            self.send_to_group({
                "type": "guess_result",
                "next_player": list(self.room["players"].values())[self.room["turn"]]["username"],
                "correct": correct,
                "card": card
            })
        
        self.broadcast_game_state()

    def advance_phase(self):
        if(self.room["master"] == self.username):
            #new deck?
            #self.room["deck"] = self.generate_deck()
            random.shuffle(self.room["deck"])
            if self.room["phase"] == "qualifying" and all(len(p["cards"]) >= 4 for p in self.room["players"].values()):
                self.room["phase"] = "pyramid"
                self.setup_pyramid()
                self.send_to_group({
                    "type": "system",
                    "message": "Phase 2: Pyramid!"
                })

            elif self.room["phase"] == "pyramid":
                max_count = -1
                turn = -1
                for player in self.room["players"].values():
                    num_cards = len(player["cards"])
                    turn += 1
                    if num_cards > max_count:
                        max_count = num_cards
                        self.room["turn"] = turn
                    #elif num_cards == max_count:

                self.room["phase"] = "bus"
                self.room["deck"] = self.generate_deck()
                random.shuffle(self.room["deck"])
                
                self.send_to_group({
                    "type": "system",
                    "message": "Final Phase: Busfahren!"
                })
                self.send_to_group({
                    "type": "bus_setup",
                    "next_player": list(self.room["players"].values())[self.room["turn"]]["username"],
                    "card": self.room["deck"].pop()
                })
    	        
            self.broadcast_game_state()

    def setup_pyramid(self):
        self.room["pyramid"] = [self.room["deck"].pop() for _ in range(10)]

        self.send(text_data=json.dumps({
                "type": "pyramid",
                "pyramid": self.room["pyramid"]
            }))
    def reveal_pyramidCard(self, data):
        if self.room["master"] == self.username:
            order = data.get("id")
            self.send_to_group({
                    "type": "pyramidCard",
                    "pyramid_id": data.get("id")
                })
            
            for player in self.room["players"].values():
                for card in player["cards"][:]:
                    if self.room["pyramid"][order][:-1] == card[:-1]:
                        player["cards"].remove(card)
                        channel_layer = get_channel_layer()

                        self.send_to_player(player["channel_name"],{
                                "type": "pyramid_reveal",
                                "message": card
                            }
                        )
                        
            self.broadcast_game_state()

    def evaluate_guess(self, guess, card, previous_cards):
        rank_order = {'2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
                      '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14}
        suit = card[-1]
        rank = rank_order[card[:-1]]

        if len(previous_cards) == 0:
            #return (guess == "red" and suit in ['♥', '♦']) or (guess == "black" and suit in ['♠', '♣'])
            return (guess == "red" and suit in ['H', 'D']) or (guess == "black" and suit in ['S', 'C'])
        elif len(previous_cards) == 1:
            prev_rank = rank_order[previous_cards[0][:-1]]
            return (guess == "higher" and rank > prev_rank) or (guess == "lower" and rank < prev_rank)
        elif len(previous_cards) == 2:
            ranks = sorted([rank_order[c[:-1]] for c in previous_cards])
            return (guess == "inside" and ranks[0] < rank < ranks[1]) or (guess == "outside" and (rank < ranks[0] or rank > ranks[1]))
        elif len(previous_cards) == 3:
            return guess == suit

        return False

    def generate_deck(self):
        #suits = ['♠', '♥', '♦', '♣']
        #Spades, Heart, Diamond, Clubs 
        suits = ['S', 'H', 'D', 'C']
        ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
        return [f"{rank}{suit}" for suit in suits for rank in ranks]

    def broadcast_game_state(self):
        state = {
            "type": "state",
            "room": self.room_group_name,
            "phase": self.room["phase"],
            "master": self.room["master"],
            "players": {
                p["username"]: {
                    "score": p["score"],
                    "state": p["state"],
                    "cards": p["cards"] if c == self.channel_name else ["?"] * len(p["cards"])
                } for c, p in self.room["players"].items()
            }
        }
        self.send_to_group(state)

    def send_to_channel(self, message):
        async_to_sync(self.channel_layer.send)(
            self.channel_name,
            {
                "type": "game_message",
                "message": message
            }
        )
    def send_to_player(self, channel, message):
        async_to_sync(self.channel_layer.send)(
            channel,
            {
                "type": "game_message",
                "message": message
            }
        )
    def send_to_group(self, message):
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                "type": "game_message",
                "message": message
            }
        )

    def game_message(self, event):
        self.send(text_data=json.dumps(event["message"]))