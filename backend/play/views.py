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