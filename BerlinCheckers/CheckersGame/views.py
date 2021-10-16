from django.http.response import HttpResponse
from django.shortcuts import render, redirect
from .models import *
from accounts.models import *
from django.contrib.auth import logout
# Create your views here.


def create_game(request):
    user = User.objects.get(id = request.user.id)
    if user.is_authenticated:
        room_code = "100"
        game = Game(
            room_code = room_code,
            game_creater = user.id,
            game_opponent = None,
            is_over = False 
        )
        game.save()
        return redirect('/play/'+room_code+"?username="+user.username)
    else:
        return redirect('/login/')

def logout_view(request):
    if request.user.is_authenticated:
        logout(request)
    return HttpResponse("Logged out successfully")


def play(request, room_code):
    print(room_code)
    user = User.objects.get(id = request.user.id)
    game = Game.objects.get(room_code = room_code)
    
    if game.game_creater != user.id:
        if game.game_opponent:
            print(game.game_creater)
            print(game.game_opponent)
            print(user.id)
            if game.game_opponent != user.id and game.game_creater != user.id:
                return HttpResponse("Game_opponent already exists")
        else:
            game.game_opponent = user.id
            game.save()
    if game.is_over:
        return HttpResponse("Game is over")
    print(game.game_opponent)
    print(game.game_creater)
    print(user.id)
    context = {
        'username' :user.username,
        'room_code' : room_code
    }
    return render(request, 'play.html', context)

def join_game(request):
    room_code = request.GET['room_code']
    print(room_code)
    user = User.objects.get(id = request.user.id)
    game = Game.objects.get(room_code = room_code)
    if game.game_creater != user.id:
        if game.game_opponent:
            print(game.game_creater)
            print(game.game_opponent)
            print(user.id)
            if game.game_opponent != user.id and game.game_creater != user.id:
                return HttpResponse("Game_opponent already exists")
        else:
            game.game_opponent = user.id
            game.save()
    if game.is_over:
        return HttpResponse("Game is over")
    context = {
        'username' :user.username,
        'room_code' : room_code
    }
    return render(request, 'play.html', context)