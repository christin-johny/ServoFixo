import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from '../../../store/store'; // Adjust path
import { fetchProfileStart, fetchProfileSuccess, fetchProfileFailure } from '../../../store/customerSlice'; // Adjust path
import * as customerRepo from '../../../infrastructure/repositories/customer/customerRepository'; // Adjust path

const CustomerDataLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const dispatch = useDispatch();
    
    // Selectors
    const { accessToken, user: authUser } = useSelector((state: RootState) => state.auth);
    const { profile } = useSelector((state: RootState) => state.customer);

    useEffect(() => {
        const isCustomer = authUser?.role === 'customer';

        // Logic: If we have a token, we are a customer, but we don't have the profile in Redux yet...
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

    // Render the rest of the app
    return <>{children}</>;
};

export default CustomerDataLoader;