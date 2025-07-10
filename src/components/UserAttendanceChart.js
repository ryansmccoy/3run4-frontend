import React from "react";

const PRIMARY_BLUE = "#143E8E";
const SUCCESS_GREEN = "#2aaf3b";
const LIGHT_GRAY = "#e0e6ed";

export default function UserAttendanceChart({ attendanceHistory = [], displayName = "Your" }) {
  // Show last 8 weeks of attendance
  const recentWeeks = attendanceHistory.slice(-8);
  
  // If no attendance history, don't show the chart
  if (recentWeeks.length === 0) {
    return null;
  }

  // Calculate attendance percentage
  const attendedWeeks = recentWeeks.filter(week => week === 1).length;
  const attendanceRate = Math.round((attendedWeeks / recentWeeks.length) * 100);

  return (
    <div style={{
      background: "linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)",
      borderRadius: 16,
      padding: "20px 24px",
      marginBottom: 24,
      border: `2px solid ${LIGHT_GRAY}`,
      textAlign: "center",
      boxShadow: "0 2px 8px rgba(20,62,142,0.08)"
    }}>
      <h3 style={{
        color: PRIMARY_BLUE,
        margin: "0 0 6px 0",
        fontSize: 18,
        fontWeight: "700"
      }}>
        📊 {displayName} Recent Runs
      </h3>
      
      <p style={{
        color: "#555",
        fontSize: 14,
        margin: "0 0 20px 0",
        fontWeight: "500"
      }}>
        {attendedWeeks} out of {recentWeeks.length} recent weeks • {attendanceRate}% attendance
      </p>

      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        gap: 10,
        height: 70,
        marginBottom: 16,
        padding: "0 10px"
      }}>
        {recentWeeks.map((attended, index) => {
          const weeksAgo = recentWeeks.length - index - 1;
          const height = attended ? 58 : 24;
          const backgroundColor = attended ? SUCCESS_GREEN : LIGHT_GRAY;
          
          return (
            <div
              key={index}
              style={{
                width: 28,
                height: height,
                backgroundColor: backgroundColor,
                borderRadius: 6,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                paddingBottom: 6,
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "default",
                position: "relative",
                boxShadow: attended ? "0 2px 6px rgba(42, 175, 59, 0.3)" : "0 1px 3px rgba(0,0,0,0.1)"
              }}
              title={`${weeksAgo === 0 ? "This week" : `${weeksAgo} week${weeksAgo > 1 ? "s" : ""} ago`}: ${attended ? "Attended ✅" : "Missed"}`}
            >
              {attended && (
                <span style={{
                  color: "white",
                  fontSize: 14,
                  fontWeight: "bold",
                  textShadow: "0 1px 2px rgba(0,0,0,0.3)"
                }}>
                  ✓
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 12,
        color: "#777",
        paddingTop: 8,
        fontWeight: "500"
      }}>
        <span>{recentWeeks.length - 1} weeks ago</span>
        <span>This week</span>
      </div>
      
      {attendanceRate >= 75 && (
        <div style={{
          marginTop: 16,
          padding: "10px 16px",
          background: "linear-gradient(135deg, #e8f5e8 0%, #d4f4d4 100%)",
          color: SUCCESS_GREEN,
          borderRadius: 10,
          fontSize: 14,
          fontWeight: "600",
          border: `1px solid ${SUCCESS_GREEN}20`
        }}>
          🎉 Awesome consistency! You're crushing it!
        </div>
      )}
      
      {attendanceRate >= 50 && attendanceRate < 75 && (
        <div style={{
          marginTop: 16,
          padding: "10px 16px",
          background: "linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)",
          color: "#e65100",
          borderRadius: 10,
          fontSize: 14,
          fontWeight: "600",
          border: "1px solid #e6510020"
        }}>
          👍 Good effort! Keep up the momentum!
        </div>
      )}
      
      {attendanceRate < 50 && recentWeeks.length >= 4 && (
        <div style={{
          marginTop: 16,
          padding: "10px 16px",
          background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
          color: "#e65100",
          borderRadius: 10,
          fontSize: 14,
          fontWeight: "600",
          border: "1px solid #e6510020"
        }}>
          💪 Ready for a comeback? Let's build that streak!
        </div>
      )}
    </div>
  );
}
