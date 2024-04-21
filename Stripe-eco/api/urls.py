from django.urls import path, include
from api.views import GroupViewset
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'groups', GroupViewset)

urlpatterns = [
    path('', include(router.urls)),
]
