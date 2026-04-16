from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Swagger UI
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/',   SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/',  SpectacularRedocView.as_view(url_name='schema'),   name='redoc'),
    path('api/placements/',  include('apps.placements.urls')),
    path('api/logs/',        include('apps.logs.urls')),
    path('api/evaluations/', include('apps.evaluations.urls')),
    path('api/admin/',       include('apps.admin_panel.urls')),

    # App routes
    path('api/auth/', include('apps.users.urls')),
]

# Check whether routes are functional