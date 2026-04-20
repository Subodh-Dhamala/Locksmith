const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type Role = "USER" | "ADMIN" | "MODERATOR";

export type User = {
  id:string,
  name:string,
  email:string,
  role: Role;
};

export type AuthResponse = {
  accessToken: string,
  user: User,
}

type ApiError = {
  message: string;
}

//core request wrapper

async function request <T>(url:string, options: RequestInit = {}): Promise <T> {

  const res = await fetch(`${BASE_URL}${url}`,{
    ...options,
    credentials: "include",
    headers:{
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(()=> null);

  if(!res.ok){
    throw new Error((data as ApiError)?.message || "Request failed");
  }

  return data;

}


//auth api
export const authApi = {

  login: (email:string,password:string)=>
    request<AuthResponse>("/auth/login",{
      method: "POST",
      body:JSON.stringify({email,password}),
    }),

    register: (name: string, email: string, password: string)=>
      request<AuthResponse>("/auth/register",{
        method:"POST",
        body: JSON.stringify({name,email,password}),
      }),

      refresh: ()=>
        request<AuthResponse>("/auth/refresh",{
          method:"POST",
        }),

      logout :()=>
        request<{message: string}>("/auth/logout",{
          method: "POST",
        }),

        getMe: ()=>
          request <User> ("/user/me",{
            method: "GET",
          }),
};

//admin api
export const adminAPI = {
  updateUserRole: (userId: string, role: Role) =>
    request<User>(`/admin/users/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    }),

  deleteUser: (userId: string) =>
    request<{ message: string }>(`/admin/users/${userId}`, {
      method: "DELETE",
    }),
};


//user api
export const userAPI = {
  getMe: () =>
    request<User>("/user/me", {
      method: "GET",
    }),
};


//moderator api
export const moderatorAPI = {
  getUsers: () =>
    request<User[]>("/moderator/users", {
      method: "GET",
    }),

};

//oauth

export const oauthAPI = {
  google: () => {
    window.location.href = `${BASE_URL}/auth/google`;
  },

  github: () => {
    window.location.href = `${BASE_URL}/auth/github`;
  },
};