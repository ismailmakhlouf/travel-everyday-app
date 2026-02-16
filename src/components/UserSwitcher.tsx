import { LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const UserSwitcher = () => {
  const { user, profile, signOut } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-secondary/60 text-xs">
        <User className="w-3 h-3 text-muted-foreground" />
        <span className="text-foreground font-medium truncate max-w-[120px]">
          {profile?.display_name || user.email}
        </span>
      </div>
      <button
        onClick={signOut}
        className="p-1.5 rounded-lg hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
        title="Sign out"
      >
        <LogOut className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default UserSwitcher;
