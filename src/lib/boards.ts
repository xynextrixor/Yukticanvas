import { supabase, hasValidCredentials } from "./supabase";

export interface Board {
  id: string;
  title: string;
  owner_id: string;
  content: any; // The canvas JSON state
  created_at: string;
}

const getMockBoards = (): Board[] => {
  const data = localStorage.getItem('mock_boards');
  return data ? JSON.parse(data) : [];
}

const saveMockBoards = (boards: Board[]) => {
  localStorage.setItem('mock_boards', JSON.stringify(boards));
}

export const createBoard = async (owner_id: string, title: string = 'Untitled', content: any = null): Promise<Board> => {
  const fallback = () => {
    localStorage.setItem('use_mock_db', 'true');
    const boards = getMockBoards();
    const newBoard: Board = {
      id: crypto.randomUUID(),
      title,
      owner_id,
      content: content || { shapes: [], viewport: { x: 0, y: 0, zoom: 1 } },
      created_at: new Date().toISOString()
    };
    boards.push(newBoard);
    saveMockBoards(boards);
    return newBoard;
  };

  if (!hasValidCredentials()) {
    return fallback();
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([
        { title, owner_id, content: content || { shapes: [], viewport: { x: 0, y: 0, zoom: 1 } } }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err: any) {
    console.error("Board creation failed:", err);
    console.warn("Falling back to mock database during createBoard.");
    return fallback();
  }
};

export const updateBoard = async (id: string, updates: Partial<Board>): Promise<Board> => {
  const fallback = () => {
    const boards = getMockBoards();
    const index = boards.findIndex(b => b.id === id);
    if (index === -1) throw new Error("Board not found");
    const updatedBoard = { ...boards[index], ...updates };
    boards[index] = updatedBoard;
    saveMockBoards(boards);
    return updatedBoard;
  };

  if (!hasValidCredentials()) {
    return fallback();
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err: any) {
    console.error("Board update failed:", err);
    console.warn("Falling back to mock database during updateBoard.");
    localStorage.setItem('use_mock_db', 'true');
    return fallback();
  }
};

export const getBoard = async (id: string): Promise<Board> => {
  const fallback = () => {
    const boards = getMockBoards();
    const board = boards.find(b => b.id === id);
    if (!board) throw new Error("Board not found");
    return board;
  };

  if (!hasValidCredentials()) {
    return fallback();
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (err: any) {
    console.error("Board fetch failed:", err);
    console.warn("Falling back to mock database during getBoard.");
    localStorage.setItem('use_mock_db', 'true');
    return fallback();
  }
};

export const deleteBoard = async (id: string): Promise<void> => {
  const fallback = () => {
    let boards = getMockBoards();
    boards = boards.filter(b => b.id !== id);
    saveMockBoards(boards);
  };

  if (!hasValidCredentials()) {
    return fallback();
  }

  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    // Also clean up local mock database to keep in sync
    fallback();
  } catch (err: any) {
    console.error("Board delete failed in Supabase:", err);
    const isNetworkError = err.message && (
      err.message.includes("Failed to fetch") || 
      err.message.includes("NetworkError") ||
      err.message.includes("network")
    );
    if (isNetworkError) {
      console.warn("Falling back to mock database during deleteBoard due to Network Error.");
      localStorage.setItem('use_mock_db', 'true');
      return fallback();
    }
    throw err;
  }
};

export const getUserBoards = async (user_id: string): Promise<Board[]> => {
  const fallback = () => {
    return getMockBoards().filter(b => b.owner_id === user_id);
  };

  if (!hasValidCredentials()) {
    return fallback();
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err: any) {
    console.error("Fetch user boards failed:", err);
    console.warn("Falling back to mock database during getUserBoards.");
    localStorage.setItem('use_mock_db', 'true');
    return fallback();
  }
};
