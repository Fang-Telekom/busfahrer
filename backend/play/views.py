from django.shortcuts import render
from django.http import JsonResponse

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
    players = {}
    pyramid = [] 
    bus_cards = []
    phase = "lobby"
    deck = []
    def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"party_{self.room_name}"

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )

        self.accept()
        self.username = self.scope["user"].username if self.scope["user"].is_authenticated else f"Guest_{random.randint(1000, 9999)}"
        play.players[self.channel_name] = {
            "username": self.username,
            "cards": [],
            "state": "waiting",
            "score": 0
        }
        self.broadcast_game_state()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )

        if self.channel_name in play.players:
            del play.players[self.channel_name]

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
        elif action == "chat":
            self.send_to_group({
                "type": "chat",
                "username": self.username,
                "message": data.get("message")
            })

    def start_game(self):
        play.deck = self.generate_deck()
        random.shuffle(play.deck)

        for p in play.players.values():
            p["cards"] = []
            p["state"] = "guessing"
            p["score"] = 0

        play.phase = "qualifying"
        self.send_to_group({
            "type": "system",
            "message": "Game started! First phase: Guessing."
        })

        self.broadcast_game_state()

    def handle_guess(self, data):
        guess = data.get("guess")
        player = play.players[self.channel_name]

        if play.phase == "qualifying":
            card = play.deck.pop()
            correct = self.evaluate_guess(guess, card, player["cards"])
            player["cards"].append(card)
            player["score"] += int(correct)
            player["state"] = "done" if len(player["cards"]) >= 4 else "guessing"

            self.send(text_data=json.dumps({
                "type": "guess_result",
                "correct": correct,
                "card": card
            }))
            self.broadcast_game_state()

    def advance_phase(self):
        if play.phase == "qualifying":
            play.phase = "pyramid"
            self.setup_pyramid()
            self.send_to_group({
                "type": "system",
                "message": "Phase 2: Pyramid!"
            })

        elif play.phase == "pyramid":
            play.phase = "bus"
            self.setup_busfahren()
            self.send_to_group({
                "type": "system",
                "message": "Final Phase: Busfahren!"
            })

        self.broadcast_game_state()

    def setup_pyramid(self):
        self.pyramid = [self.deck.pop() for _ in range(15)]

    def setup_busfahren(self):
        self.bus_cards = [self.deck.pop() for _ in range(5)]

    def evaluate_guess(self, guess, card, previous_cards):
        rank_order = {'2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
                      '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14}
        suit = card[-1]
        rank = rank_order[card[:-1]]

        if len(previous_cards) == 0:
            return (guess == "red" and suit in ['♥', '♦']) or (guess == "black" and suit in ['♠', '♣'])
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
        suits = ['♠', '♥', '♦', '♣']
        ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
        return [f"{rank}{suit}" for suit in suits for rank in ranks]

    def broadcast_game_state(self):
        state = {
            "type": "state",
            "phase": self.phase,
            "player": self.username,
            "players": {
                p["username"]: {
                    "score": p["score"],
                    "state": p["state"],
                    "cards": p["cards"] if c == self.channel_name else ["?"] * len(p["cards"])
                } for c, p in play.players.items()
            }
        }
        self.send_to_group(state)

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