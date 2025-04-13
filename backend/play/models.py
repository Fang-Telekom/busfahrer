from django.db import models
import random
# Create your models here.

class Deck(models.Model):
    class Card(models.Model):
        symbolic = [
            ('H', 'Hearts'),
            ('D', 'Diamonds'),
            ('C', 'Clubs'),
            ('S', 'Spades'),
        ]
        values = [
            (2, '2'), (3, '3'), (4, '4'), (5, '5'),
            (6, '6'), (7, '7'), (8, '8'), (9, '9'),
            (10, '10'), (11, 'Jack'), (12, 'Queen'), (13, 'King'), (1, 'Ace'),
        ]
        symbol = models.CharField(max_length=1, choices=symbolic)
        value = models.IntegerField(choices=values)
        is_dealt = models.BooleanField(default=False)    
    cards = models.ManyToManyField(Card)
    
    def __str__(self):
        return f"Deck {self.id}"
    
    def reset_deck(self):
        self.cards.clear()
        for s, _ in Deck.Card.symbolic:
            for v, _ in Deck.Card.values:
                card, created = Deck.Card.objects.get_or_create(symbol=s, value=v)
                self.cards.add(card)
    
    def shuffle_deck(self):
        """Return the deck in a shuffled list (not saved in shuffled order)."""
        deck = list(self.cards.filter(is_dealt=False))
        random.shuffle(deck)
        return deck
    
class User(models.Model):
    class role(models.IntegerChoices):
        guest = 0
        master = 1

    name = models.CharField(max_length=20)
    lvl = models.IntegerField(choices=role.choices, default=role.guest)
    cards = models.ManyToManyField(Deck.Card)

    def __str__(self):
        return self.name
    
class Party (models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    gameCards = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name='deck')
    player = models.ManyToManyField(User)

    def __str__(self):
        return self.name

    def create_deck(self):
        self.cards.all().delete()  # reset
        for s, _ in Deck.Card.symbolic:
            for v, _ in Deck.Card.values:
                Deck.create(room=self, symbolic=s, value=v)