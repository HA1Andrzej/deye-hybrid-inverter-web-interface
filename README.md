### Disclaimer

_This project is currently in its early stages and is still under development. While the software is functional, it may not be entirely safe for your system, and future updates could potentially disrupt the database. This disclaimer will be removed once the project is complete and stable._

# SolarHub: Web Interface for Deye Hybrid Inverter

SolarHub is a fully integrated web-based interface designed for the Deye Hybrid Solar Inverter (6kW, 8kW, 10kW, 12kW). The system continuously collects and stores critical data from the inverter at a high frequency. Through the responsive web interface, users can monitor real-time information, view historical data, and analyze important statistics.

![Screenshot of the Interface on Desktop](https://clippy.cc/postimg/684856207112)

### Features

1. Real-time monitoring of power generation and consumption.
2. Visualization of historical data.
3. Configurable battery charge and discharge limits to extend battery lifespan.
4. Mobile-friendly, responsive design.
5. Automatic Wi-Fi access point creation when the connection is lost, allowing users to connect the system to a new network via the web interface.
6. Periodic database backups to a USB stick when plugged into the Raspberry Pi.
7. Additional features planned for future updates.

# Prerequisites

1. **Raspberry Pi** – Tested on the Raspberry Pi 3B+, but should be compatible with other models.
2. **USB to RS485 Converter & RJ45 Cable** – Required for the serial connection between the Raspberry Pi and the Deye Inverter. [This converter](https://www.amazon.de/dp/B09SB85W3J?psc=1&ref=ppx_yo2ov_dt_b_product_details) from Amazon was used, but others should work as well.
3. **USB SSD** – While optional, using an SSD for booting the Raspberry Pi is recommended. It enhances speed, reliability, and extends the system’s lifespan, as most SD cards and USB sticks may not withstand continuous use over several years.

# Setup Guide

In this section, we'll walk you through the hardware and software setup for SolarHub, step by step. Even if you're new to working with Raspberry Pi or setting up solar inverters, this guide is designed to be easy to follow.

![Setup Diagram](https://clippy.cc/postimg/510832930572)

### Hardware Setup

1. **Prepare the RJ45 Cable:**

   -  Start by taking an RJ45 cable (also known as an Ethernet cable) and cut off one end to expose the internal wires.
   -  Inside the cable, you will find eight small wires. For this setup, we only need three of these wires: one for ground (GND) and two for data (A and B).

2. **Connect the Wires to the RS485 Converter:**

   -  Look at the wires from the RJ45 cable and identify the correct ones using the pinout guide below. Connect those to the RS485-USB converter as specified.
      -  **Pin 6:** This wire will be the ground connection and connects to **GND** on the RS485-USB converter.
      -  **Pin 7:** This wire carries the positive data signal and connects to **A** on the RS485-USB converter.
      -  **Pin 8:** This wire carries the negative data signal and connects to **B** on the RS485-USB converter.

   ![](https://clippy.cc/postimg/803908543956)

3. **Connect the RS485 Converter to the Inverter:**

   -  Once the wires are connected to the RS485 converter, plug the other end of the RJ45 cable into the "Modbus" port on the Deye Inverter.
   -  The RS485 converter will connect to your Raspberry Pi via USB.

4. **Power On and Verify Connections:**
   -  Power on your Raspberry Pi and ensure that all connections are secure. If everything is connected correctly, the hardware setup is complete.

### Software Setup

Now that your hardware is set up, we can move on to setting up the software on the Raspberry Pi.

1. **Prepare the SSD:**

   -  To begin, you'll need to install the Raspberry Pi OS Lite on your SSD. If you haven't already, download the [Raspberry Pi Imager tool](https://www.raspberrypi.org/software/) on your computer. This tool works on Windows, macOS, and Linux.
   -  Insert your SSD into your computer using a USB adapter.
   -  Open the Raspberry Pi Imager, select "Raspberry Pi OS Lite" as the operating system, and choose your SSD as the storage device.
   -  Before writing the OS to the SSD, click on the settings icon (⚙️) in the imager to configure SSH (enable SSH) and Wi-Fi (enter your Wi-Fi credentials). This will allow you to set up the Raspberry Pi without needing to connect a keyboard, mouse, or monitor (a "headless" setup).
   -  Click "Write" and wait for the process to complete.

2. **Start the Raspberry Pi:**

   -  Once the Raspberry Pi OS is installed, remove the SSD from your computer and insert it into your Raspberry Pi.
   -  Power on the Raspberry Pi. If you’ve configured everything correctly, it should connect to your Wi-Fi network.

3. **Access the Raspberry Pi via SSH:**

   -  If you’re using a Windows machine, you can use [PuTTY](https://www.putty.org/) to connect to your Raspberry Pi via SSH. On macOS and Linux, you can use the Terminal application.
   -  Open your SSH client and connect to your Raspberry Pi using the IP address of your Pi (you can find this in your router’s device list if you’re not sure). The command to connect via SSH will look something like this:
      ```bash
      ssh pi@<your-pi-ip-address>
      ```
   -  Replace `<your-pi-ip-address>` with the actual IP address. The default password for the Raspberry Pi OS is `raspberry`.

4. **Clone the SolarHub Repository:**

   -  Now that you’re connected to your Raspberry Pi, clone the SolarHub repository by running the following command:
      ```bash
      git clone https://github.com/MerlinHof/deye-hybrid-inverter-web-interface.git
      ```
   -  This command will download all the necessary files and scripts to your Raspberry Pi.

5. **Run the Setup Script:**

   -  Navigate to the directory where the repository was cloned:
      ```bash
      cd deye-hybrid-inverter-web-interface
      ```
   -  Run the setup script with superuser permissions:
      ```bash
      sudo python3 setup.py
      ```
   -  The setup script will install all necessary dependencies and configure your system. This may take a few minutes.

6. **Final Steps:**
   -  Once the setup script has finished, your Raspberry Pi should be ready to interact with the Deye Hybrid Inverter. You can now access the web interface by entering the IP address of your Raspberry Pi into a web browser on any device connected to the same network.

Congratulations! You've successfully set up SolarHub. You can now start monitoring your solar inverter in real-time, view historical data, and adjust settings as needed. If you encounter any issues, don't hesitate to check the project's GitHub page for troubleshooting tips or to reach out to the community for support.

...
