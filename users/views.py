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
    
def register(request):
    return users.register(request)

def do_update(request):
    return users.update_user_data(request)

def interested(request):
    return users.update_user_interested(request)

def uninterested(request):
    return users.update_user_uninterested(request)

def create_label(request):
    return users.create_label(request)

def remove_label(request):
    return users.remove_label(request)

def labeling(request):
    return users.user_labeling(request)

def remove_labeling(request):
    return users.user_remove_labeling(request)