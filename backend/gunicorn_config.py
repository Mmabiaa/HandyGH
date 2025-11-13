"""
Gunicorn configuration file for HandyGH production deployment.

This configuration optimizes Gunicorn for production use with:
- Worker processes based on CPU cores
- Appropriate timeouts for API requests
- Logging configuration
- Security settings
- Performance tuning

Usage:
    gunicorn -c gunicorn_config.py handygh.wsgi:application
"""

import multiprocessing
import os

# Server Socket
bind = os.getenv("GUNICORN_BIND", "0.0.0.0:8000")
backlog = 2048

# Worker Processes
workers = int(os.getenv("GUNICORN_WORKERS", multiprocessing.cpu_count() * 2 + 1))
worker_class = "sync"  # Use 'gevent' or 'eventlet' for async if needed
worker_connections = 1000
max_requests = 1000  # Restart workers after this many requests (prevents memory leaks)
max_requests_jitter = (
    50  # Add randomness to max_requests to prevent all workers restarting simultaneously
)
timeout = 30  # Workers silent for more than this many seconds are killed and restarted
graceful_timeout = 30  # Timeout for graceful workers restart
keepalive = 2  # The number of seconds to wait for requests on a Keep-Alive connection

# Server Mechanics
daemon = False  # Don't daemonize (let systemd/supervisor handle this)
pidfile = None  # Don't create a pidfile
user = None  # Run as the user who starts gunicorn
group = None  # Run as the group who starts gunicorn
tmp_upload_dir = None  # Use system default

# Logging
accesslog = os.getenv("GUNICORN_ACCESS_LOG", "-")  # "-" means stdout
errorlog = os.getenv("GUNICORN_ERROR_LOG", "-")  # "-" means stderr
loglevel = os.getenv("GUNICORN_LOG_LEVEL", "info")  # debug, info, warning, error, critical
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process Naming
proc_name = "handygh"


# Server Hooks
def on_starting(server):
    """Called just before the master process is initialized."""
    server.log.info("Starting Gunicorn server for HandyGH")


def on_reload(server):
    """Called to recycle workers during a reload via SIGHUP."""
    server.log.info("Reloading Gunicorn server")


def when_ready(server):
    """Called just after the server is started."""
    server.log.info("Gunicorn server is ready. Spawning workers")


def pre_fork(server, worker):
    """Called just before a worker is forked."""
    pass


def post_fork(server, worker):
    """Called just after a worker has been forked."""
    server.log.info(f"Worker spawned (pid: {worker.pid})")


def pre_exec(server):
    """Called just before a new master process is forked."""
    server.log.info("Forked child, re-executing.")


def worker_int(worker):
    """Called just after a worker exited on SIGINT or SIGQUIT."""
    worker.log.info(f"Worker received INT or QUIT signal (pid: {worker.pid})")


def worker_abort(worker):
    """Called when a worker received the SIGABRT signal."""
    worker.log.info(f"Worker received SIGABRT signal (pid: {worker.pid})")


# Security
limit_request_line = 4094  # Maximum size of HTTP request line in bytes
limit_request_fields = 100  # Limit the number of HTTP headers fields in a request
limit_request_field_size = 8190  # Limit the allowed size of an HTTP request header field

# SSL (if terminating SSL at Gunicorn level - usually done at reverse proxy)
# keyfile = None
# certfile = None
# ssl_version = ssl.PROTOCOL_TLS
# cert_reqs = ssl.CERT_NONE
# ca_certs = None
# ciphers = None

# Environment Variables
raw_env = [
    f"DJANGO_SETTINGS_MODULE={os.getenv('DJANGO_SETTINGS_MODULE', 'handygh.settings.production')}",
]

# Debugging (only enable in development)
reload = os.getenv("GUNICORN_RELOAD", "False").lower() == "true"
reload_engine = "auto"  # 'auto', 'poll', or 'inotify'
spew = False  # Install a trace function that spews every line executed by the server

# Performance Tuning
preload_app = True  # Load application code before worker processes are forked
sendfile = True  # Use sendfile() for serving static files (if not using nginx)
reuse_port = False  # Set the SO_REUSEPORT flag on the listening socket

# Worker Tmp Directory (for heartbeat)
worker_tmp_dir = "/dev/shm"  # Use shared memory for worker heartbeat (Linux only)
