from http.server import SimpleHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn
import os
import json
import uuid
import socket
import dbManager
import shutil
import threading
import wifi

# Extend HTTPServer to support threading
class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
   pass

# The Server itself
class CustomHandler(SimpleHTTPRequestHandler):
   # Set the ./frontend/ folder as base for the frontend
   def translate_path(self, path):
      relative_frontend_path = './frontend/'
      frontend_path = os.path.normpath(os.path.join(os.getcwd(), relative_frontend_path))
      final_path = os.path.join(frontend_path, path.lstrip('/'))
      return final_path

   # Overwrite log_message method to suppress logging
   def log_message(self, format, *args):
      pass

   # Handle Post Requests
   def do_POST(self):
      content_length = int(self.headers['Content-Length'])
      post_data = self.rfile.read(content_length).decode('utf-8').strip('"')
      action = self.path.lstrip('/')
      handleRequest(self, action, post_data)

   # Handle End Headers
   def end_headers(self):
       self.send_header('Access-Control-Allow-Origin', '*')
       self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
       self.send_header('Access-Control-Allow-Headers', 'Content-Type')
       SimpleHTTPRequestHandler.end_headers(self)

def handleRequest(httpHandler, action, data):
   #print(f"Action: {action}, Params: {data}")
   res = ""

   if action == "dbQuery":
      res = dbManager.query(data)

   if action == "updateWifi":
      ssid = json.loads(data).get("ssid")
      password = json.loads(data).get("password")
      res = json.dumps({"success": True, data: data})
      wifi.connectNewNetwork(ssid, password)

   answer = {"answer": res}
   httpHandler.send_response(200)
   httpHandler.end_headers()
   httpHandler.wfile.write(json.dumps(answer).encode('utf-8'))

# -------------------------------------------
# Start Server
def startServer():
   port = 80
   httpd = ThreadingHTTPServer(('0.0.0.0', port), CustomHandler)
   ip = socket.gethostbyname(socket.gethostname())
   print(f"Server Started. You can visit the interface locally at: http://{ip}:{port}")
   httpd.serve_forever()

# End of File
