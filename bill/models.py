# from django.db import models

# import uuid

# from users.models import users

# # Create your models here.
# class products(models.Model):
#     name = models.CharField(max_length = 255)
#     price = models.IntegerField()

# class points(models.Model):
#     id = models.UUIDField(
#         primary_key = True,
#         default = uuid.uuid4,
#         editable = False
#     )
#     user = models.OneToOneField(users, on_delete = models.CASCADE, default = 0)
#     point = models.PositiveIntegerField(default = 0)
#     created = models.DateTimeField(auto_now_add = True, auto_now = False)
#     timestamp = models.DateTimeField(auto_now_add = False, auto_now = True)

#     def __str__(self):
#         return str(self.point)

#     class Meta:
#         db_table = '"points"'



# class point_transaction(models.Model):
#     user = models.ForeignKey(users, on_delete = models.CASCADE, null = True)
#     transaction_id = models.CharField(max_length = 120, null = True, black = True)
#     order_id = mdoels.CharField(max_length = 120, unique = True)
#     amount = models.PositiveIntegerField(default = 0)
#     success = models.BooleanField(default = False)
#     transaction_status = models.CharField(max_length = 220, null = True, black = True)
#     type = models.CharField(max_length = 120)
#     created = models.DateTimeField(auto_now_add = True, auto_now = False)

#     def __str__(self):
#         return self.order_id

#     class Meta:
#         db_table = '"point_transaction"'
#         ordering = ['-created']