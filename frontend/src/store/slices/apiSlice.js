import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  prepareHeaders: (headers, { getState }) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: '/api/v1/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/api/v1/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    getCurrentUser: builder.query({
      query: () => '/api/v1/auth/me',
    }),
    
    // Booking endpoints
    getBookings: builder.query({
      query: (role) => `/api/v1/bookings?role=${role}`,
      providesTags: ['Booking'],
    }),
    getBookingById: builder.query({
      query: (id) => `/api/v1/bookings/${id}`,
      providesTags: ['Booking'],
    }),
    createBooking: builder.mutation({
      query: (bookingData) => ({
        url: '/api/v1/bookings',
        method: 'POST',
        body: bookingData,
      }),
      invalidatesTags: ['Booking'],
    }),
    updateBookingStatus: builder.mutation({
      query: ({ id, status, providerNotes }) => ({
        url: `/api/v1/bookings/${id}/status`,
        method: 'PATCH',
        body: { status, providerNotes },
      }),
      invalidatesTags: ['Booking'],
    }),
    
    // Service endpoints
    getServices: builder.query({
      query: (filters) => ({
        url: '/api/v1/services',
        params: filters,
      }),
      providesTags: ['Service'],
    }),
    getCategories: builder.query({
      query: () => '/api/v1/categories',
      providesTags: ['Service'],
    }),
    
    // Provider endpoints
    getProviders: builder.query({
      query: (filters) => ({
        url: '/api/v1/providers',
        params: filters,
      }),
      providesTags: ['Provider'],
    }),
    getProviderById: builder.query({
      query: (id) => `/api/v1/providers/${id}`,
      providesTags: ['Provider'],
    }),
  }),
  tagTypes: ['User', 'Service', 'Booking', 'Review', 'Provider'],
});

// Export the generated hooks
export const {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useGetBookingsQuery,
  useGetBookingByIdQuery,
  useCreateBookingMutation,
  useUpdateBookingStatusMutation,
  useGetServicesQuery,
  useGetCategoriesQuery,
  useGetProvidersQuery,
  useGetProviderByIdQuery,
} = apiSlice;