import { supabase, hasValidCredentials } from "./supabase";

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  created_at: string;
  user?: {
    email: string;
    full_name?: string;
  };
}

export interface Invitation {
  id: string;
  project_id: string;
  inviter_id: string;
  email: string;
  role: 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  project?: {
    title: string;
  };
  inviter?: {
    email: string;
    full_name?: string;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'invitation' | 'access_request' | 'mention' | 'collaboration';
  content: any;
  read: boolean;
  created_at: string;
}

export interface Activity {
  id: string;
  project_id: string;
  user_id: string;
  action_type: string;
  details: any;
  created_at: string;
  user?: {
    email: string;
    full_name?: string;
  };
}

// ---------------- Members ----------------

export const getProjectMembers = async (projectId: string): Promise<ProjectMember[]> => {
  if (!hasValidCredentials()) return [];
  try {
    const { data, error } = await supabase
      .from('project_members')
      .select(`
        id, project_id, user_id, role, created_at
      `)
      .eq('project_id', projectId);
    
    if (error) throw error;
    return data as ProjectMember[];
  } catch (err: any) {
    console.error("getProjectMembers failed:", err);
    if (err.message && (err.message.includes("Failed to fetch") || err.message.includes("NetworkError"))) {
      localStorage.setItem('use_mock_db', 'true');
    }
    return [];
  }
};

export const updateMemberRole = async (memberId: string, role: 'owner' | 'editor' | 'viewer') => {
  if (!hasValidCredentials()) return;
  try {
    const { error } = await supabase
      .from('project_members')
      .update({ role })
      .eq('id', memberId);
    if (error) throw error;
  } catch (err: any) {
    console.error("updateMemberRole failed:", err);
    if (err.message && (err.message.includes("Failed to fetch") || err.message.includes("NetworkError"))) {
      localStorage.setItem('use_mock_db', 'true');
    }
  }
};

export const removeMember = async (memberId: string) => {
  if (!hasValidCredentials()) return;
  try {
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('id', memberId);
    if (error) throw error;
  } catch (err: any) {
    console.error("removeMember failed:", err);
    if (err.message && (err.message.includes("Failed to fetch") || err.message.includes("NetworkError"))) {
      localStorage.setItem('use_mock_db', 'true');
    }
  }
};

// ---------------- Invitations ----------------

export const inviteUser = async (projectId: string, inviterId: string, email: string, role: 'editor' | 'viewer') => {
  if (!hasValidCredentials()) return;
  
  try {
    // Create invitation
    const { error } = await supabase
      .from('invitations')
      .insert([{ project_id: projectId, inviter_id: inviterId, email, role }]);
      
    if (error) throw error;
  } catch (err: any) {
    console.error("inviteUser failed:", err);
    if (err.message && (err.message.includes("Failed to fetch") || err.message.includes("NetworkError"))) {
      localStorage.setItem('use_mock_db', 'true');
    }
  }
};

export const getPendingInvitations = async (email: string): Promise<Invitation[]> => {
  if (!hasValidCredentials()) return [];
  try {
    const { data, error } = await supabase
      .from('invitations')
      .select(`
        *,
        project:projects(title)
      `)
      .eq('email', email)
      .eq('status', 'pending');
      
    if (error) throw error;
    return data as any[];
  } catch (err: any) {
    console.error("getPendingInvitations failed:", err);
    if (err.message && (err.message.includes("Failed to fetch") || err.message.includes("NetworkError"))) {
      localStorage.setItem('use_mock_db', 'true');
    }
    return [];
  }
};

export const respondToInvitation = async (invitationId: string, accept: boolean, projectId: string, userId: string, role: string) => {
  if (!hasValidCredentials()) return;
  
  try {
    const status = accept ? 'accepted' : 'rejected';
    const { error } = await supabase
      .from('invitations')
      .update({ status })
      .eq('id', invitationId);
      
    if (error) throw error;
    
    if (accept) {
      const { error: insertError } = await supabase
        .from('project_members')
        .insert([{ project_id: projectId, user_id: userId, role }]);
      if (insertError) throw insertError;
    }
  } catch (err: any) {
    console.error("respondToInvitation failed:", err);
    if (err.message && (err.message.includes("Failed to fetch") || err.message.includes("NetworkError"))) {
      localStorage.setItem('use_mock_db', 'true');
    }
  }
};

// ---------------- Notifications ----------------

export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  if (!hasValidCredentials()) return [];
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Notification[];
  } catch (err: any) {
    console.error("getUserNotifications failed:", err);
    if (err.message && (err.message.includes("Failed to fetch") || err.message.includes("NetworkError"))) {
      localStorage.setItem('use_mock_db', 'true');
    }
    return [];
  }
};

export const markNotificationRead = async (notificationId: string) => {
  if (!hasValidCredentials()) return;
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    if (error) throw error;
  } catch (err: any) {
    console.error("markNotificationRead failed:", err);
    if (err.message && (err.message.includes("Failed to fetch") || err.message.includes("NetworkError"))) {
      localStorage.setItem('use_mock_db', 'true');
    }
  }
};

export const getSharedBoards = async (userId: string) => {
  if (!hasValidCredentials()) return [];
  try {
    const { data, error } = await supabase
      .from('project_members')
      .select(`
        role,
        project:projects(*)
      `)
      .eq('user_id', userId)
      .neq('role', 'owner');
      
    if (error) throw error;
    return data.map(d => ({ ...d.project, role: d.role }));
  } catch (err: any) {
    console.error("getSharedBoards failed:", err);
    if (err.message && (err.message.includes("Failed to fetch") || err.message.includes("NetworkError"))) {
      localStorage.setItem('use_mock_db', 'true');
    }
    return [];
  }
};

export const logActivity = async (projectId: string, userId: string, actionType: string, details: any) => {
  if (!hasValidCredentials()) return;
  try {
    const { error } = await supabase
      .from('activities')
      .insert([{ project_id: projectId, user_id: userId, action_type: actionType, details }]);
    if (error) throw error;
  } catch (err: any) {
    console.error("Failed to log activity", err);
    if (err.message && (err.message.includes("Failed to fetch") || err.message.includes("NetworkError"))) {
      localStorage.setItem('use_mock_db', 'true');
    }
  }
};

export const getBoardActivities = async (projectId: string): Promise<Activity[]> => {
  if (!hasValidCredentials()) return [];
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data as Activity[];
  } catch (err: any) {
    console.error("getBoardActivities failed:", err);
    if (err.message && (err.message.includes("Failed to fetch") || err.message.includes("NetworkError"))) {
      localStorage.setItem('use_mock_db', 'true');
    }
    return [];
  }
};
