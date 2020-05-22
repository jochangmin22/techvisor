from django.contrib import admin
from users.models import users, user_profiles, auth_tokens, email_auth, social_accounts, admin_users 

admin.site.register(users)
admin.site.register(user_profiles)
admin.site.register(auth_tokens)
admin.site.register(email_auth)
admin.site.register(social_accounts)
admin.site.register(admin_users)
