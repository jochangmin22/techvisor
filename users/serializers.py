from rest_framework import serializers
from .models import users, email_auth, auth_tokens, user_profiles

class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = users
        field = ['uuid', 'from','password', 'role', 'data']

class EmailAuthSerializer(serializers.ModelSerializer):
    class Meta:
        model = email_auth
        field = ['id', 'code','email', 'logged']

    # def create(self, validated_data):
    #     emailAuth = email_auth(
    #         code=validated_data['code'],
    #         email=validated_data['email'],
    #         logged=validated_data['logged']
    #     )
    #     emailAuth.save()
    #     return emailAuth