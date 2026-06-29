/**
 * components/bidding/BidSubmitForm.jsx — Bid Submission Form
 *
 * Props: jobId, onSuccess
 * Fields: price, message, eta
 * Submits via bid.service.js + emits bid:submit socket event
 */
import React, { useState } from 'react';
import * as bidService from '../../services/bids/bid.service.js';

export const BidSubmitForm = ({ jobId, onSuccess }) => {
  const [price, setPrice] = useState('');
  const [eta, setEta] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!price || !eta) {
      setError('Please provide both price and ETA.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await bidService.submitBid({
        jobId,
        price: Number(price),
        eta: Number(eta),
        message,
      });
      if (onSuccess) {
        onSuccess(response.data.data);
      }
      setPrice('');
      setEta('');
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit bid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-1">
          Your Bid Amount (₹)
        </label>
        <div className="relative rounded-lg shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">₹</span>
          </div>
          <input
            type="number"
            name="price"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="block w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm font-semibold text-gray-900"
            placeholder="500"
            min="1"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="eta" className="block text-sm font-semibold text-gray-700 mb-1">
          Estimated Arrival Time (minutes)
        </label>
        <input
          type="number"
          name="eta"
          id="eta"
          value={eta}
          onChange={(e) => setEta(e.target.value)}
          className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm font-semibold text-gray-900"
          placeholder="e.g. 20"
          min="1"
          required
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1">
          Message to Customer (Optional)
        </label>
        <textarea
          name="message"
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows="3"
          className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm text-gray-900"
          placeholder="Introduce yourself or mention any equipment details..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
      >
        {loading ? 'Submitting Bid...' : 'Submit Bid'}
      </button>
    </form>
  );
};

export default BidSubmitForm;

