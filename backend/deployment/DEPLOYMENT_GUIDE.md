# HandyGH Deployment Guide

This comprehensive guide covers deploying the HandyGH Django backend to a production server.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Setup](#server-setup)
3. [Database Setup](#database-setup)
4. [Application Deployment](#application-deployment)
5. [Web Server Configuration](#web-server-configuration)
6. [SSL/TLS Setup](#ssltls-setup)
7. [Environment Variables](#environment-variables)
8. [Database Migrations](#database-migrations)
9. [Post-Deployment](#post-deployment)
10. [Monitoring and Maintenance](#monitoring-and-maintenance)
11. [Troubleshooting](#troubleshooting)

## Prerequisites

### Server Requirements

- **OS**: Ubuntu 22.04 LTS or later (recommended)
- **RAM**: Minimum 2GB, recommended 4GB+
- **CPU**: Minimum 2 cores, recommended 4+ cores
- **Storage**: Minimum 20GB SSD
- **Network**: Static IP address or domain name

### Required Software

- Python 3.11+
- PostgreSQL 14+
- Redis 7+
- Nginx 1.18+
- Git
- Supervisor or systemd (for process management)

### Domain and DNS

- Domain name configured and pointing to server IP
- SSL certificate (Let's Encrypt recommended)

## Server Setup

### 1. Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Install System Dependencies

```bash
# Python and build tools
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib libpq-dev

# Redis
sudo apt install -y redis-server

# Nginx
sudo apt install -y nginx

# Other utilities
sudo apt install -y git curl wget build-essential
```

### 3. Create Application User

```bash
# Create user for running the application
sudo useradd -m -s /bin/bash handygh
sudo usermod -aG sudo handygh

# Switch to application user
sudo su - handygh
```

### 4. Create Directory Structure

```bash
# Create application directories
mkdir -p /opt/handygh
cd /opt/handygh

# Create subdirectories
mkdir -p logs backups scripts
```

## Database Setup

### 1. Configure PostgreSQL

```bash
# Switch to postgres user
sudo su - postgres

# Create database and user
psql
```

```sql
-- Create database
CREATE DATABASE handygh_db;

-- Create user with password
CREATE USER handygh_user WITH PASSWORD 'your_secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE handygh_db TO handygh_user;

-- Grant schema privileges (PostgreSQL 15+)
\c handygh_db
GRANT ALL ON SCHEMA public TO handygh_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO handygh_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO handygh_user;

-- Exit psql
\q
```

```bash
# Exit postgres user
exit
```

### 2. Configure PostgreSQL for Remote Access (if needed)

```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/14/main/postgresql.conf

# Change listen_addresses
listen_addresses = 'localhost'  # Keep localhost for security

# Edit pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Add line for application user
local   handygh_db      handygh_user                            md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 3. Configure Redis

```bash
# Edit redis configuration
sudo nano /etc/redis/redis.conf

# Set password (uncomment and set)
requirepass your_redis_password_here

# Restart Redis
sudo systemctl restart redis-server
```

## Application Deployment

### 1. Clone Repository

```bash
cd /opt/handygh
git clone https://github.com/yourusername/handygh.git .
```

### 2. Create Virtual Environment

```bash
cd /opt/handygh/backend
python3.11 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
# Upgrade pip
pip install --upgrade pip

# Install production requirements
pip install -r requirements/production.txt
```

### 4. Configure Environment Variables

```bash
# Create .env file
nano /opt/handygh/.env
```

See [Environment Variables](#environment-variables) section for complete configuration.

### 5. Collect Static Files

```bash
cd /opt/handygh/backend
source venv/bin/activate
export DJANGO_SETTINGS_MODULE=handygh.settings.production

# Collect static files
python manage.py collectstatic --noinput --clear
```

### 6. Run Database Migrations

```bash
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### 7. Test Application

```bash
# Test with Gunicorn
gunicorn -c gunicorn_config.py handygh.wsgi:application

# Test in another terminal
curl http://localhost:8000/api/v1/health/
```

## Web Server Configuration

### 1. Configure Gunicorn Service

```bash
# Copy systemd service file
sudo cp /opt/handygh/backend/deployment/handygh.service /etc/systemd/system/

# Edit service file if needed
sudo nano /etc/systemd/system/handygh.service

# Reload systemd
sudo systemctl daemon-reload

# Enable and start service
sudo systemctl enable handygh
sudo systemctl start handygh

# Check status
sudo systemctl status handygh
```

### 2. Configure Nginx

```bash
# Copy nginx configuration
sudo cp /opt/handygh/backend/deployment/nginx.conf /etc/nginx/sites-available/handygh

# Update domain name in config
sudo nano /etc/nginx/sites-available/handygh

# Create symbolic link
sudo ln -s /etc/nginx/sites-available/handygh /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

## SSL/TLS Setup

### Using Let's Encrypt (Recommended)

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

### Manual SSL Certificate

If using a purchased SSL certificate:

```bash
# Copy certificate files
sudo mkdir -p /etc/ssl/handygh
sudo cp fullchain.pem /etc/ssl/handygh/
sudo cp privkey.pem /etc/ssl/handygh/

# Update nginx configuration
sudo nano /etc/nginx/sites-available/handygh

# Update SSL certificate paths
ssl_certificate /etc/ssl/handygh/fullchain.pem;
ssl_certificate_key /etc/ssl/handygh/privkey.pem;

# Restart nginx
sudo systemctl restart nginx
```

## Environment Variables

Create `/opt/handygh/.env` with the following configuration:

```bash
# Django Settings
DEBUG=False
SECRET_KEY=your-very-long-random-secret-key-here-change-this
DJANGO_SETTINGS_MODULE=handygh.settings.production
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database Configuration
DATABASE_URL=postgresql://handygh_user:your_db_password@localhost:5432/handygh_db

# JWT Configuration
JWT_ACCESS_TOKEN_LIFETIME=15
JWT_REFRESH_TOKEN_LIFETIME=10080

# OTP Configuration
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=5

# Rate Limiting
RATE_LIMIT_OTP_REQUEST=5/hour
RATE_LIMIT_OTP_VERIFY=10/hour

# Commission Configuration
DEFAULT_COMMISSION_RATE=0.10

# SMS Provider Configuration
SMS_PROVIDER=twilio
SMS_API_KEY=your-sms-api-key

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@example.com
EMAIL_HOST_PASSWORD=your-email-app-password
DEFAULT_FROM_EMAIL=noreply@handygh.com

# Redis Configuration
REDIS_URL=redis://:your_redis_password@127.0.0.1:6379/1

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# CSRF Configuration
CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Admin Configuration
ADMIN_URL=secure-admin-path/

# Sentry Configuration (Optional)
SENTRY_DSN=your-sentry-dsn-here

# File Upload Configuration
FILE_UPLOAD_MAX_MEMORY_SIZE=5242880
DATA_UPLOAD_MAX_MEMORY_SIZE=5242880
```

### Generating SECRET_KEY

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

## Database Migrations

### Initial Migration

```bash
cd /opt/handygh/backend
source venv/bin/activate
export DJANGO_SETTINGS_MODULE=handygh.settings.production

# Run migrations
python manage.py migrate
```

### Future Migrations

```bash
# Before deploying new code with migrations:

# 1. Backup database
sudo -u postgres pg_dump handygh_db > /opt/handygh/backups/db_backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Pull latest code
cd /opt/handygh
git pull origin main

# 3. Activate virtual environment
source backend/venv/bin/activate

# 4. Install any new dependencies
pip install -r backend/requirements/production.txt

# 5. Run migrations
cd backend
python manage.py migrate

# 6. Collect static files (if changed)
python manage.py collectstatic --noinput

# 7. Restart application
sudo systemctl restart handygh

# 8. Check status
sudo systemctl status handygh
```

### Rolling Back Migrations

```bash
# List migrations
python manage.py showmigrations

# Rollback to specific migration
python manage.py migrate app_name migration_name

# Restore from backup if needed
sudo -u postgres psql handygh_db < /opt/handygh/backups/db_backup_YYYYMMDD_HHMMSS.sql
```

## Post-Deployment

### 1. Create Superuser

```bash
cd /opt/handygh/backend
source venv/bin/activate
python manage.py createsuperuser
```

### 2. Verify Deployment

```bash
# Check application status
sudo systemctl status handygh

# Check nginx status
sudo systemctl status nginx

# Check logs
sudo journalctl -u handygh -f

# Test API endpoints
curl https://yourdomain.com/api/v1/health/
curl https://yourdomain.com/api/docs/
```

### 3. Configure Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

### 4. Set Up Log Rotation

```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/handygh
```

```
/var/log/handygh/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 handygh handygh
    sharedscripts
    postrotate
        systemctl reload handygh > /dev/null 2>&1 || true
    endscript
}
```

### 5. Set Up Automated Backups

```bash
# Create backup script
nano /opt/handygh/scripts/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/handygh/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
sudo -u postgres pg_dump handygh_db | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Media files backup
tar -czf "$BACKUP_DIR/media_$DATE.tar.gz" /opt/handygh/backend/media/

# Keep only last 30 days
find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +30 -delete
find "$BACKUP_DIR" -name "media_*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
chmod +x /opt/handygh/scripts/backup.sh

# Add to crontab
crontab -e

# Add line (runs daily at 2 AM)
0 2 * * * /opt/handygh/scripts/backup.sh >> /opt/handygh/logs/backup.log 2>&1
```

## Monitoring and Maintenance

### Application Logs

```bash
# View application logs
sudo journalctl -u handygh -f

# View nginx access logs
sudo tail -f /var/log/nginx/handygh_access.log

# View nginx error logs
sudo tail -f /var/log/nginx/handygh_error.log

# View application logs
tail -f /opt/handygh/backend/logs/handygh.log
```

### System Monitoring

```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check running processes
ps aux | grep gunicorn
```

### Database Monitoring

```bash
# Connect to database
sudo -u postgres psql handygh_db

# Check database size
SELECT pg_size_pretty(pg_database_size('handygh_db'));

# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Check active connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'handygh_db';
```

### Performance Monitoring

Set up monitoring tools:
- **Sentry**: Error tracking and performance monitoring
- **Prometheus + Grafana**: Metrics and dashboards
- **Uptime monitoring**: UptimeRobot, Pingdom, or similar

### Regular Maintenance Tasks

**Daily**:
- Check application logs for errors
- Monitor disk space
- Verify backups completed

**Weekly**:
- Review error rates in Sentry
- Check database performance
- Review security logs

**Monthly**:
- Update system packages: `sudo apt update && sudo apt upgrade`
- Review and optimize database queries
- Test backup restoration
- Review SSL certificate expiration

## Troubleshooting

### Application Won't Start

```bash
# Check service status
sudo systemctl status handygh

# Check logs
sudo journalctl -u handygh -n 100

# Common issues:
# 1. Environment variables not set
# 2. Database connection failed
# 3. Port already in use
# 4. Permission issues

# Test manually
cd /opt/handygh/backend
source venv/bin/activate
gunicorn -c gunicorn_config.py handygh.wsgi:application
```

### Database Connection Errors

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check database exists
sudo -u postgres psql -l | grep handygh_db

# Test connection
sudo -u postgres psql handygh_db

# Check pg_hba.conf authentication
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

### Static Files Not Loading

```bash
# Collect static files again
cd /opt/handygh/backend
source venv/bin/activate
python manage.py collectstatic --noinput --clear

# Check permissions
ls -la staticfiles/

# Check nginx configuration
sudo nginx -t
sudo systemctl restart nginx
```

### High Memory Usage

```bash
# Check Gunicorn workers
ps aux | grep gunicorn

# Reduce workers in gunicorn_config.py
# workers = (cpu_count * 2) + 1  # Reduce this

# Restart application
sudo systemctl restart handygh
```

### SSL Certificate Issues

```bash
# Check certificate expiration
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test nginx SSL configuration
sudo nginx -t
```

### 502 Bad Gateway

```bash
# Check if Gunicorn is running
sudo systemctl status handygh

# Check if Gunicorn is listening on correct port
sudo netstat -tlnp | grep 8000

# Check nginx error logs
sudo tail -f /var/log/nginx/handygh_error.log

# Restart services
sudo systemctl restart handygh
sudo systemctl restart nginx
```

## Deployment Checklist

Before going live:

- [ ] Server provisioned and secured
- [ ] PostgreSQL installed and configured
- [ ] Redis installed and configured
- [ ] Application code deployed
- [ ] Virtual environment created and dependencies installed
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Superuser created
- [ ] Static files collected
- [ ] Gunicorn service configured and running
- [ ] Nginx configured and running
- [ ] SSL certificate installed and working
- [ ] Firewall configured
- [ ] Log rotation configured
- [ ] Automated backups configured
- [ ] Monitoring tools set up
- [ ] Domain DNS configured
- [ ] All API endpoints tested
- [ ] Load testing performed
- [ ] Security audit completed
- [ ] Documentation updated

## Security Best Practices

1. **Keep software updated**: Regularly update OS, Python, and dependencies
2. **Use strong passwords**: For database, Redis, admin accounts
3. **Restrict SSH access**: Use key-based authentication, disable root login
4. **Configure firewall**: Only allow necessary ports
5. **Use HTTPS**: Always use SSL/TLS in production
6. **Secure environment variables**: Never commit .env to git
7. **Regular backups**: Automate and test backup restoration
8. **Monitor logs**: Set up alerts for suspicious activity
9. **Rate limiting**: Configure appropriate rate limits
10. **Security headers**: Ensure all security headers are set

## Support and Resources

- **Django Documentation**: https://docs.djangoproject.com/
- **Gunicorn Documentation**: https://docs.gunicorn.org/
- **Nginx Documentation**: https://nginx.org/en/docs/
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Let's Encrypt**: https://letsencrypt.org/docs/

## Rollback Procedure

If deployment fails:

```bash
# 1. Stop application
sudo systemctl stop handygh

# 2. Restore database backup
sudo -u postgres psql handygh_db < /opt/handygh/backups/db_backup_YYYYMMDD_HHMMSS.sql

# 3. Checkout previous version
cd /opt/handygh
git checkout <previous-commit-hash>

# 4. Reinstall dependencies (if needed)
cd backend
source venv/bin/activate
pip install -r requirements/production.txt

# 5. Collect static files
python manage.py collectstatic --noinput

# 6. Start application
sudo systemctl start handygh

# 7. Verify
curl https://yourdomain.com/api/v1/health/
```

## Scaling Considerations

As your application grows:

1. **Horizontal scaling**: Add more application servers behind a load balancer
2. **Database optimization**: Add read replicas, connection pooling
3. **Caching**: Implement Redis caching for frequently accessed data
4. **CDN**: Use CDN for static and media files
5. **Background tasks**: Use Celery for async task processing
6. **Database partitioning**: Partition large tables
7. **Monitoring**: Implement comprehensive monitoring and alerting

---

**Last Updated**: 2025-01-15
**Version**: 1.0.0
