import os
import subprocess

def install_dependencies():
    subprocess.run(['sudo', 'apt-get', 'update'], check=True)
    subprocess.run(['sudo', 'apt-get', 'install', '-y', 'python3-pymodbus', 'hostapd', 'dnsmasq'], check=True)

def create_service():
    script_path = os.path.abspath(__file__)
    backend_path = os.path.join(os.path.dirname(script_path), 'solarhub')

    service_content = f"""
[Unit]
Description=SolarHub
After=multi-user.target

[Service]
Type=simple
ExecStart=/usr/bin/python3 {os.path.join(backend_path, "main.py")}
WorkingDirectory={backend_path}
Restart=always
User=root
Environment=HOME=/root

[Install]
WantedBy=multi-user.target
    """

    try:
        with open("/etc/systemd/system/solarhub.service", 'w') as service_file:
            service_file.write(service_content)
        subprocess.run(["sudo", "systemctl", "daemon-reload"], check=True)
        subprocess.run(["sudo", "systemctl", "enable", "solarhub.service"], check=True)
        subprocess.run(["sudo", "systemctl", "start", "solarhub.service"], check=True)
        print("Service solarhub.service successfully created and started.")
    except Exception as e:
        print(f"Error creating or starting the service: {e}")

if __name__ == "__main__":
    install_dependencies()
    create_service()
    print("---------------------------------------")
    print("Done, your service is up now. Visit the interface using the IP address of your device in a browser.")
