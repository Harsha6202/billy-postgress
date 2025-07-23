import { prismaService } from '../services/prismaService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    // Check for stored user
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    
    // Initialize default users
    prismaService.initializeDefaultUsers().catch(console.error);
  }, []);

  const getCurrentUser = (): User | null => {
    try {
      const userData = localStorage.getItem('cyberguard_current_user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { user } = await apiService.login(email, password);

      setUser(user);
      localStorage.setItem('cyberguard_current_user', JSON.stringify(user));

      // Redirect to the previous page or home
      navigate('/');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);
      const { user } = await apiService.signup(username, email, password);
      
      setUser(user);
      localStorage.setItem('cyberguard_current_user', JSON.stringify(user));
      navigate('/');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    apiService.clearToken();
    localStorage.removeItem('cyberguard_current_user');
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};