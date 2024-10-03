from http.server import SimpleHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn
import os
import json
import uuid
import socket
import dbManager
import shutil
import threading
import wifiManager

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

   # Handle GET requests for API calls
   def do_GET(self):
      if self.path.startswith('/api/'):
         name = self.path[len('/api/'):]
         handleApiRequest(self, name)
      else:
         super().do_GET()

   # Handle Post Requests
   def do_POST(self):
      content_length = int(self.headers['Content-Length'])
      post_data = self.rfile.read(content_length).decode('utf-8').strip('"')
      action = self.path.lstrip('/')
      handlePostRequest(self, action, post_data)

   # Handle End Headers
   def end_headers(self):
       self.send_header('Access-Control-Allow-Origin', '*')
       self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
       self.send_header('Access-Control-Allow-Headers', 'Content-Type')
       SimpleHTTPRequestHandler.end_headers(self)

   # Sends a plain text response to client
   def send_plain_response(self, text):
      try:
         self.send_response(200)
         self.send_header('Content-type', 'text/plain')
         self.end_headers()
         self.wfile.write(str(text).encode('utf-8'))
      except Exception as e:
         self.send_error(500, f"Internal Server Error: {str(e)}")

# Handle Post Requests, mainly from frontend
def handlePostRequest(httpHandler, action, data):
   #print(f"Action: {action}, Params: {data}")
   res = ""

   if action == "dbQuery":
      res = dbManager.query(data)

   if action == "updateWifi":
      ssid = json.loads(data).get("ssid")
      password = json.loads(data).get("password")
      staticIp = json.loads(data).get("staticip")
      res = json.dumps({"success": True, "data": data})
      wifiManager.connectNewNetwork(ssid, password, staticIp)

   answer = {"answer": res}
   httpHandler.send_response(200)
   httpHandler.end_headers()
   httpHandler.wfile.write(json.dumps(answer).encode('utf-8'))


def handleApiRequest(httpHandler, name):
   liveDataJson = dbManager.query("SELECT * FROM live")
   liveData = json.loads(liveDataJson)

   if name == "live":
      httpHandler.send_plain_response(liveDataJson)
   elif name == "solar_power":
      value = liveData[0]["p_sun"]
      httpHandler.send_plain_response(value)
   elif name == "load_power":
      value = liveData[0]["p_load"]
      httpHandler.send_plain_response(value)
   elif name == "batt_soc":
      value = liveData[0]["batt_soc"]
      httpHandler.send_plain_response(value)
   elif name == "overview":
      answer = "Die Solaranlage produziert gerade " + str(liveData[0]["p_sun"]) + " Watt, der Verbrauch liegt bei " + str(liveData[0]["p_load"]) + " Watt. Die Batterie ist zu " + str(liveData[0]["batt_soc"]) + " Prozent geladen."
      httpHandler.send_plain_response(answer)
   elif name == "config":
      with open('config.json', 'r') as config_file:
         config_data = json.load(config_file)
      httpHandler.send_plain_response(json.dumps(config_data))
   elif name == "wifi_networks":
      networks = wifiManager.getAvailableNetworks()
      httpHandler.send_plain_response(json.dumps(networks))
   else:
      httpHandler.send_plain_response("Invalid API Request: " + name)

# -------------------------------------------
# Start Server
def start():
   httpd = ThreadingHTTPServer(('0.0.0.0', 80), CustomHandler)
   ip = socket.gethostbyname(socket.gethostname())
   print(f"Server Started. You can visit the interface locally at: http://{ip}")
   httpd.serve_forever()

# End of File
