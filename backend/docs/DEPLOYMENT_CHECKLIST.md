# HandyGH Deployment Checklist

Use this checklist to ensure all deployment steps are completed correctly.

## Pre-Deployment Preparation

### Code Review
- [ ] All tests passing locally
- [ ] Code reviewed and approved
- [ ] No debug code or print statements
- [ ] All TODO comments addressed or documented
- [ ] Version number updated (if applicable)

### Documentation
- [ ] API documentation updated
- [ ] README updated with new features
- [ ] CHANGELOG updated
- [ ] Migration notes documented (if applicable)

### Testing
- [ ] Unit tests passing (≥70% coverage)
- [ ] Integration tests passing
- [ ] API tests passing
- [ ] Manual testing completed
- [ ] Load testing performed (if major changes)

### Database
- [ ] Migration files reviewed
- [ ] Migrations tested in staging
- [ ] Backward compatibility verified
- [ ] Data migration scripts tested (if applicable)
- [ ] Database backup plan confirmed

### Dependencies
- [ ] requirements.txt updated
- [ ] New dependencies reviewed for security
- [ ] Dependency conflicts resolved
- [ ] License compatibility checked

## Server Preparation

### Infrastructure
- [ ] Server provisioned and accessible
- [ ] Domain name configured
- [ ] DNS records updated
- [ ] SSL certificate obtained
- [ ] Firewall rules configured

### Software Installation
- [ ] Python 3.11+ installed
- [ ] PostgreSQL 14+ installed and configured
- [ ] Redis 7+ installed and configured
- [ ] Nginx installed and configured
- [ ] Git installed
- [ ] System packages updated

### User and Permissions
- [ ] Application user created (`handygh`)
- [ ] Directory structure created (`/opt/handygh`)
- [ ] Proper ownership set
- [ ] Proper permissions set (600 for .env, 755 for directories)

## Configuration

### Environment Variables
- [ ] `.env` file created from `.env.example`
- [ ] `SECRET_KEY` generated and set (strong, unique)
- [ ] `DEBUG` set to `False`
- [ ] `ALLOWED_HOSTS` configured with domain names
- [ ] `DATABASE_URL` configured with PostgreSQL credentials
- [ ] `REDIS_URL` configured
- [ ] Email settings configured (SMTP)
- [ ] SMS provider configured
- [ ] `CORS_ALLOWED_ORIGINS` configured
- [ ] `CSRF_TRUSTED_ORIGINS` configured
- [ ] `ADMIN_URL` changed from default
- [ ] `SENTRY_DSN` configured (optional)
- [ ] All required variables validated

### Database Setup
- [ ] PostgreSQL database created
- [ ] Database user created with strong password
- [ ] Database privileges granted
- [ ] Database connection tested
- [ ] Redis password set
- [ ] Redis connection tested

### Application Setup
- [ ] Repository cloned to `/opt/handygh`
- [ ] Virtual environment created
- [ ] Dependencies installed from `requirements/production.txt`
- [ ] Static files collected
- [ ] Media directories created
- [ ] Log directories created
- [ ] Migrations run successfully
- [ ] Superuser created

## Service Configuration

### Gunicorn
- [ ] `gunicorn_config.py` reviewed and customized
- [ ] Worker count appropriate for server
- [ ] Timeouts configured appropriately
- [ ] Logging paths configured
- [ ] Test run successful

### Systemd Service
- [ ] `handygh.service` copied to `/etc/systemd/system/`
- [ ] Service file paths verified
- [ ] Environment file path verified
- [ ] Service enabled (`systemctl enable handygh`)
- [ ] Service started (`systemctl start handygh`)
- [ ] Service status verified (`systemctl status handygh`)
- [ ] Service logs checked (`journalctl -u handygh`)

### Nginx
- [ ] `nginx.conf` copied to `/etc/nginx/sites-available/`
- [ ] Domain names updated in config
- [ ] SSL certificate paths updated
- [ ] Symbolic link created in `sites-enabled`
- [ ] Default site removed (if applicable)
- [ ] Configuration tested (`nginx -t`)
- [ ] Nginx restarted
- [ ] Nginx status verified

### SSL/TLS
- [ ] Let's Encrypt certbot installed
- [ ] SSL certificate obtained
- [ ] Certificate paths in nginx config
- [ ] HTTPS redirect working
- [ ] SSL test passed (ssllabs.com)
- [ ] Auto-renewal tested (`certbot renew --dry-run`)

## Security

### Application Security
- [ ] `DEBUG=False` in production
- [ ] Strong `SECRET_KEY` set
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] CSRF protection enabled
- [ ] XSS protection enabled
- [ ] Clickjacking protection enabled
- [ ] HSTS enabled
- [ ] Rate limiting configured
- [ ] File upload limits set

