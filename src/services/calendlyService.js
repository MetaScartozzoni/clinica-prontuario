const CALENDLY_API_BASE_URL = 'https://api.calendly.com';
// IMPORTANT: Replace with your actual Calendly Personal Access Token
const CALENDLY_TOKEN = import.meta.env.VITE_CALENDLY_TOKEN || 'YOUR_CALENDLY_TOKEN_HERE'; 

/**
 * Fetches the current authenticated user's information from Calendly.
 * This is primarily used to get the organization URI.
 */
export const fetchCurrentUser = async () => {
  if (CALENDLY_TOKEN === 'YOUR_CALENDLY_PERSONAL_ACCESS_TOKEN_HERE' || !CALENDLY_TOKEN) {
    console.error("Calendly API token is not set. Please replace 'YOUR_CALENDLY_PERSONAL_ACCESS_TOKEN_HERE' in calendlyService.js");
    throw new Error("Calendly API token not configured.");
  }

  const response = await fetch(`${CALENDLY_API_BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${CALENDLY_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    console.error('Error fetching current user from Calendly:', errorData);
    throw new Error(`Failed to fetch current user from Calendly: ${errorData.title || errorData.message || response.statusText}`);
  }
  return response.json();
};

/**
 * Fetches scheduled events from Calendly for the current user's organization.
 * @param {object} params - Optional parameters for the API call.
 * @param {string} params.min_start_time - ISO 8601 timestamp for the minimum start time.
 * @param {string} params.sort - Sort order, e.g., "start_time:asc".
 * @param {number} params.count - Number of events to fetch.
 */
export const fetchCalendlyScheduledEvents = async (params = {}) => {
  if (CALENDLY_TOKEN === 'YOUR_CALENDLY_PERSONAL_ACCESS_TOKEN_HERE' || !CALENDLY_TOKEN) {
    console.error("Calendly API token is not set. Please replace 'YOUR_CALENDLY_PERSONAL_ACCESS_TOKEN_HERE' in calendlyService.js");
    throw new Error("Calendly API token not configured.");
  }
  
  try {
    const currentUser = await fetchCurrentUser();
    const organizationUri = currentUser?.resource?.current_organization;

    if (!organizationUri) {
      console.error('Could not determine organization URI from Calendly user data.');
      throw new Error('Could not determine organization URI.');
    }

    const queryParams = new URLSearchParams({
      organization: organizationUri,
      ...params, // Spread other parameters like min_start_time, sort, count
    });

    const response = await fetch(`${CALENDLY_API_BASE_URL}/scheduled_events?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CALENDLY_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error('Error fetching scheduled events from Calendly:', errorData);
      throw new Error(`Failed to fetch scheduled events: ${errorData.title || errorData.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.collection; // The events are usually in a 'collection' array
  } catch (error) {
    console.error('Error in fetchCalendlyScheduledEvents:', error);
    throw error; // Re-throw the error to be caught by the calling component
  }
};

/**
 * Fetches details for a specific invitee of a scheduled event.
 * @param {string} eventUuid - The UUID of the event.
 * @param {string} inviteeUuid - The UUID of the invitee.
 */
export const fetchInviteeDetails = async (eventUuid, inviteeUuid) => {
  if (CALENDLY_TOKEN === 'YOUR_CALENDLY_PERSONAL_ACCESS_TOKEN_HERE' || !CALENDLY_TOKEN) {
    console.error("Calendly API token is not set. Please replace 'YOUR_CALENDLY_PERSONAL_ACCESS_TOKEN_HERE' in calendlyService.js");
    throw new Error("Calendly API token not configured.");
  }

  const response = await fetch(`${CALENDLY_API_BASE_URL}/scheduled_events/${eventUuid}/invitees/${inviteeUuid}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${CALENDLY_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    console.error('Error fetching invitee details from Calendly:', errorData);
    throw new Error(`Failed to fetch invitee details: ${errorData.title || errorData.message || response.statusText}`);
  }
  return response.json();
};