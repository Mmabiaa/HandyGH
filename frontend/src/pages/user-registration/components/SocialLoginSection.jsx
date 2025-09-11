import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const SocialLoginSection = ({ onSocialLogin, isLoading }) => {
  const socialProviders = [
    {
      id: 'google',
      name: 'Google',
      icon: 'Chrome',
      color: 'text-red-500',
      bgColor: 'hover:bg-red-50'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: 'Facebook',
      color: 'text-blue-600',
      bgColor: 'hover:bg-blue-50'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-card text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {socialProviders?.map((provider) => (
          <Button
            key={provider?.id}
            variant="outline"
            onClick={() => onSocialLogin(provider?.id)}
            disabled={isLoading}
            className={`${provider?.bgColor} micro-animation`}
          >
            <Icon name={provider?.icon} size={18} className={`mr-2 ${provider?.color}`} />
            {provider?.name}
          </Button>
        ))}
      </div>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          By signing up, you agree to our{' '}
          <button className="text-primary hover:text-primary/80 font-medium micro-animation">
            Terms of Service
          </button>{' '}
          and{' '}
          <button className="text-primary hover:text-primary/80 font-medium micro-animation">
            Privacy Policy
          </button>
        </p>
      </div>
    </div>
  );
};

export default SocialLoginSection;