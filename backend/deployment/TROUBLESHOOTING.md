# HandyGH Troubleshooting Guide

This guide provides solutions to common issues encountered during deployment and operation of the HandyGH backend.

## Table of Contents

1. [Application Issues](#application-issues)
2. [Database Issues](#database-issues)
3. [Authentication Issues](#authentication-issues)
4. [API Issues](#api-issues)
5. [Performance Issues](#performance-issues)
6. [Deployment Issues](#deployment-issues)
7. [Monitoring and Debugging](#monitoring-and-debugging)

## Application Issues

### Application Won't Start

**Symptoms**: Gunicorn service fails to start or crashes immediately

**Diagnosis**:
```bash
# Check service status
sudo systemctl status handygh

# View recent logs
sudo journalctl -u handygh -n 50

# Try starting manually
cd /opt/handygh/backend
source venv/bin/activate
gunicorn -c gunicorn_config.py handygh.wsgi:application
```

**Common Causes and Solutions**:

1. **Missing environment variables**
   ```bash
   # Check .env file exists and is readable
   ls -la /opt/handygh/.env
   cat /opt/handygh/.env
   
   # Ensure all required variables are set
   # See DEPLOYMENT_GUIDE.md for complete list
   ```

2. **Database connection failed**
   ```bash
   # Test database connection
   sudo -u postgres psql handygh_db -c "SELECT 1;"
   
   # Check DATABASE_URL in .env
   # Format: postgresql://user:password@host:port/database
   ```

3. **Port already in use**
   ```bash
   # Check what's using port 8000
   sudo netstat -tlnp | grep 8000
   
   # Kill process if needed
   sudo kill -9 <PID>
   ```

4. **Permission issues**
   ```bash
   # Fix ownership
   sudo chown -R handygh:handygh /opt/handygh
   
   # Fix permissions
   chmod +x /opt/handygh/backend/manage.py
   ```

### Application Crashes Randomly

**Symptoms**: Application runs but crashes periodically

**Diagnosis**:
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head -10

# Check disk space
df -h

# Check logs for errors
sudo journalctl -u handygh -f
tail -f /opt/handygh/backend/logs/handygh.log
```

**Solutions**:

1. **Out of memory**
   ```bash
   # Reduce Gunicorn workers
   nano /opt/handygh/backend/gunicorn_config.py
   # Set: workers = 2  # or lower
   
   sudo systemctl restart handygh
   ```

2. **Database connection pool exhausted**
   ```python
   # In settings/production.py
   DATABASES['default']['CONN_MAX_AGE'] = 60  # Reduce from 600
   ```

3. **Memory leak**
   ```bash
   # Enable worker recycling in gunicorn_config.py
   max_requests = 1000
   max_requests_jitter = 50
   ```

### Static Files Not Loading

**Symptoms**: CSS/JS files return 404 errors

**Diagnosis**:
```bash
# Check if static files exist
ls -la /opt/handygh/backend/staticfiles/

# Check nginx configuration
sudo nginx -t
cat /etc/nginx/sites-enabled/handygh | grep static

# Check nginx error logs
sudo tail -f /var/log/nginx/handygh_error.log
```

**Solutions**:

1. **Static files not collected**
   ```bash
   cd /opt/handygh/backend
   source venv/bin/activate
   python manage.py collectstatic --noinput --clear
   ```

2. **Wrong permissions**
   ```bash
   sudo chown -R handygh:handygh /opt/handygh/backend/staticfiles
   chmod -R 755 /opt/handygh/backend/staticfiles
   ```

3. **Nginx configuration issue**
   ```bash
   # Check nginx config
   sudo nano /etc/nginx/sites-enabled/handygh
   
   # Should have:
   location /static/ {
       alias /opt/handygh/backend/staticfiles/;
   }
   
   sudo systemctl restart nginx
   ```

## Database Issues

### Cannot Connect to Database

**Symptoms**: "could not connect to server" or "authentication failed"

**Diagnosis**:
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Try connecting manually
sudo -u postgres psql handygh_db

# Check connection from application user
psql -U handygh_user -d handygh_db -h localhost
```

**Solutions**:

1. **PostgreSQL not running**
   ```bash
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

2. **Wrong credentials**
   ```bash
   # Reset password
   sudo -u postgres psql
   ALTER USER handygh_user WITH PASSWORD 'new_password';
   \q
   
   # Update .env file
   nano /opt/handygh/.env
   # DATABASE_URL=postgresql://handygh_user:new_password@localhost:5432/handygh_db
   ```

3. **Authentication configuration**
   ```bash
   # Edit pg_hba.conf
   sudo nano /etc/postgresql/14/main/pg_hba.conf
   
   # Add or modify line:
   local   handygh_db      handygh_user                            md5
   
   sudo systemctl restart postgresql
   ```

### Migration Errors

**Symptoms**: "Migration failed" or "relation does not exist"

**Diagnosis**:
```bash
# Check migration status
cd /opt/handygh/backend
source venv/bin/activate
python manage.py showmigrations

# Check for unapplied migrations
python manage.py showmigrations | grep "\[ \]"
```

**Solutions**:

1. **Unapplied migrations**
   ```bash
   # Run migrations
   python manage.py migrate
   ```

2. **Conflicting migrations**
   ```bash
   # Check for conflicts
   python manage.py makemigrations --check
   
   # If conflicts exist, resolve manually or:
   python manage.py migrate --fake-initial
   ```

3. **Corrupted migration state**
   ```bash
   # Backup database first!
   sudo -u postgres pg_dump handygh_db > backup.sql
   
   # Fake migrations to current state
   python manage.py migrate --fake app_name migration_name
   ```

### Database Performance Issues

**Symptoms**: Slow queries, high CPU usage

**Diagnosis**:
```bash
# Connect to database
sudo -u postgres psql handygh_db

# Check slow queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND now() - pg_stat_activity.query_start > interval '5 seconds';

# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Check missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public' AND n_distinct > 100
ORDER BY abs(correlation) DESC;
```

**Solutions**:

1. **Add missing indexes**
   ```python
   # In models.py
   class Meta:
       indexes = [
           models.Index(fields=['field_name']),
       ]
   
   # Create and run migration
   python manage.py makemigrations
   python manage.py migrate
   ```

2. **Optimize queries**
   ```python
   # Use select_related for foreign keys
   bookings = Booking.objects.select_related('customer', 'provider').all()
   
   # Use prefetch_related for many-to-many
   providers = Provider.objects.prefetch_related('services').all()
   ```

3. **Vacuum database**
   ```bash
   sudo -u postgres psql handygh_db -c "VACUUM ANALYZE;"
   ```

## Authentication Issues

### OTP Not Received

**Symptoms**: Users don't receive OTP codes

**Diagnosis**:
```bash
# Check application logs
tail -f /opt/handygh/backend/logs/handygh.log | grep OTP

# Check SMS provider configuration
cat /opt/handygh/.env | grep SMS
```

**Solutions**:

1. **SMS provider not configured**
   ```bash
   # Check SMS_PROVIDER setting
   nano /opt/handygh/.env
   
   # Should be: SMS_PROVIDER=twilio (or your provider)
   # SMS_API_KEY=your-api-key
   ```

2. **Rate limiting**
   ```bash
   # Check if user is rate limited
   # In Django shell:
   python manage.py shell
   
   from apps.authentication.services import OTPService
   OTPService().check_rate_limit('+233XXXXXXXXX')
   ```

3. **Mock SMS in development**
   ```bash
   # If SMS_PROVIDER=mock, check logs for OTP
   tail -f /opt/handygh/backend/logs/handygh.log | grep "Mock SMS"
   ```

### JWT Token Invalid

**Symptoms**: "Token is invalid or expired" errors

**Diagnosis**:
```bash
# Check JWT settings
cat /opt/handygh/.env | grep JWT

# Check token in Django shell
python manage.py shell
from rest_framework_simplejwt.tokens import AccessToken
token = AccessToken('your-token-here')
print(token.payload)
```

**Solutions**:

1. **Token expired**
   ```bash
   # User needs to refresh token
   # POST /api/v1/auth/token/refresh/
   # Body: {"refresh": "refresh_token_here"}
   ```

2. **SECRET_KEY changed**
   ```bash
   # If SECRET_KEY changed, all tokens are invalid
   # Users need to re-authenticate
   # Ensure SECRET_KEY is consistent across deployments
   ```

3. **Clock skew**
   ```bash
   # Ensure server time is correct
   timedatectl
   
   # Sync time if needed
   sudo timedatectl set-ntp true
   ```

### Permission Denied Errors

**Symptoms**: "You do not have permission to perform this action"

**Diagnosis**:
```bash
# Check user role
python manage.py shell
from apps.users.models import User
user = User.objects.get(phone='+233XXXXXXXXX')
print(user.role)
```

**Solutions**:

1. **Wrong user role**
   ```python
   # Update user role in Django shell
   from apps.users.models import User
   user = User.objects.get(phone='+233XXXXXXXXX')
   user.role = 'PROVIDER'  # or 'CUSTOMER', 'ADMIN'
   user.save()
   ```

2. **Permission class issue**
   ```python
   # Check view permission_classes
   # In views.py, ensure correct permissions:
   permission_classes = [IsAuthenticated, IsProvider]
   ```

## API Issues

### 500 Internal Server Error

**Symptoms**: API returns 500 errors

**Diagnosis**:
```bash
# Check application logs
sudo journalctl -u handygh -n 100
tail -f /opt/handygh/backend/logs/handygh.log

# Check Sentry (if configured)
# Visit your Sentry dashboard
```

**Solutions**:

1. **Unhandled exception**
   ```bash
   # Check logs for stack trace
   # Fix the code issue
   # Deploy fix
   ```

2. **Database error**
   ```bash
   # Check database connection
   # Check for migration issues
   # See Database Issues section
   ```

### 502 Bad Gateway

**Symptoms**: Nginx returns 502 error

**Diagnosis**:
```bash
# Check if Gunicorn is running
sudo systemctl status handygh

# Check if Gunicorn is listening
sudo netstat -tlnp | grep 8000

# Check nginx error logs
sudo tail -f /var/log/nginx/handygh_error.log
```

**Solutions**:

1. **Gunicorn not running**
   ```bash
   sudo systemctl start handygh
   sudo systemctl status handygh
   ```

2. **Wrong port in nginx config**
   ```bash
   sudo nano /etc/nginx/sites-enabled/handygh
   
   # Check upstream configuration:
   upstream handygh_app {
       server 127.0.0.1:8000;  # Should match Gunicorn bind
   }
   
   sudo systemctl restart nginx
   ```

### CORS Errors

**Symptoms**: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Diagnosis**:
```bash
# Check CORS settings
cat /opt/handygh/.env | grep CORS

# Test with curl
curl -H "Origin: https://yourfrontend.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://yourdomain.com/api/v1/auth/otp/request/
```

**Solutions**:

1. **Frontend origin not allowed**
   ```bash
   # Add frontend origin to .env
   nano /opt/handygh/.env
   
   # Add:
   CORS_ALLOWED_ORIGINS=https://yourfrontend.com,https://www.yourfrontend.com
   
   sudo systemctl restart handygh
   ```

2. **CORS middleware not configured**
   ```python
   # Check settings/base.py
   MIDDLEWARE = [
       'corsheaders.middleware.CorsMiddleware',  # Should be early
       ...
   ]
   ```

## Performance Issues

### Slow API Response Times

**Symptoms**: API requests take > 1 second

**Diagnosis**:
```bash
# Check response times in nginx logs
sudo tail -f /var/log/nginx/handygh_access.log

# Use Django Debug Toolbar (development only)
# Or check Sentry performance monitoring

# Profile specific endpoint
python manage.py shell
from django.test import Client
import time
client = Client()
start = time.time()
response = client.get('/api/v1/providers/')
print(f"Time: {time.time() - start}s")
```

**Solutions**:

1. **N+1 query problem**
   ```python
   # Use select_related and prefetch_related
   # Bad:
   bookings = Booking.objects.all()
   for booking in bookings:
       print(booking.customer.name)  # N+1 queries
   
   # Good:
   bookings = Booking.objects.select_related('customer').all()
   for booking in bookings:
       print(booking.customer.name)  # 1 query
   ```

2. **Missing database indexes**
   ```python
   # Add indexes to frequently queried fields
   class Meta:
       indexes = [
           models.Index(fields=['status', 'created_at']),
       ]
   ```

3. **Enable caching**
   ```python
   # Cache expensive queries
   from django.core.cache import cache
   
   providers = cache.get('providers_list')
   if not providers:
       providers = Provider.objects.all()
       cache.set('providers_list', providers, 300)  # 5 minutes
   ```

### High Memory Usage

**Symptoms**: Server runs out of memory, OOM killer activates

**Diagnosis**:
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head -10

# Check Gunicorn workers
ps aux | grep gunicorn
```

**Solutions**:

1. **Too many Gunicorn workers**
   ```python
   # In gunicorn_config.py
   workers = 2  # Reduce from default
   ```

2. **Memory leak in code**
   ```python
   # Enable worker recycling
   max_requests = 500  # Restart worker after 500 requests
   max_requests_jitter = 50
   ```

3. **Large query results**
   ```python
   # Use pagination
   # Use iterator() for large querysets
   for obj in Model.objects.iterator(chunk_size=100):
       process(obj)
   ```

### High CPU Usage

**Symptoms**: CPU constantly at 100%

**Diagnosis**:
```bash
# Check CPU usage
top
htop

# Check slow queries
sudo -u postgres psql handygh_db
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

**Solutions**:

1. **Inefficient queries**
   ```bash
   # Enable query logging
   # In settings/production.py
   LOGGING['loggers']['django.db.backends'] = {
       'level': 'DEBUG',
       'handlers': ['console'],
   }
   ```

2. **Too many workers**
   ```python
   # Reduce workers in gunicorn_config.py
   workers = multiprocessing.cpu_count()  # Instead of * 2 + 1
   ```

## Deployment Issues

### Git Pull Fails

**Symptoms**: Cannot pull latest code

**Solutions**:
```bash
# Stash local changes
git stash

# Pull latest
git pull origin main

# Apply stash if needed
git stash pop

# Or reset to remote
git fetch origin
git reset --hard origin/main
```

### Pip Install Fails

**Symptoms**: Cannot install dependencies

**Solutions**:
```bash
# Update pip
pip install --upgrade pip

# Clear pip cache
pip cache purge

# Install with verbose output
pip install -r requirements/production.txt -v

# If specific package fails, install system dependencies
sudo apt install python3-dev libpq-dev
```

### Migration Conflicts

**Symptoms**: "Conflicting migrations detected"

**Solutions**:
```bash
# Backup database first!
sudo -u postgres pg_dump handygh_db > backup.sql

# Option 1: Merge migrations
python manage.py makemigrations --merge

# Option 2: Fake migrations
python manage.py migrate --fake app_name migration_name

# Option 3: Reset migrations (DANGEROUS - only in development)
# Delete migration files and database, start fresh
```

## Monitoring and Debugging

### Enable Debug Mode Temporarily

**WARNING**: Never enable DEBUG in production for extended periods

```bash
# Temporarily enable debug
nano /opt/handygh/.env
# Set: DEBUG=True

sudo systemctl restart handygh

# REMEMBER TO DISABLE AFTER DEBUGGING
# Set: DEBUG=False
sudo systemctl restart handygh
```

### Django Shell Debugging

```bash
cd /opt/handygh/backend
source venv/bin/activate
python manage.py shell

# Test specific functionality
from apps.authentication.services import OTPService
otp_service = OTPService()
otp = otp_service.generate_otp('+233XXXXXXXXX')
print(f"Generated OTP: {otp}")
```

### Check All Services

```bash
# Create health check script
nano /opt/handygh/scripts/health_check.sh
```

```bash
#!/bin/bash

echo "=== HandyGH Health Check ==="

# Check Gunicorn
if systemctl is-active --quiet handygh; then
    echo "✓ Gunicorn: Running"
else
    echo "✗ Gunicorn: Not running"
fi

# Check Nginx
if systemctl is-active --quiet nginx; then
    echo "✓ Nginx: Running"
else
    echo "✗ Nginx: Not running"
fi

# Check PostgreSQL
if systemctl is-active --quiet postgresql; then
    echo "✓ PostgreSQL: Running"
else
    echo "✗ PostgreSQL: Not running"
fi

# Check Redis
if systemctl is-active --quiet redis-server; then
    echo "✓ Redis: Running"
else
    echo "✗ Redis: Not running"
fi

# Check API
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/v1/health/ | grep -q "200"; then
    echo "✓ API: Responding"
else
    echo "✗ API: Not responding"
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -lt 80 ]; then
    echo "✓ Disk: ${DISK_USAGE}% used"
else
    echo "⚠ Disk: ${DISK_USAGE}% used (WARNING)"
fi

# Check memory
MEM_USAGE=$(free | awk 'NR==2 {printf "%.0f", $3/$2*100}')
if [ $MEM_USAGE -lt 80 ]; then
    echo "✓ Memory: ${MEM_USAGE}% used"
else
    echo "⚠ Memory: ${MEM_USAGE}% used (WARNING)"
fi
```

```bash
chmod +x /opt/handygh/scripts/health_check.sh
/opt/handygh/scripts/health_check.sh
```

### Log Analysis

```bash
# Find errors in logs
sudo journalctl -u handygh --since "1 hour ago" | grep -i error

# Count error types
sudo journalctl -u handygh --since "1 day ago" | grep -i error | sort | uniq -c | sort -rn

# Monitor logs in real-time
sudo journalctl -u handygh -f | grep -i "error\|warning"
```

## Getting Help

If you can't resolve an issue:

1. **Check logs**: Application, Nginx, PostgreSQL
2. **Search documentation**: Django, DRF, Gunicorn docs
3. **Check GitHub issues**: Search for similar problems
4. **Ask for help**: Provide logs, error messages, and steps to reproduce

## Emergency Procedures

### Complete System Restart

```bash
# Stop all services
sudo systemctl stop handygh
sudo systemctl stop nginx
sudo systemctl stop postgresql
sudo systemctl stop redis-server

# Start all services
sudo systemctl start postgresql
sudo systemctl start redis-server
sudo systemctl start handygh
sudo systemctl start nginx

# Check status
sudo systemctl status handygh
sudo systemctl status nginx
```

### Restore from Backup

```bash
# Stop application
sudo systemctl stop handygh

# Restore database
sudo -u postgres psql handygh_db < /opt/handygh/backups/db_backup_YYYYMMDD_HHMMSS.sql

# Restore media files
tar -xzf /opt/handygh/backups/media_YYYYMMDD_HHMMSS.tar.gz -C /

# Start application
sudo systemctl start handygh
```

---

**Last Updated**: 2025-01-15
**Version**: 1.0.0
