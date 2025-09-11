import { supabase } from '../lib/supabase';

export const authService = {
  // Sign up a new user
  async signUp(userData) {
    try {
      const { email, password, firstName, lastName, userType, phone, businessName, serviceCategory, experience, description } = userData;

      // Create user in Supabase Auth
      const { data, error } = await supabase?.auth?.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            user_type: userType,
            phone: phone
          }
        }
      });

      if (error) throw error;

      // If it's a provider, create provider profile after user is created
      if (userType === 'provider' && data?.user) {
        // Wait for user profile to be created by trigger, then add provider profile
        setTimeout(async () => {
          try {
            await supabase?.from('provider_profiles')?.insert({
                user_id: data?.user?.id,
                business_name: businessName || `${firstName} ${lastName} Services`,
                business_description: description || '',
                experience_years: experience || 0,
                verification_status: 'pending'
              });
          } catch (providerError) {
            console.error('Provider profile creation error:', providerError);
          }
        }, 1000);
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign in user
  async signIn(email, password) {
    try {
      const { data, error } = await supabase?.auth?.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign out user
  async signOut() {
    try {
      const { error } = await supabase?.auth?.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Get current user session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase?.auth?.getSession();
      if (error) throw error;
      return { session, error: null };
    } catch (error) {
      return { session: null, error };
    }
  },

  // Get user profile
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select('*')?.eq('id', userId)?.single();

      if (error) throw error;
      return { profile: data, error: null };
    } catch (error) {
      return { profile: null, error };
    }
  },

  // Get provider profile (if user is a provider)
  async getProviderProfile(userId) {
    try {
      const { data, error } = await supabase?.from('provider_profiles')?.select('*')?.eq('user_id', userId)?.single();

      if (error && error?.code !== 'PGRST116') throw error; // Not found is okay
      return { profile: data, error: error?.code === 'PGRST116' ? null : error };
    } catch (error) {
      return { profile: null, error };
    }
  },

  // Update user profile
  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.update({
          ...updates,
          updated_at: new Date()?.toISOString()
        })?.eq('id', userId)?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update provider profile
  async updateProviderProfile(userId, updates) {
    try {
      const { data, error } = await supabase?.from('provider_profiles')?.update({
          ...updates,
          updated_at: new Date()?.toISOString()
        })?.eq('user_id', userId)?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Social login
  async signInWithOAuth(provider) {
    try {
      const { data, error } = await supabase?.auth?.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location?.origin + '/auth/callback'
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      const { data, error } = await supabase?.auth?.resetPasswordForEmail(email, {
        redirectTo: window.location?.origin + '/reset-password'
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};