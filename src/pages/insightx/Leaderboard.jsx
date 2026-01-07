import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient"; 
import { Trophy, Medal, ArrowLeft, Search, Loader2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import "./Leaderboard.css"; 

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

  const filteredTeams = teams.filter((t) =>
    t.team_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // 👇 UNIQUE CLASS NAME HERE
    <div className="leaderboard-wrapper">
      <div className="lb-container">
        
        {/* Navigation Header */}
        <div style={{ paddingTop: "2rem", marginBottom: "3rem" }}>
          <NavLink to="/insightx">
            <button className="lb-back-btn">
              <ArrowLeft size={20} /> Back to Event
            </button>
          </NavLink>
        </div>

        {/* Title Section */}
        <div className="lb-text-center lb-mb-10">
          <h1 className="lb-main-title">
            <span className="lb-title-accent">Leaderboard</span>
          </h1>
          <p className="lb-description" style={{ margin: "0 auto" }}>
            Live Standings. Scores updated by Admins.
          </p>
        </div>

        {/* Search Bar */}
        <div className="lb-search-wrapper">
          <Search className="lb-search-icon" size={20} />
          <input
            type="text"
            placeholder="Search for a team..."
            className="lb-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Leaderboard Table Card */}
        <div className="lb-glass-card lb-table-container">
          {loading ? (
            <div className="lb-loading-state">
               <Loader2 className="lb-animate-spin" style={{color: '#8a2be2'}} size={32} />
               <p>Loading Scores...</p>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="lb-empty-state">
               <Trophy size={48} className="lb-text-gray-500 mb-2 opacity-50" />
               <p>No teams found.</p>
            </div>
          ) : (
            <div className="lb-table-responsive">
              <table className="lb-table">
                <thead>
                  <tr>
                    <th className="lb-rank-col">Rank</th>
                    <th className="lb-team-col">Team Name</th>
                    <th className="lb-proj-col lb-text-center">Submissions</th>
                    <th className="lb-score-col lb-text-right">Total Score</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeams.map((team, index) => (
                    <tr key={index} className={index < 3 ? `lb-top-${index + 1}` : ""}>
                      {/* Rank Column */}
                      <td className="lb-rank-cell">
                        {index === 0 && <Trophy size={24} className="lb-text-yellow-400" />}
                        {index === 1 && <Medal size={24} className="lb-text-gray-300" />}
                        {index === 2 && <Medal size={24} className="lb-text-orange-400" />}
                        {index > 2 && <span className="lb-rank-num">#{index + 1}</span>}
                      </td>
                      
                      {/* Team Name */}
                      <td className="lb-team-name">{team.team_name}</td>
                      
                      {/* Submissions Count */}
                      <td className="lb-text-center lb-text-gray-400">
                        {team.domains_completed > 0 ? (
                           <span className="lb-submission-badge">{team.domains_completed}</span>
                        ) : "-"}
                      </td>
                      
                      {/* Score */}
                      <td className="lb-score-cell">{team.total_score}</td>
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