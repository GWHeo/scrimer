from django.shortcuts import render


def ip_error_view(request):
    return render(request, 'responses/different_ip.html')
