from django.db import models
import uuid

# Create your models here.
class Users(models.Model):
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
    download_count = models.PositiveIntegerField(default = 0)
    merchant_uid = models.CharField(max_length=300, null=True)
    # @OneToOne(type => UserProfile, profile => profile.user)
    # profile!: UserProfile;

    def __str__(self):
        return self.data['email']

    class Meta:
        db_table = '"users"'
        verbose_name_plural = "users"
        
#   @OneToOne(type => UserProfile, profile => profile.user)

class User_profiles(models.Model):
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
        Users,
        on_delete=models.CASCADE,
        null=True
    )    
    fk_user_id = models.UUIDField()
    profile_links =models.JSONField(default=dict, null=True)
    about = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = '"user_profiles"'
        verbose_name_plural = "user_profiles"

class Auth_tokens(models.Model):
    objects = models.Manager()
    id = models.UUIDField(
        primary_key = True,
        default = uuid.uuid4,
        editable = False)
    fk_user_id = models.UUIDField()
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now_add=True)
    diabled = models.BooleanField(default=False)
    user = models.ForeignKey(Users, on_delete=models.CASCADE,null=True)

    class Meta:
        db_table = '"auth_tokens"'
        verbose_name_plural = "auth_tokens"

class Email_auth(models.Model):
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

    def __str__(self):
        return self.email

    class Meta:
        db_table = '"email_auth"'    
        verbose_name_plural = "email_auth"

class Social_accounts(models.Model):
    objects = models.Manager()
    id = models.UUIDField(
        primary_key=True,
        default = uuid.uuid4,
        editable = False
    )
    # fk_user_id = models.UUIDField()
    social_id = models.CharField(max_length=255)
    access_token =models.CharField(max_length=255)
    provider = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(Users, on_delete=models.CASCADE, db_column='"fk_user_id"')

    class Meta:
        db_table = '"social_accounts"'     
        verbose_name_plural = "social_accounts"

class Admin_users(models.Model):
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
        verbose_name_plural = "admin_users"