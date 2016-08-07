
echo ""
echo ""
echo "------------------------------------------------"
echo "SETUP TIMEZONE"
echo "------------------------------------------------"

sudo echo "America/Sao_Paulo" > /etc/timezone
sudo dpkg-reconfigure -f noninteractive tzdata

sudo apt-get install -y language-pack-pt-base



echo ""
echo ""
echo "------------------------------------------------"
echo "INSTALLING NODEJS"
echo "------------------------------------------------"

sudo wget -O - https://nodejs.org/dist/v4.4.7/node-v4.4.7-linux-armv6l.tar.xz | sudo tar -C /usr/local/ --strip-components=1 -xJ