### Server Security
- [ ] Firewall enabled (UFW)
- [ ] Only necessary ports open (22, 80, 443)
- [ ] SSH key-based authentication
- [ ] Root login disabled
- [ ] Strong passwords for all services
- [ ] Fail2ban installed (optional)
- [ ] Automatic security updates enabled

### Database Security
- [ ] PostgreSQL listening on localhost only
- [ ] Strong database password
- [ ] Database user has minimal privileges
- [ ] pg_hba.conf properly configured
- [ ] Redis password set
- [ ] Redis listening on localhost only

## Monitoring and Logging

### Logging
- [ ] Application logs configured
- [ ] Nginx access logs configured
- [ ] Nginx error logs configured
- [ ] Log rotation configured
- [ ] Log permissions set correctly
- [ ] Logs accessible and readable

### Monitoring
- [ ] Sentry configured (optional)
- [ ] Health check endpoint working
- [ ] Uptime monitoring configured (optional)
- [ ] Performance monitoring configured (optional)
- [ ] Alert notifications configured

### Backups
- [ ] Database backup script created
- [ ] Media files backup script created
- [ ] Backup cron jobs configured
- [ ] Backup retention policy set
- [ ] Backup restoration tested
- [ ] Off-site backup configured (optional)

## Testing

### Smoke Tests
- [ ] Application responds to requests
- [ ] Health check endpoint returns 200
- [ ] API documentation accessible (`/api/docs/`)
- [ ] Admin panel accessible (custom URL)
- [ ] Static files loading correctly
- [ ] Media file uploads working

### Functional Tests
- [ ] User registration working (OTP)
- [ ] User login working (JWT)
- [ ] Provider search working
- [ ] Booking creation working
- [ ] Payment flow working (test mode)
- [ ] Review submission working
- [ ] Messaging working
- [ ] Admin operations working

### Performance Tests
- [ ] Response times acceptable (< 300ms)
- [ ] No memory leaks observed
- [ ] CPU usage normal
- [ ] Database queries optimized
- [ ] Load test passed (if applicable)

### Security Tests
- [ ] HTTPS working correctly
- [ ] Security headers present
- [ ] CORS working correctly
- [ ] Rate limiting working
- [ ] Authentication required for protected endpoints
- [ ] Authorization working correctly

## Post-Deployment

### Verification
- [ ] All services running
- [ ] No errors in logs
- [ ] All endpoints responding
- [ ] SSL certificate valid
- [ ] DNS propagated
- [ ] Email sending working
- [ ] SMS sending working (if configured)

### Documentation
- [ ] Deployment documented
- [ ] Credentials stored securely
- [ ] Runbook updated
- [ ] Team notified
- [ ] Deployment notes recorded

### Monitoring
- [ ] Monitor logs for errors (first 24 hours)
- [ ] Monitor performance metrics
- [ ] Monitor error rates
- [ ] Monitor user feedback
- [ ] Set up alerts for critical issues

## Rollback Plan

### Preparation
- [ ] Previous version tagged in git
- [ ] Database backup created before deployment
- [ ] Media files backup created
- [ ] Rollback procedure documented
- [ ] Rollback tested in staging

### If Rollback Needed
- [ ] Stop application service
- [ ] Restore database from backup
- [ ] Checkout previous git commit
- [ ] Reinstall dependencies (if needed)
- [ ] Collect static files
- [ ] Start application service
- [ ] Verify rollback successful
- [ ] Document rollback reason

## Maintenance

### Regular Tasks
- [ ] Daily: Check logs for errors
- [ ] Daily: Monitor disk space
- [ ] Daily: Verify backups completed
- [ ] Weekly: Review error rates
- [ ] Weekly: Check database performance
- [ ] Weekly: Review security logs
- [ ] Monthly: Update system packages
- [ ] Monthly: Review and optimize queries
- [ ] Monthly: Test backup restoration
- [ ] Monthly: Review SSL certificate expiration

### Updates
- [ ] Security updates applied promptly
- [ ] Dependency updates reviewed
- [ ] Django updates planned
- [ ] Database updates planned

## Sign-Off

### Deployment Team
- [ ] Developer: _________________ Date: _______
- [ ] DevOps: _________________ Date: _______
- [ ] QA: _________________ Date: _______
- [ ] Product Owner: _________________ Date: _______

### Notes
```
Deployment Date: _________________
Version: _________________
Deployed By: _________________
Issues Encountered: _________________
Resolution: _________________
```

---

**Version**: 1.0.0
**Last Updated**: 2025-01-15
