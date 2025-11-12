"""Create placeholder files for all apps."""
import os

apps = ['payments', 'reviews', 'messaging', 'disputes', 'admin_dashboard']

for app in apps:
    app_dir = f'apps/{app}'
    
    # __init__.py
    with open(f'{app_dir}/__init__.py', 'w') as f:
        f.write(f'"""{app.replace("_", " ").title()} app"""\n')
        f.write(f"default_app_config = 'apps.{app}.apps.{app.replace('_', '').title()}Config'\n")
    
    # apps.py
    config_name = app.replace('_', '').title() + 'Config'
    with open(f'{app_dir}/apps.py', 'w') as f:
        f.write('from django.apps import AppConfig\n\n')
        f.write(f'class {config_name}(AppConfig):\n')
        f.write("    default_auto_field = 'django.db.models.BigAutoField'\n")
        f.write(f"    name = 'apps.{app}'\n")
    
    # models.py
    with open(f'{app_dir}/models.py', 'w') as f:
        f.write('from django.db import models\n')
    
    # urls.py
    with open(f'{app_dir}/urls.py', 'w') as f:
        f.write('from django.urls import path\n')
        f.write(f"app_name = '{app}'\n")
        f.write('urlpatterns = []\n')
    
    print(f'✓ Created placeholder files for {app}')

print('\n✓ All placeholder apps created!')
