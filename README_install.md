Prequirements: Ubuntu + Python 3.6-3.8

```bash
$ # Copy the project to /home/hamjetvpn/cesi directory
$ sudo -i
$ cd /home/hamjetvpn/cesi
$ python3 -m venv venv
$ cp /home/hamjetvpn/cesi/defaults/cesi.service /etc/systemd/system/cesi.service
$ sudo systemctl daemon-reload
$ sudo systemctl start cesi
```

In Azure, set inbound rules for 80 port

Visit the http://52.255.34.174 in any browser

- Username: admin
- Password: In LassPass "Overwatch-Gateway-Monitor (Public)"

OR

Visit the http://10.8.0.1 in any browser

- Username: admin
- Password: In LassPass "Overwatch-Gateway-Monitor (Private)"