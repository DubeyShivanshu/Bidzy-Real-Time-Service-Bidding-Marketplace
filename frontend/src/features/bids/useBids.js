/**
 * Responsibilities:
 *  - Fetch bids for a specific job
 *  - Handle customer accept/reject actions via bidService
 *  - Real-time bid:new socket event listener attachment
 */

import { useState, useEffect } from 'react';
import useBidStore from '@store/bids/bidStore.js';
import * as bidService from '@services/bids/bid.service.js';
import useSocket from '@hooks/useSocket.js';
import toast from 'react-hot-toast';

export const useBids = (jobId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { bids, setBids, addBid, clearBids } = useBidStore();
  const socket = useSocket();

  const fetchBids = async () => {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await bidService.getBidsForJob(jobId);
      setBids(response.data.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch bids.');
    } finally {
      setLoading(false);
    }
  };

  const acceptProviderBid = async (bidId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await bidService.acceptBid(bidId);
      return response.data.data;
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to accept bid.';
      toast.error(errMsg);
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectProviderBid = async (bidId) => {
    setLoading(true);
    setError(null);
    try {
      await bidService.rejectBid(bidId);
      setBids(bids.map((b) => (b._id === bidId ? { ...b, status: 'rejected' } : b)));
      toast.success('Bid rejected successfully.');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to reject bid.';
      toast.error(errMsg);
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Socket room subscription
  useEffect(() => {
    if (!socket || !jobId) return;

    // Clear stale bids immediately before joining new room
    clearBids();

    const joinRoom = () => socket.emit('room:join', { jobId });
    
    // Initial join
    joinRoom();
    
    // Re-join if connection drops and reconnects (e.g. mobile screen off)
    socket.on('connect', joinRoom);

    const handleNewBid = (newBid) => {
      if (newBid.jobId === jobId) {
        addBid(newBid);
      }
    };

    socket.on('bid:new', handleNewBid);

    return () => {
      socket.emit('room:leave', { jobId });
      socket.off('connect', joinRoom);
      socket.off('bid:new', handleNewBid);
      clearBids();
    };
  }, [socket, jobId, addBid, clearBids]);

  return { bids, fetchBids, acceptProviderBid, rejectProviderBid, loading, error };
};


export default useBids;
