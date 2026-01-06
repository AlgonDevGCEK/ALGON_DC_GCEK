import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient"; 
import { Trophy, Medal, ArrowLeft, Search, Loader2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import "./insightx.css"; 

const Leaderboard = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase.rpc("get_leaderboard");
      if (error) throw error;
      setTeams(data);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter teams based on search
  const filteredTeams = teams.filter((t) =>
    t.team_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="insightx-landing" style={{ minHeight: "100vh", paddingBottom: "4rem" }}>
      <div className="container">
        
        {/* Navigation Header */}
        <div style={{ paddingTop: "2rem", marginBottom: "3rem" }}>
          <NavLink to="/insightx">
            <button className="lb-back-btn">
              <ArrowLeft size={20} /> Back to Event
            </button>
          </NavLink>
        </div>

        {/* Title Section */}
        <div className="text-center mb-10">
          <h1 className="main-title" style={{ fontSize: "4rem" }}>
            Leader<span className="title-accent">board</span>
          </h1>
          <p className="description" style={{ margin: "0 auto" }}>
            Live Standings. Scores updated by Admins.
          </p>
        </div>

        {/* Search Bar */}
        <div className="lb-search-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search for a team..."
            className="lb-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Leaderboard Table Card */}
        <div className="glass-card lb-table-container">
          {loading ? (
            <div className="loading-state">
               <Loader2 className="animate-spin text-theme-primary" size={32} />
               <p>Loading Scores...</p>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="empty-state">
               <Trophy size={48} className="text-gray-500 mb-2 opacity-50" />
               <p>No teams found on the leaderboard yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="lb-table">
                <thead>
                  <tr>
                    <th className="rank-col">Rank</th>
                    <th className="team-col">Team Name</th>
                    <th className="proj-col text-center">Submissions</th>
                    <th className="score-col text-right">Total Score</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeams.map((team, index) => (
                    <tr key={index} className={index < 3 ? `top-${index + 1}` : ""}>
                      {/* Rank Column with Icons */}
                      <td className="rank-cell">
                        {index === 0 && <Trophy size={24} className="text-yellow-400" />}
                        {index === 1 && <Medal size={24} className="text-gray-300" />}
                        {index === 2 && <Medal size={24} className="text-orange-400" />}
                        {index > 2 && <span className="rank-num">#{index + 1}</span>}
                      </td>
                      
                      {/* Team Name */}
                      <td className="team-name">{team.team_name}</td>
                      
                      {/* Submissions Count */}
                      <td className="text-center text-gray-400">
                        {team.domains_completed > 0 ? (
                           <span className="submission-badge">{team.domains_completed}</span>
                        ) : "-"}
                      </td>
                      
                      {/* Score */}
                      <td className="score-cell">{team.total_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;