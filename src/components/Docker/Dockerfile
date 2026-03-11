FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install in batches to avoid network timeouts
RUN apt-get update && apt-get install -y \
    bash coreutils findutils grep sed gawk \
    && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y \
    curl wget sqlite3 python3 \
    && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y \
    vim nano less tree file xxd \
    && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y \
    openssl jq git netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Create guest user
RUN useradd -m -s /bin/bash guest && echo "guest:guest" | chpasswd

# MOTD
RUN printf '\033[31m╔══════════════════════════════════════════════════════╗\033[0m\n\033[31m║         TCHOUKE SYSTEMS — RESTRICTED ACCESS          ║\033[0m\n\033[31m║              Unauthorized access is logged.          ║\033[0m\n\033[31m╚══════════════════════════════════════════════════════╝\033[0m\n\n\033[33mWelcome, investigator. Something is hidden on this system.\033[0m\n\033[33mThe One Piece is real. Find it. Screenshot it.\033[0m\n\033[33mEmail proof to: tchoukejoel@gmail.com\033[0m\n' > /etc/motd

# Breadcrumb 1 — home dir
RUN printf "You are logged in as: guest\nYour clearance level: 1\nHint: the system logs are always a good place to start.\n" \
    > /home/guest/README.txt && chown guest:guest /home/guest/README.txt

# Breadcrumb 2 — fake system log
RUN mkdir -p /var/log/tchouke && \
    printf "[2024-03-15 02:14:33] WARN  - Unauthorized access attempt blocked\n[2024-03-15 03:01:12] INFO  - Secret archive moved to /opt/.archive\n[2024-03-15 03:01:13] INFO  - Permissions restricted\n[2024-03-15 09:44:01] DEBUG - Backup key stored in /etc/tchouke/.key\n" \
    > /var/log/tchouke/system.log && chmod 644 /var/log/tchouke/system.log

# Breadcrumb 3 — config file
RUN mkdir -p /etc/tchouke && \
    printf "# Tchouke Systems Config\nDB_PATH=/var/db/secrets.db\nARCHIVE_PATH=/opt/.archive\n# Key hint: the answer to life, the universe, and everything.\n" \
    > /etc/tchouke/config.conf && \
    printf "42\n" > /etc/tchouke/.key && \
    chmod 644 /etc/tchouke/config.conf && chmod 600 /etc/tchouke/.key

# Breadcrumb 4 — SQLite database
RUN mkdir -p /var/db && sqlite3 /var/db/secrets.db \
    "CREATE TABLE agents (id INTEGER PRIMARY KEY, name TEXT, clearance INTEGER, status TEXT); \
     INSERT INTO agents VALUES (1,'J. Tchouke', 9, 'ACTIVE'); \
     INSERT INTO agents VALUES (2,'Unknown', 1, 'GUEST'); \
     CREATE TABLE secrets (id INTEGER PRIMARY KEY, name TEXT, value TEXT); \
     INSERT INTO secrets VALUES (1,'location','encoded: L2 9wdC8u YXJj aGl2ZS9 vbmVwaWVj ZS50eHQ='); \
     INSERT INTO secrets VALUES (2,'hint','remove the spaces, then base64 decode it'); \
     CREATE TABLE decoys (id INTEGER PRIMARY KEY, content TEXT); \
     INSERT INTO decoys VALUES (1,'nice try'); \
     INSERT INTO decoys VALUES (2,'keep looking'); \
     INSERT INTO decoys VALUES (3,'you are getting warmer');" && \
    chmod 644 /var/db/secrets.db

# The One Piece
RUN mkdir -p /opt/.archive && \
    printf "YOU FOUND IT.\n\nThe One Piece is real.\nJoel Tchouke built this easter egg for people like you.\nPeople who read source code for fun. People who actually try.\n\nNOW EMAIL THE SCREENSHOT:\n-> tchoukejoel@gmail.com\n-> Subject: I found the One Piece\n\nCongratulations, investigator.\n" \
    > /opt/.archive/onepiece.txt && \
    chmod 644 /opt/.archive/onepiece.txt && chmod 755 /opt/.archive

# Guest bashrc
RUN printf '\ncat /etc/motd\nexport PS1="\\[\\033[31m\\]guest@tchouke-systems\\[\\033[0m\\]:\\[\\033[33m\\]\\w\\[\\033[0m\\]\\$ "\nalias ll="ls -la"\nalias la="ls -la"\n' \
    >> /home/guest/.bashrc && chown guest:guest /home/guest/.bashrc

WORKDIR /home/guest
USER guest
CMD ["/bin/bash", "--login"]