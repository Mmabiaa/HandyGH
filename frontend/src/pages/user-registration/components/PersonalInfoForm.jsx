import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const PersonalInfoForm = ({ userType, formData, onFormChange, errors }) => {
  // Handle regular input changes (for Input components)
  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    console.log('Input changed:', { name, value }); // Debug log
    onFormChange(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes (for Select components)
  const handleSelectChange = (name) => (value) => {
    console.log('Select changed:', { name, value }); // Debug log
    onFormChange(prev => ({ ...prev, [name]: value }));
  };

  const serviceCategories = [
    { value: 'plumbing', label: 'Plumbing & Water Systems' },
    { value: 'electrical', label: 'Electrical Services' },
    { value: 'cleaning', label: 'Cleaning Services' },
    { value: 'carpentry', label: 'Carpentry & Woodwork' },
    { value: 'painting', label: 'Painting & Decoration' },
    { value: 'appliance-repair', label: 'Appliance Repair' },
    { value: 'hvac', label: 'HVAC & Air Conditioning' },
    { value: 'gardening', label: 'Gardening & Landscaping' },
    { value: 'moving', label: 'Moving & Transportation' },
    { value: 'general-handyman', label: 'General Handyman Services' },
    { value: 'roofing', label: 'Roofing & Gutters' },
    { value: 'masonry', label: 'Masonry & Tiling' },
    { value: 'security', label: 'Security Systems' },
    { value: 'automotive', label: 'Automotive Services' },
    { value: 'technology', label: 'Technology & IT Support' }
  ];

  const experienceLevels = [
    { value: '0-1', label: 'Less than 1 year' },
    { value: '1-3', label: '1-3 years' },
    { value: '3-5', label: '3-5 years' },
    { value: '5-10', label: '5-10 years' },
    { value: '10+', label: '10+ years' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Personal Information
        </h3>
        <p className="text-muted-foreground">
          {userType === 'provider' 
            ? 'Tell us about yourself and your business' 
            : 'Complete your profile to get started'
          }
        </p>
      </div>

      <div className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              name="firstName"
              type="text"
              placeholder="First name"
              value={formData?.firstName || ''}
              onChange={handleInputChange}
              error={errors?.firstName}
              iconName="User"
              required
            />
          </div>
          <div>
            <Input
              name="lastName"
              type="text"
              placeholder="Last name"
              value={formData?.lastName || ''}
              onChange={handleInputChange}
              error={errors?.lastName}
              iconName="User"
              required
            />
          </div>
        </div>

        {/* Contact Information */}
        <Input
          name="email"
          type="email"
          placeholder="Email address"
          value={formData?.email || ''}
          onChange={handleInputChange}
          error={errors?.email}
          iconName="Mail"
          required
        />

        <Input
          name="phone"
          type="tel"
          placeholder="Phone number (+233 XX XXX XXXX)"
          value={formData?.phone || ''}
          onChange={handleInputChange}
          error={errors?.phone}
          iconName="Phone"
          required
        />

        {/* Password Fields */}
        <Input
          name="password"
          type="password"
          placeholder="Password"
          value={formData?.password || ''}
          onChange={handleInputChange}
          error={errors?.password}
          iconName="Lock"
          required
        />

        <Input
          name="confirmPassword"
          type="password"
          placeholder="Confirm password"
          value={formData?.confirmPassword || ''}
          onChange={handleInputChange}
          error={errors?.confirmPassword}
          iconName="Lock"
          required
        />

        {/* Provider-specific fields */}
        {userType === 'provider' && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center space-x-2 text-primary">
              <Icon name="Briefcase" size={20} />
              <h4 className="font-medium">Business Information</h4>
            </div>

            <Input
              name="businessName"
              type="text"
              placeholder="Business name"
              value={formData?.businessName || ''}
              onChange={handleInputChange}
              error={errors?.businessName}
              iconName="Building"
              required
            />

            {/* Service Category Select - FIXED */}
            <Select
              name="serviceCategory"
              label="Primary Service Category"
              placeholder="Select your primary service category"
              value={formData?.serviceCategory || ''}
              onChange={handleSelectChange('serviceCategory')}
              error={errors?.serviceCategory}
              options={serviceCategories}
              required
              searchable
            />

            {/* Experience Level Select */}
            <Select
              name="experience"
              label="Years of Experience"
              placeholder="Select your experience level"
              value={formData?.experience || ''}
              onChange={handleSelectChange('experience')}
              error={errors?.experience}
              options={experienceLevels}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Business Description (Optional)
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Describe your business and services..."
                value={formData?.description || ''}
                onChange={handleInputChange}
                className={`
                  w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  ${errors?.description ? 'border-destructive' : 'border-border'}
                `}
                maxLength={500}
              />
              <div className="flex justify-between items-center">
                {errors?.description && (
                  <p className="text-sm text-destructive">{errors?.description}</p>
                )}
                <p className="text-xs text-muted-foreground ml-auto">
                  {formData?.description?.length || 0}/500 characters
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Password Requirements */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
          <Icon name="Shield" size={16} className="mr-2" />
          Password Requirements
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className={`flex items-center space-x-1 ${
            formData?.password?.length >= 8 ? 'text-green-600' : ''
          }`}>
            <Icon name={formData?.password?.length >= 8 ? "Check" : "X"} size={12} />
            <span>At least 8 characters</span>
          </div>
          <div className={`flex items-center space-x-1 ${
            /[A-Z]/?.test(formData?.password) ? 'text-green-600' : ''
          }`}>
            <Icon name={/[A-Z]/?.test(formData?.password) ? "Check" : "X"} size={12} />
            <span>One uppercase letter</span>
          </div>
          <div className={`flex items-center space-x-1 ${
            /[a-z]/?.test(formData?.password) ? 'text-green-600' : ''
          }`}>
            <Icon name={/[a-z]/?.test(formData?.password) ? "Check" : "X"} size={12} />
            <span>One lowercase letter</span>
          </div>
          <div className={`flex items-center space-x-1 ${
            /\d/?.test(formData?.password) ? 'text-green-600' : ''
          }`}>
            <Icon name={/\d/?.test(formData?.password) ? "Check" : "X"} size={12} />
            <span>One number</span>
          </div>
          <div className={`flex items-center space-x-1 ${
            /[!@#$%^&*]/?.test(formData?.password) ? 'text-green-600' : ''
          }`}>
            <Icon name={/[!@#$%^&*]/?.test(formData?.password) ? "Check" : "X"} size={12} />
            <span>Special character</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;