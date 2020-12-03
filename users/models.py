from django.db import models
import uuid

# Create your models here.
class users(models.Model):
    objects = models.Manager()
    id = models.UUIDField(
        primary_key = True,
        default = uuid.uuid4,
        editable = False
    )
    my_from = models.CharField(db_column='from', max_length=255)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=255)
    data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now_add=True)
    is_certified = models.BooleanField(default=False)

    # @OneToOne(type => UserProfile, profile => profile.user)
    # profile!: UserProfile;

    class Meta:
        db_table = '"users"'

#   @OneToOne(type => UserProfile, profile => profile.user)

class user_profiles(models.Model):
    objects = models.Manager()
    id = models.UUIDField(
        primary_key=True,
        default = uuid.uuid4,
        editable = False
    )
    display_name = models.CharField(max_length=255)
    short_bio = models.CharField(max_length=255)
    thumbnail = models.CharField(max_length=255, null=True)
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now_add=True)
    user = models.OneToOneField(
        users,
        on_delete=models.CASCADE,
        null=True
    )    
    fk_user_id = models.UUIDField()
    profile_links =models.JSONField(default=dict, null=True)
    about = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = '"user_profiles"'

class auth_tokens(models.Model):
    objects = models.Manager()
    id = models.UUIDField(
        primary_key = True,
        default = uuid.uuid4,
        editable = False)
    fk_user_id = models.UUIDField()
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now_add=True)
    diabled = models.BooleanField(default=False)
    user = models.ForeignKey(users, on_delete=models.CASCADE,null=True)

    class Meta:
        db_table = '"auth_tokens"'
    

class email_auth(models.Model):
    objects = models.Manager()
    id = models.UUIDField(
        primary_key = True,
        default = uuid.uuid4,
        editable = False
    )
    code = models.CharField(max_length=255,null=True)
    email = models.CharField(max_length=255,null=True)
    logged = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = '"email_auth"'    

class social_accounts(models.Model):
    objects = models.Manager()
    id = models.UUIDField(
        primary_key=True,
        default = uuid.uuid4,
        editable = False
    )
    fk_user_id = models.UUIDField()
    social_id = models.CharField(max_length=255)
    access_token =models.CharField(max_length=255)
    provider = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = '"social_accounts"'     

class admin_users(models.Model):
    objects = models.Manager()
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    fk_user_id = models.UUIDField()
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = '"admin_users"' 
