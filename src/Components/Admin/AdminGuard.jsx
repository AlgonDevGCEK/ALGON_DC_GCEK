import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function AdminGuard({ children }) {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkRole() {
      // 1. Get the current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        navigate('/login');
        return;
      }

      // 2. Fetch their role from the 'members' table
      // We rely on the database being the "Source of Truth"
      const { data: memberData, error: dbError } = await supabase
        .from('members')
        .select('role')
        .eq('user_id', user.id)
        .single();

      // 3. Logic check: Are they an admin?
      if (!dbError && memberData?.role === 'admin') {
        setAuthorized(true);
      } else {
        // If not an admin, boot them to the home page
        navigate('/');
      }
      
      setLoading(false);
    }

    checkRole();
  }, [navigate]);

  if (loading) {
    return (
      <div className="admin-guard-overlay">
        <div className="admin-guard-spinner"></div>
        <p className="admin-guard-text">Verifying Admin Access...</p>
      </div>
    );
  }

  return authorized ? children : null;
}