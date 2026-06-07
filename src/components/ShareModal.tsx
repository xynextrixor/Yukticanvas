import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Users, Shield, UserX, Mail } from 'lucide-react';
import { ProjectMember, getProjectMembers, inviteUser, updateMemberRole, removeMember } from '../lib/collaboration';
import { useAuth } from '../lib/AuthContext';

export default function ShareModal({ boardId, boardTitle, onClose }: { boardId: string, boardTitle: string, onClose: () => void }) {
  const { user } = useAuth();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('editor');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadMembers();
  }, [boardId]);

  const loadMembers = async () => {
    try {
      const data = await getProjectMembers(boardId);
      // Need user emails which might not be fetched directly via public schema unless joined, 
      // but let's assume we show IDs or placeholder emails if we can't get them.
      setMembers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !user) return;
    setInviting(true);
    try {
      await inviteUser(boardId, user.id, email, role);
      setEmail('');
      alert(`Invitation sent to ${email}`);
    } catch (err) {
      console.error(err);
      alert("Failed to send invitation.");
    } finally {
      setInviting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/board/${boardId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Share "{boardTitle}"</h2>
            <p className="text-sm text-gray-500 mt-0.5">Invite others to collaborate</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-full shadow-sm"
          >
            <X size={16} />
          </button>
        </div>

        {/* Invite Form */}
        <div className="p-5 border-b border-gray-100">
          <form onSubmit={handleInvite} className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="w-full bg-white border border-gray-300 rounded-lg py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <select 
              value={role} 
              onChange={(e: any) => setRole(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-lg px-3 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 transition-colors"
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
            <button 
              type="submit" 
              disabled={inviting || !email}
              className="bg-blue-600 text-white px-5 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {inviting ? "Sending..." : "Invite"}
            </button>
          </form>
        </div>

        {/* Members List */}
        <div className="p-5 flex-1 overflow-y-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Collaborators</h3>
          {loading ? (
            <div className="text-center py-4 text-gray-500 text-sm">Loading members...</div>
          ) : (
            <div className="space-y-4">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
                      {member.user_id.substring(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {member.user_id === user?.id ? "You" : (member.user?.email || "Team Member")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {member.role === 'owner' ? 'Project Owner' : member.role === 'editor' ? 'Can edit' : 'Can view'}
                      </p>
                    </div>
                  </div>
                  {member.user_id !== user?.id && (
                    <div className="flex items-center gap-2">
                       <select 
                         value={member.role}
                         onChange={(e: any) => updateMemberRole(member.id, e.target.value)}
                         className="bg-transparent text-sm text-gray-600 font-medium py-1 px-2 rounded hover:bg-gray-100 cursor-pointer outline-none appearance-none"
                         style={{ textIndent: '1px', textOverflow: '' }}
                       >
                         <option value="editor">Editor</option>
                         <option value="viewer">Viewer</option>
                       </select>
                       <button 
                         onClick={() => {
                           if(confirm("Remove this user?")) removeMember(member.id);
                         }}
                         className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                       >
                         <UserX size={16} />
                       </button>
                    </div>
                  )}
                  {member.user_id === user?.id && (
                     <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">Owner</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div className="flex items-center text-xs text-gray-500 gap-1.5">
            <Shield size={14} className="text-gray-400" /> Only invited people can access
          </div>
          <button 
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            {copied ? 'Copied Link' : 'Copy Link'}
          </button>
        </div>

      </div>
    </div>
  );
}
