import { Navbar } from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";

export function ProfilePage() {
  const { user } = useAuth();

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div>
      <Navbar />
      <main className="main-content">
        <h1>Profil Saya</h1>
        
        <div className="profile-card">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <div className="profile-info">
            <table className="profile-table">
              <tbody>
                <tr>
                  <td><strong>Nama</strong></td>
                  <td>{user?.name}</td>
                </tr>
                <tr>
                  <td><strong>Email</strong></td>
                  <td>{user?.email}</td>
                </tr>
                <tr>
                  <td><strong>Role</strong></td>
                  <td>
                    <span className={`role-badge ${user?.role?.toLowerCase()}`}>
                      {user?.role}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td><strong>Bergabung</strong></td>
                  <td>{user?.createdAt ? formatDate(user.createdAt) : "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}