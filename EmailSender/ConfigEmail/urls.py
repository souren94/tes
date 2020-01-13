from django.urls import path
from . import views

urlpatterns = [
    path('', views.load_page, name='load_page'),
    path('email_sender_details', views.email_sender_details, name='email_sender_details'),
    path('upload_email_address', views.upload_email_address, name='upload_email_address'),
    path('email_address_column_selection', views.email_address_column_selection, name='email_address_column_selection'),

]
