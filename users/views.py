from . import users

def password(request):
    return users.password(request)

def email(request):
    return users.email(request)

def access_token(request):
    return users.access_token(request)

def register(request):
    return users.register(request)

def do_update(request):
    return users.update_user_data(request)
