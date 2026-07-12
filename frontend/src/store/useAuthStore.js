// store/useAuthStore.jsx

import {create} from "zustand"

export const useAuthStore = create(()=>({
    authUser:null,
    isSigningUp:false,
    isLoggingIn:false,
    isUpdatingProfile:false,
    isCheckingAuth:true,

    checkAuth: async()=>{
        try{
            const res = await axiosInstance.get("/auth/check");
        }
        catch(error){

        }
    }

}));