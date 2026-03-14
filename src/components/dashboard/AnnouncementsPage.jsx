import React from "react";
import { useLocation } from "react-router-dom";
import StudentAnnouncements from "./StudentAnnouncements";

const AnnouncementsPage = () => {
  const location = useLocation();
  const focusAnnouncementId = location.state?.focusAnnouncementId || null;

  return (
    <div className="educo-content">
      <div className="cardx span-2">
        <div className="cardx-header">
          <div>
            <div className="cardx-title">Announcements</div>
            <div className="cardx-description muted">All published announcements from admin</div>
          </div>
        </div>
        <div className="cardx-body">
          <StudentAnnouncements limit={0} focusAnnouncementId={focusAnnouncementId} />
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsPage;
