from rest_framework import serializers
from .models import Users, Email_auth, Auth_tokens, User_profiles

class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        field = ['id', 'from','password', 'role', 'data']

class EmailAuthSerializer(serializers.ModelSerializer):
    class Meta:
        model = Email_auth
        field = ['id', 'code','email', 'logged']

    # def create(self, validated_data):
    #     emailAuth = Email_auth(
    #         code=validated_data['code'],
    #         email=validated_data['email'],
    #         logged=validated_data['logged']
    #     )
    #     emailAuth.save()
    #     return emailAuth