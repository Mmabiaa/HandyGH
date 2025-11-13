# HandyGH Deployment Resources

This directory contains all resources needed for deploying the HandyGH backend to production.

## Contents

### Configuration Files

- **`gunicorn_config.py`** - Gunicorn WSGI server configuration
- **`nginx.conf`** - Nginx reverse proxy configuration
- **`handygh.service`** - Systemd service file for process management

### Scripts

- **`collect_static.sh`** - Script to collect static files for production
- **`backup.sh`** - Automated backup script (to be created during deployment)

### Documentation

- **`DEPLOYMENT_GUIDE.md`** - Complete step-by-step deployment guide
- **`TROUBLESHOOTING.md`** - Common issues and solutions
- **`ENVIRONMENT_VARIABLES.md`** - Complete environment variables reference
- **`STATIC_FILES.md`** - Static and media files configuration guide

## Quick Start

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3.11 python3.11-venv postgresql redis-server nginx git
```

### 2. Application Deployment

```bash
# Clone repository
cd /opt
sudo git clone https://github.com/yourusername/handygh.git
cd handygh/backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements/production.txt
```

### 3. Configuration

```bash
# Copy and configure environment variables
cp .env.example /opt/handygh/.env
nano /opt/handygh/.env

# Collect static files
./deployment/collect_static.sh

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### 4. Service Setup

```bash
# Install systemd service
sudo cp deployment/handygh.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable handygh
sudo systemctl start handygh

# Install nginx configuration
sudo cp deployment/nginx.conf /etc/nginx/sites-available/handygh
sudo ln -s /etc/nginx/sites-available/handygh /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. SSL Setup

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Documentation Overview

### DEPLOYMENT_GUIDE.md

Complete deployment guide covering:
- Prerequisites and server requirements
- Database setup (PostgreSQL, Redis)
- Application deployment steps
- Web server configuration (Nginx, Gunicorn)
- SSL/TLS setup with Let's Encrypt
- Environment variables configuration
- Database migrations
- Post-deployment tasks
- Monitoring and maintenance
- Scaling considerations

**Use this for**: Initial deployment and major updates

### TROUBLESHOOTING.md

Troubleshooting guide covering:
- Application issues (won't start, crashes, static files)
- Database issues (connection, migrations, performance)
- Authentication issues (OTP, JWT, permissions)
- API issues (500 errors, 502 errors, CORS)
- Performance issues (slow responses, memory, CPU)
- Deployment issues (git, pip, migrations)
- Monitoring and debugging techniques

**Use this for**: Resolving production issues

### ENVIRONMENT_VARIABLES.md

Complete reference for all environment variables:
- Required vs optional variables
- Development vs production configurations
- Variable descriptions and examples
- Security best practices
- Validation scripts
- Troubleshooting variable issues

**Use this for**: Configuring environment variables

### STATIC_FILES.md

Static and media files configuration:
- Development vs production setup
- Whitenoise configuration
- Nginx configuration for static/media files
- File upload security
- Cloud storage setup (S3)
- Performance optimization
- Backup strategies

**Use this for**: Configuring static and media file serving

## Configuration Files

### gunicorn_config.py

Production-ready Gunicorn configuration with:
- Automatic worker calculation based on CPU cores
- Appropriate timeouts and connection limits
- Comprehensive logging
- Worker recycling to prevent memory leaks
- Security settings
- Performance tuning

**Customization**:
```python
# Adjust workers based on your server
workers = 4  # Or use environment variable

# Adjust timeouts for long-running requests
timeout = 60  # seconds
```

### nginx.conf

Nginx reverse proxy configuration with:
- HTTP to HTTPS redirect
- SSL/TLS configuration
- Security headers
- Static and media file serving
- Proxy settings for Gunicorn
- WebSocket support (for future use)
- Logging configuration

**Customization**:
```nginx
# Update domain name
server_name yourdomain.com www.yourdomain.com;

