import { useState, useEffect } from 'react';

interface SavedSpot {
  id: string | number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  rating: number;
  imageUrl?: string;
  category: string;
  savedAt: string;
  huntedOffline?: boolean;
}

interface OfflineAction {
  id: string;
  type: 'spot_hunt' | 'post_create' | 'friend_request' | 'squad_join';
  data: any;
  timestamp: string;
  synced: boolean;
}

export function useOfflineStorage() {
  const [savedSpots, setSavedSpots] = useState<SavedSpot[]>([]);
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Load saved data from localStorage on mount
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const spots = localStorage.getItem('savedSpots');
        if (spots) {
          setSavedSpots(JSON.parse(spots));
        }

        const actions = localStorage.getItem('pendingActions');
        if (actions) {
          setPendingActions(JSON.parse(actions));
        }
      } catch (error) {
        console.error('Error loading offline data:', error);
      }
    };

    loadSavedData();

    // Listen for online/offline events
    const handleOnline = () => {
      console.log('App came online, syncing pending actions...');
      setIsOnline(true);
      syncPendingActions();
    };

    const handleOffline = () => {
      console.log('App went offline, enabling offline mode...');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save spots to localStorage whenever savedSpots changes
  useEffect(() => {
    try {
      localStorage.setItem('savedSpots', JSON.stringify(savedSpots));
    } catch (error) {
      console.error('Error saving spots to localStorage:', error);
    }
  }, [savedSpots]);

  // Save actions to localStorage whenever pendingActions changes
  useEffect(() => {
    try {
      localStorage.setItem('pendingActions', JSON.stringify(pendingActions));
    } catch (error) {
      console.error('Error saving actions to localStorage:', error);
    }
  }, [pendingActions]);

  const saveSpot = (spot: Omit<SavedSpot, 'savedAt'>) => {
    const savedSpot: SavedSpot = {
      ...spot,
      savedAt: new Date().toISOString()
    };

    setSavedSpots(prev => {
      const exists = prev.find(s => s.id === spot.id);
      if (exists) {
        return prev; // Already saved
      }
      return [...prev, savedSpot];
    });

    return true;
  };

  const removeSavedSpot = (spotId: string | number) => {
    setSavedSpots(prev => prev.filter(spot => spot.id !== spotId));
  };

  const isSaved = (spotId: string | number) => {
    return savedSpots.some(spot => spot.id === spotId);
  };

  const addPendingAction = (action: Omit<OfflineAction, 'id' | 'timestamp' | 'synced'>) => {
    const pendingAction: OfflineAction = {
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      synced: false
    };

    setPendingActions(prev => [...prev, pendingAction]);
    return pendingAction.id;
  };

  const markActionSynced = (actionId: string) => {
    setPendingActions(prev =>
      prev.map(action =>
        action.id === actionId ? { ...action, synced: true } : action
      )
    );
  };

  const removeSyncedActions = () => {
    setPendingActions(prev => prev.filter(action => !action.synced));
  };

  const syncPendingActions = async () => {
    if (!isOnline || pendingActions.length === 0) {
      return;
    }

    console.log(`Syncing ${pendingActions.length} pending actions...`);

    for (const action of pendingActions.filter(a => !a.synced)) {
      try {
        let success = false;

        switch (action.type) {
          case 'spot_hunt':
            success = await syncSpotHunt(action);
            break;
          case 'post_create':
            success = await syncPostCreate(action);
            break;
          case 'friend_request':
            success = await syncFriendRequest(action);
            break;
          case 'squad_join':
            success = await syncSquadJoin(action);
            break;
        }

        if (success) {
          markActionSynced(action.id);
        }
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);
      }
    }

    // Clean up synced actions after a delay
    setTimeout(removeSyncedActions, 5000);
  };

  const syncSpotHunt = async (action: OfflineAction): Promise<boolean> => {
    try {
      const response = await fetch(`/api/spots/${action.data.spotId}/hunt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: action.data.userId,
          latitude: action.data.latitude,
          longitude: action.data.longitude
        })
      });
      return response.ok;
    } catch (error) {
      console.error('Error syncing spot hunt:', error);
      return false;
    }
  };

  const syncPostCreate = async (action: OfflineAction): Promise<boolean> => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.data)
      });
      return response.ok;
    } catch (error) {
      console.error('Error syncing post creation:', error);
      return false;
    }
  };

  const syncFriendRequest = async (action: OfflineAction): Promise<boolean> => {
    try {
      const response = await fetch('/api/friend-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.data)
      });
      return response.ok;
    } catch (error) {
      console.error('Error syncing friend request:', error);
      return false;
    }
  };

  const syncSquadJoin = async (action: OfflineAction): Promise<boolean> => {
    try {
      const response = await fetch(`/api/squads/${action.data.squadId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.data)
      });
      return response.ok;
    } catch (error) {
      console.error('Error syncing squad join:', error);
      return false;
    }
  };

  // Offline spot hunting
  const huntSpotOffline = (spot: SavedSpot, userId: string, latitude: number, longitude: number) => {
    // Mark spot as hunted offline
    setSavedSpots(prev =>
      prev.map(s =>
        s.id === spot.id ? { ...s, huntedOffline: true } : s
      )
    );

    // Add to pending actions for sync when online
    addPendingAction({
      type: 'spot_hunt',
      data: {
        spotId: spot.id,
        userId,
        latitude,
        longitude
      }
    });

    return {
      success: true,
      points: 50, // Default offline points
      message: 'Spot hunted offline! Will sync when you\'re back online.'
    };
  };

  const getOfflineCapabilities = () => {
    return {
      canHuntSpots: savedSpots.length > 0,
      canViewSavedSpots: true,
      canCreatePosts: true, // Can create offline, sync later
      savedSpotsCount: savedSpots.length,
      pendingActionsCount: pendingActions.filter(a => !a.synced).length
    };
  };

  return {
    savedSpots,
    pendingActions: pendingActions.filter(a => !a.synced),
    isOnline,
    saveSpot,
    removeSavedSpot,
    isSaved,
    huntSpotOffline,
    addPendingAction,
    syncPendingActions,
    getOfflineCapabilities
  };
}