import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from '../../../store/store';  
import { fetchProfileStart, fetchProfileSuccess, fetchProfileFailure } from '../../../store/customerSlice';  
import * as customerRepo from '../../../infrastructure/repositories/customer/customerRepository';  

const CustomerDataLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const dispatch = useDispatch();
     
    const { accessToken, user: authUser } = useSelector((state: RootState) => state.auth);
    const { profile } = useSelector((state: RootState) => state.customer);

    useEffect(() => {
        const isCustomer = authUser?.role === 'customer';
 
        if (accessToken && !profile && isCustomer) {
            const loadProfile = async () => {
                try {
                    dispatch(fetchProfileStart());
                    const data = await customerRepo.getProfile();
                    dispatch(fetchProfileSuccess(data));
                } catch (error) {
                    console.error("Failed to load customer profile", error);
                    dispatch(fetchProfileFailure("Failed to load profile"));
                }
            };
            loadProfile();
        }
    }, [accessToken, profile, authUser, dispatch]);
 
    return <>{children}</>;
};

export default CustomerDataLoader;