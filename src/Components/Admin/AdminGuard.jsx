import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';

const ADMIN_IDS = [
  '952358bd-98ba-4a19-99b6-b237fb52cdff', 
  '928667a3-7f6f-4970-9685-f3d84bf4d8d7'
];

export default function AdminGuard({ children }) {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || !ADMIN_IDS.includes(user.id)) {
        // Not an admin? Send them away!
        navigate('/'); 
      } else {
        setAuthorized(true);
      }
      setLoading(false);
    }
    checkUser();
  }, [navigate]);

  if (loading) return <div>Loading Security...</div>;

  return authorized ? children : null;
}