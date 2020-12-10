from django.contrib import admin
from users.models import Users, User_profiles, Auth_tokens, Email_auth, Social_accounts, Admin_users 

admin.site.register(Users)
admin.site.register(User_profiles)
admin.site.register(Auth_tokens)
admin.site.register(Email_auth)
admin.site.register(Social_accounts)
admin.site.register(Admin_users)
