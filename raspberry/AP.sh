# Update packages
sudo apt-get -y update
sudo apt-get -y upgrade

# Install packages
sudo apt-get install -y hostapd udhcpd
apt-get install iptables
sudo /etc/init.d/iptables start

# Set a static IP
sudo ifconfig wlan0 192.168.40.1

sudo bash -c 'cat > /etc/network/interfaces' << EOT
source-directory /etc/network/interfaces.d

auto lo
iface lo inet loopback

iface eth0 inet manual

iface wlan0 inet static
    address 192.168.40.1
    netmask 255.255.255.0

allow-hotplug wlan1
iface wlan1 inet manual
    wpa-conf /etc/wpa_supplicant/wpa_supplicant.conf

up iptables-restore < /etc/iptables.ipv4.nat
EOT

# Configure udhcpd
sudo bash -c 'cat > /etc/udhcpd.conf' << EOT
start 192.168.40.20
end 192.168.40.70

interface wlan0

remaining yes

opt dns 8.8.8.8 8.8.4.4
opt subnet 255.255.255.0
opt router 192.168.40.1
opt lease 864000
EOT

sudo sed -i "s/^DHCPD_ENABLED=\"no\"/#DHCPD_ENABLED=\"no\"/g" /etc/default/udhcpd

sudo bash -c 'cat > /etc/hostapd/hostapd.conf' << EOT
interface=wlan0
driver=nl80211
ssid=HOMEZ SERVER
hw_mode=g
channel=6
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0 # 1 to Hide SSID
wpa=2
wpa_passphrase=123456789
wpa_key_mgmt=WPA-PSK
rsn_pairwise=CCMP
EOT

sudo sed -i "s/^#DAEMON_CONF=\"\"/DAEMON_CONF=\"\/etc\/hostapd\/hostapd.conf\"/g" /etc/default/hostapd

sudo sh -c "echo 1 > /proc/sys/net/ipv4/ip_forward"
sudo sed -i "s/^#net.ipv4.ip_forward=1/net.ipv4.ip_forward=1/g" /etc/sysctl.conf
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
sudo iptables -A FORWARD -i eth0 -o wlan0 -m state --state RELATED,ESTABLISHED -j ACCEPT
sudo iptables -A FORWARD -i wlan0 -o eth0 -j ACCEPT
sudo sh -c "iptables-save > /etc/iptables.ipv4.nat"

sudo service hostapd start
sudo service udhcpd start

sudo update-rc.d hostapd enable
sudo update-rc.d udhcpd enable
