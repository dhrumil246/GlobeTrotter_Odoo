'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, CardContent, CardHeader, LoadingState } from '@/app/components/ui';
import { useAuth } from '@/app/lib/context/AuthContext';
import { useForm } from '@/app/lib/hooks';

interface ProfileFormData extends Record<string, unknown> {
  name: string;
  email: string;
  language: string;
  currency: string;
  timezone: string;
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading, updateProfile, logout } = useAuth();
  const router = useRouter();
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldTouched,
    handleSubmit,
  } = useForm<ProfileFormData>(
    {
      name: user?.name || '',
      email: user?.email || '',
      language: user?.preferences.language || 'en',
      currency: user?.preferences.currency || 'USD',
      timezone: user?.preferences.timezone || 'UTC',
    },
    {
      name: { required: true, minLength: 2 },
      email: { required: true, email: true },
      language: { required: true },
      currency: { required: true },
      timezone: { required: true },
    }
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('email', user.email);
      setValue('language', user.preferences.language);
      setValue('currency', user.preferences.currency);
      setValue('timezone', user.preferences.timezone);
    }
  }, [user, setValue]);

  if (authLoading || !user) {
    return <LoadingState title="Loading profile..." />;
  }

  const onSubmit = async (formData: ProfileFormData) => {
    try {
      setSubmitError(null);
      setSubmitSuccess(false);

      await updateProfile({
        name: formData.name,
        email: formData.email,
        preferences: {
          language: formData.language,
          currency: formData.currency,
          timezone: formData.timezone,
        },
      });

      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Profile update failed';
      setSubmitError(message);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // In a real app, this would call an API to delete the account
      logout();
      router.push('/');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-lg text-gray-600 mt-2">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Picture */}
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Profile Picture</h2>
            </CardHeader>
            <CardContent className="text-center">
              <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-medium text-gray-700">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Change Photo
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                JPG, PNG up to 5MB
              </p>
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card className="mt-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Account Stats</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Member since</span>
                  <span className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Saved destinations</span>
                  <span className="font-medium">{user.savedDestinations.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last updated</span>
                  <span className="font-medium">
                    {new Date(user.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            </CardHeader>
            <CardContent>
              {submitSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Profile updated successfully!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        {submitError}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(onSubmit);
                }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full name"
                    type="text"
                    value={values.name}
                    onChange={(e) => setValue('name', e.target.value)}
                    onBlur={() => setFieldTouched('name')}
                    error={touched.name ? errors.name : undefined}
                    placeholder="Enter your full name"
                  />

                  <Input
                    label="Email address"
                    type="email"
                    value={values.email}
                    onChange={(e) => setValue('email', e.target.value)}
                    onBlur={() => setFieldTouched('email')}
                    error={touched.email ? errors.email : undefined}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      value={values.language}
                      onChange={(e) => setValue('language', e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="it">Italiano</option>
                      <option value="pt">Português</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={values.currency}
                      onChange={(e) => setValue('currency', e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="CAD">CAD (C$)</option>
                      <option value="AUD">AUD (A$)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={values.timezone}
                      onChange={(e) => setValue('timezone', e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                      <option value="Australia/Sydney">Sydney</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="mt-6 border-red-200">
            <CardHeader>
              <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-red-900">Sign out</h3>
                    <p className="text-sm text-red-700">Sign out of your account</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Sign Out
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-red-900">Delete account</h3>
                    <p className="text-sm text-red-700">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteAccount}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}