from django.db import models


class EmptyModel(models.Model):
    class Meta:
        abstract = True
