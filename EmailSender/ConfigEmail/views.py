from django.shortcuts import render
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import pandas as pd
import os
import json
import chardet
from django.http import HttpResponse, JsonResponse
from django.contrib import messages

smtp = smtplib.SMTP()
msg = MIMEMultipart('alternative')
df = pd.DataFrame()


# Create your views here.


def load_page(request):
    template = 'content/index.html'
    return render(request, template)


def email_sender_details(request):
    if request.method == 'POST':
        sender_id = request.POST.get('sender_email')
        sender_email_password = request.POST.get('sender_email_password')
        email_subject = request.POST.get('email_subject')
        smtp_server = request.POST.get('smtp_server')
        smtp_port = request.POST.get('smtp_port')
        email_body = request.POST.get('email_body')

        try:
            global smtp, msg
            connection_test, smtp, msg = test_email(sender_id, sender_email_password, email_subject, smtp_server,
                                                    smtp_port,
                                                    email_body)
            if connection_test == "Mail Sent":

                success_msg = "Mail sent successfully on {}." \
                              " Check your inbox for formatting and all details. If any changes " \
                              "required please go back to index page and correct it".format(sender_id)

                return render(request, 'content/send-mail.html', {'message': success_msg,
                                                                  'connection_successful': True})
            else:
                print("Connection Test ", connection_test)
                return render(request, 'content/index.html', {'error_log': connection_test, 'connection_fail': True})
        except Exception as e:
            return render(request, 'content/index.html', {'error_log': e, 'connection_fail': True})

        # return render(request, 'content/send-mail.html')


def test_email(sender_id, sender_email_password, email_subject, smtp_server, smtp_port, email_body):
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = email_subject
        msg['From'] = sender_id
        msg['To'] = sender_id
        # part1 = MIMEText(email_body, 'plain')
        part2 = MIMEText(email_body, 'html')
        # msg.attach(part1)
        msg.attach(part2)
        smtp = smtplib.SMTP(smtp_server, smtp_port)
        smtp.starttls(context=ssl.create_default_context())
        smtp.login(sender_id, sender_email_password)
        smtp.send_message(msg)
        return "Mail Sent", smtp, msg
    except Exception as e:
        return e


def upload_email_address(request):
    if request.method == 'POST':
        files = request.FILES['email_address_file']
        file_extension = os.path.splitext(files.name)[1]
        global df
        try:
            if file_extension == ".csv":
                df = pd.read_csv(files)
            elif file_extension == ".xls" or file_extension == ".xlsx":
                df = pd.read_excel(files)
            json_response = df.to_json(orient='records')
            return JsonResponse(json_response, safe=False)
        except Exception as e:
            print(e)
            return JsonResponse({'error': True, 'message': e})

    else:
        return render(request, 'content/send-mail.html')


def email_address_column_selection(request):
    if request.method == "POST":
        email_address_column = request.POST.get('col')
        email_address = get_email_address(email_address_column)
        return JsonResponse({'message': email_address}, safe=False)

    else:
        return render(request, 'content/send-mail.html')


def get_email_address(col_name):
    import time
    email = df[col_name].tolist()
    logs = []
    for email_add in email:
        try:
            del msg['to']
            msg['To'] = email_add
            smtp.send_message(msg)
            text = email_add
            logs.append(text)
            print(text)
            time.sleep(5)
        except Exception as e:
            logs.append(e)
    return str(logs)
