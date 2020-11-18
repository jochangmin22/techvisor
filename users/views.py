from . import users

def verify_password(request):
    return users.verify_password(request)

def verify_email(request):
    return users.verify_email(request)

# def do_auth_password(request):
#     return users.auth_password(request)

def do_access_token(request):
    return users.access_token(request)

def do_register(request):
    return users.register(request)

def do_update(request):
    return users.update_user_data(request)
