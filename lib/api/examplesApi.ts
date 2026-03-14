// Ví dụ: Cách tạo API endpoints mới với RTK Query

import { baseApi } from './baseApi'

// Ví dụ cho Users API
export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /users
    getUsers: builder.query<any[], void>({
      query: () => ({
        url: '/users',
        method: 'GET',
      }),
    }),

    // GET /users/:id
    getUserById: builder.query<any, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'GET',
      }),
    }),

    // POST /users
    createUser: builder.mutation<any, any>({
      query: (data) => ({
        url: '/users',
        method: 'POST',
        body: data,
      }),
    }),

    // PUT /users/:id
    updateUser: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
    }),

    // DELETE /users/:id
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
})

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi
