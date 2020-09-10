from . import users

def do_auth(request):
    return users.auth(request)

def do_auth_start(request):
    return users.auth_start(request)

# def do_verify(request, code):
#     return users.auth_verify(request, code)

def do_auth_password(request):
    return users.auth_password(request)

def do_access_token(request):
    return users.access_token(request)

def do_register(request):
    return users.register(request)

def do_update(request):
    return users.update_user_data(request)
