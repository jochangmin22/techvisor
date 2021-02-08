from . import users

def password(request):
    return users.password(request)

def email(request):
    return users.email(request)

def reset_email(request):
    return users.reset_email(request)

def change_password(request):
    return users.change_password(request)

def access_token(request):
    return users.access_token(request)

def verify_email_code(request):
    return users.verify_email_code(request)
    
def change_email(request):
    return users.change_email(request)

def delete_account(request):
    return users.delete_account(request)

def register(request):
    return users.register(request)    

def do_update(request):
    return users.update_user_data(request)
