import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const WherebyContext = createContext();

export const useWhereby = () => useContext(WherebyContext);

export const WherebyProvider = ({ children }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const createMeeting = useCallback(async (roomName, startDate, endDate) => {
        setLoading(true);
        try {
            const response = await fetch('https://api.whereby.dev/v1/meetings', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_WHEREBY_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    isLocked: true,
                    roomName: `/${roomName}-${Date.now()}`,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    fields: ["hostRoomUrl"],
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create Whereby meeting');
            }

            const meetingData = await response.json();

            const { error: dbError } = await supabase
                .from('video_rooms')
                .insert({
                    room_name: roomName,
                    meeting_id: meetingData.meetingId,
                    host_url: meetingData.hostRoomUrl,
                    room_url: meetingData.roomUrl,
                    created_by: user.id,
                    start_date: meetingData.startDate,
                    end_date: meetingData.endDate,
                    is_locked: true,
                });

            if (dbError) {
                throw dbError;
            }

            return meetingData;
        } catch (error) {
            console.error("Error creating Whereby meeting:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [user]);

    const value = {
        loading,
        createMeeting,
    };

    return (
        <WherebyContext.Provider value={value}>
            {children}
        </WherebyContext.Provider>
    );
};