# Update SSL certificate paths
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
```

### handygh.service

Systemd service file for process management:
- Automatic restart on failure
- Proper dependency ordering
- Environment variable loading
- Graceful shutdown
- Logging integration

**Customization**:
```ini
# Update paths if different
WorkingDirectory=/opt/handygh/backend
EnvironmentFile=/opt/handygh/.env
ExecStart=/opt/handygh/venv/bin/gunicorn ...
```

## Scripts

### collect_static.sh

Automates static file collection:
- Activates virtual environment
- Creates necessary directories
- Runs collectstatic command
- Sets proper permissions

**Usage**:
```bash
cd /opt/handygh/backend/deployment
chmod +x collect_static.sh
./collect_static.sh
```

## Deployment Checklist

Use this checklist for each deployment:

### Pre-Deployment

- [ ] Review changes in git log
- [ ] Test changes in staging environment
- [ ] Backup database
- [ ] Backup media files
- [ ] Review environment variables
- [ ] Check for new dependencies
- [ ] Review migration files

### Deployment

- [ ] Pull latest code
- [ ] Activate virtual environment
- [ ] Install/update dependencies
- [ ] Run database migrations
- [ ] Collect static files
- [ ] Restart application service
- [ ] Restart nginx (if config changed)

### Post-Deployment

- [ ] Verify application is running
- [ ] Test critical API endpoints
- [ ] Check application logs
- [ ] Check nginx logs
- [ ] Monitor error rates
- [ ] Verify static files loading
- [ ] Test user flows

### Rollback (if needed)

- [ ] Stop application
- [ ] Restore database backup
- [ ] Checkout previous git commit
- [ ] Reinstall dependencies
- [ ] Collect static files
- [ ] Start application
- [ ] Verify rollback successful

## Monitoring

### Health Checks

```bash
# Application health
curl https://yourdomain.com/api/v1/health/

# Service status
sudo systemctl status handygh
sudo systemctl status nginx
sudo systemctl status postgresql
sudo systemctl status redis-server
```

### Logs

```bash
# Application logs
sudo journalctl -u handygh -f

# Nginx access logs
sudo tail -f /var/log/nginx/handygh_access.log

# Nginx error logs
sudo tail -f /var/log/nginx/handygh_error.log

# Application file logs
tail -f /opt/handygh/backend/logs/handygh.log
```

### Metrics

Monitor these key metrics:
- Response times (p50, p95, p99)
- Error rates (4xx, 5xx)
- Request throughput
- Database query times
- Memory usage
- CPU usage
- Disk usage

## Backup and Recovery

### Automated Backups

Set up automated backups (see DEPLOYMENT_GUIDE.md):
- Daily database backups
- Daily media file backups
- 30-day retention
- Off-site backup storage

### Manual Backup

```bash
# Database
sudo -u postgres pg_dump handygh_db > backup_$(date +%Y%m%d).sql

# Media files
tar -czf media_backup_$(date +%Y%m%d).tar.gz /opt/handygh/backend/media/
```

### Recovery

```bash
# Restore database
sudo -u postgres psql handygh_db < backup_YYYYMMDD.sql

# Restore media files
tar -xzf media_backup_YYYYMMDD.tar.gz -C /
```

## Security

### Security Checklist

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Firewall configured (only 22, 80, 443 open)
- [ ] Strong passwords for database and Redis
- [ ] SECRET_KEY is strong and unique
- [ ] DEBUG=False in production
- [ ] ALLOWED_HOSTS properly configured
- [ ] CORS_ALLOWED_ORIGINS restricted
- [ ] Admin URL changed from default
- [ ] File upload limits configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Regular security updates applied

### Security Updates

```bash
# Update system packages
sudo apt update
sudo apt upgrade -y

# Update Python packages
cd /opt/handygh/backend
source venv/bin/activate
pip list --outdated
pip install --upgrade package-name

# Restart application
sudo systemctl restart handygh
```

## Support

### Getting Help

1. Check documentation in this directory
2. Review application logs
3. Search GitHub issues
4. Contact development team

### Reporting Issues

When reporting issues, include:
- Error messages from logs
- Steps to reproduce
- Environment details (OS, Python version, etc.)
- Recent changes or deployments

## Version History

- **v1.0.0** (2025-01-15) - Initial deployment resources

## Contributing

When updating deployment resources:
1. Test changes in staging environment
2. Update relevant documentation
3. Update version history
4. Create pull request with detailed description

---

**Last Updated**: 2025-01-15
**Version**: 1.0.0
