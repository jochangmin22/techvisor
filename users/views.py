from .users import auth, auth_start, auth_verify, auth_password, access_token, register, update_user_data

def do_auth(request):
    return auth(request)

def do_auth_start(request):
    return auth_start(request)

def do_verify(request, code):
    return auth_verify(request, code)

def do_auth_password(request):
    return auth_password(request)

def do_access_token(request):
    return access_token(request)

def do_register(request):
    return register(request)

def do_update(request):
    return update_user_data(request)
