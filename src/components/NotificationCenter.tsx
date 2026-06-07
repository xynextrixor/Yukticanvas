import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Users } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getPendingInvitations, respondToInvitation, Invitation } from '../lib/collaboration';
import { useNavigate } from 'react-router-dom';

export default function NotificationCenter() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const nav = useNavigate();

  useEffect(() => {
    if (user && user.email) {
      loadInvitations();
      // In a real app we'd set up a realtime listener on the invitations table here
    }
  }, [user, isOpen]);

  const loadInvitations = async () => {
    try {
      if (!user || !user.email) return;
      const data = await getPendingInvitations(user.email);
      setInvitations(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRespond = async (inv: Invitation, accept: boolean) => {
    try {
      if (!user) return;
      await respondToInvitation(inv.id, accept, inv.project_id, user.id, inv.role);
      setInvitations(invitations.filter(i => i.id !== inv.id));
      if (accept) {
        nav(`/board/${inv.project_id}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to respond to invitation");
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell size={20} />
        {invitations.length > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 shadow-xl rounded-xl z-50 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{invitations.length} new</span>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {invitations.length === 0 ? (
                <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                  <Bell size={24} className="mb-2 text-gray-300" />
                  <p className="text-sm">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {invitations.map(inv => (
                    <div key={inv.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex gap-3">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                          <Users size={18} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">Someone</span> invited you to edit 
                            <span className="font-medium"> {inv.project?.title || 'a board'}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Role: {inv.role}</p>
                          <div className="flex gap-2 mt-3">
                            <button 
                              onClick={() => handleRespond(inv, true)}
                              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors flex-1"
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => handleRespond(inv, false)}
                              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors flex-1"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
               <button className="text-xs text-blue-600 font-medium hover:underline">Mark all as read</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
