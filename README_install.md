Ubuntu

Make sure python not equal or less than 3.8

sudo apt install python3-venv

sudo -i

cd /home/hamjetvpn/cesi

python3 -m venv venv

source venv/bin/activate

pip3 install -r requirements.txt

python3 cesi/run.py --config-file defaults/cesi.conf.toml