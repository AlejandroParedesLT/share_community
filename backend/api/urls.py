from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,  # Endpoint to get access & refresh tokens
    TokenRefreshView,  # Endpoint to refresh expired access tokens
    TokenVerifyView,  # (Optional) Endpoint to verify if a token is valid
)
from api.views import (
    AudioView, 
    BookView, 
    MovieView, 
    UserView, 
)
from api.views import (ItemTypeViewSet, 
                       GenreViewSet, 
                       ItemViewSet,
                       FollowerViewSet,
                       CommentViewSet,
                       LikeViewSet,
                       NotificationViewSet,
                       EventViewSet,
                       PostViewSet,
                       CountryViewSet,
                       ChatViewSet,
                       MessageViewSet)

app_name = "api"

# Registering ViewSets with the router
routerItems = DefaultRouter()
routerItems.register(r'itemtypes', ItemTypeViewSet)
routerItems.register(r'genres', GenreViewSet)
routerItems.register(r'items', ItemViewSet)

routerPostings = DefaultRouter()
routerPostings.register(r'followers', FollowerViewSet)
routerPostings.register(r'comments', CommentViewSet)
routerPostings.register(r'likes', LikeViewSet)
routerPostings.register(r'notifications', NotificationViewSet)
routerPostings.register(r'events', EventViewSet)
routerPostings.register(r'posts', PostViewSet)

routingUsers = DefaultRouter()
#routingUsers.register(r'user', UserView)
routingUsers.register(r'countries', CountryViewSet)

routingChat = DefaultRouter()
routingChat.register(r'chats', ChatViewSet)
routingChat.register(r'messages', MessageViewSet)

urlpatterns = [
    # Django methods
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
        
    # Users
    path('', include(routingUsers.urls)),
    path('user/', UserView.as_view(), name='user'),
    #path('user/<int:pk>/', UserView.as_view(), name='user_list'),
    
    # Item routes
    path('', include(routerItems.urls)),
    path('books/', BookView.as_view(), name='books'),
    path("movies/", MovieView.as_view(), name="movies"),
    path('audio/', AudioView.as_view(), name='audios'),
    
    # Retrieve get_presigned_url
    #path('get_presigned_url/', views.get_presigned_url, name='get_presigned_url'),

    # Posting routes
    path('', include(routerPostings.urls)),
    
    # Chat routes
    path('', include(routingChat.urls)),
    path("chats/<int:pk>/messages/", ChatViewSet.as_view({'get': 'messages'})),  # Add this line

]

# path('posting/', PostView.as_view(), name='post_list'),
# path('events/', EventView.as_view(), name='events'),