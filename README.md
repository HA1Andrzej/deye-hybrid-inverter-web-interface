_Warning - this is still a work in progress in a very early state. Although the software is functional, it is not guaranteed that it is safe to use for your system and that future updates will not break the database. This message will be removed, once everything's done._

### Deye Hybrid PV Interface

This project realizes an fully integrated interface for the Deye Hybrid Solar Inverter (4kW, 8kW, 10kW, 12kW). It will read all of the imporant data from the inverter roughly once per second and save all the data in a database. Using the responsive Web Interface you can see all of the live information, as well as historical data and interesting statistics.
![Screenshot Desktop](https://clippy.cc/postimg/438531128064)

## What You Need

1. **Raspberry Pi.** It was tested on the Raspberry Pi 3B+, but is expected to work on other models as well.
2. **USB to RS485 Converter & RJ45 Cable.** This will be needed for the Serial Connection betwenn the Pi and the Deye Inverter. I used [this one](https://www.amazon.de/dp/B09SB85W3J?psc=1&ref=ppx_yo2ov_dt_b_product_details) from Amazon, but others should also work just fine.
3. **USB SSD.** While it is not absolutely necessary, it is recommended to boot the Pi from an SSD. This will not only maximize the speed and reliability, but it will also maximize the life span of the system, since most SD-Cards and USB-Sticks will probably not survive the conditions of one or two decades being continously acitve.

## Setup

# Hardware

1. Cut end of the RJ45 Cable to expose the wires. We will only need three of these wires.
2. Connect them to the RS485 Converter.
3. Connect the other end of the RJ45 Cable with the "Modbus"-Port of the Inverter.
4. ...

# Software

1. Install Raspberry Pi OS Lite onto the SSD. You can do so with the official Raspberry Pi Imager tool on any Windows, macOS or Linux machine. You can setup SSH and Wifi for a headless start.
2. ...

Coming Soon

##

## Coming Soon, Work in Progress
