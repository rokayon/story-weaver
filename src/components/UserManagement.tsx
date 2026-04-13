import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Shield, Plus, Trash2, Search } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

const ALL_ROLES = ["admin", "user", "editor", "reviewer", "publisher", "hr", "super_admin"] as const;

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-primary/15 text-primary border-primary/30",
  super_admin: "bg-destructive/15 text-destructive border-destructive/30",
  editor: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  reviewer: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
  publisher: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
  hr: "bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30",
  user: "bg-secondary text-secondary-foreground border-border",
};

interface UserWithRoles extends Profile {
  roles: string[];
}

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addingRole, setAddingRole] = useState<string | null>(null); // user_id currently adding role to

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    const { data: roles } = await supabase.from("user_roles").select("*");

    if (profiles) {
      const usersWithRoles: UserWithRoles[] = profiles.map(p => ({
        ...p,
        roles: roles?.filter(r => r.user_id === p.user_id).map(r => r.role) || [],
      }));
      setUsers(usersWithRoles);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const addRole = async (userId: string, role: string) => {
    const { error } = await supabase.from("user_roles").insert({
      user_id: userId,
      role: role as any,
    });
    if (error) {
      toast({ title: "Failed to add role", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Role added", description: `Assigned ${role} role successfully.` });
      fetchUsers();
    }
    setAddingRole(null);
  };

  const removeRole = async (userId: string, role: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as any);
    if (error) {
      toast({ title: "Failed to remove role", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Role removed" });
      fetchUsers();
    }
  };

  const filtered = users.filter(u =>
    (u.display_name || "").toLowerCase().includes(search.toLowerCase()) ||
    u.user_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search users by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-secondary pl-10 pr-4 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Users", count: users.length, icon: Users },
          { label: "Admins", count: users.filter(u => u.roles.includes("admin")).length, icon: Shield },
          { label: "Editors", count: users.filter(u => u.roles.includes("editor")).length, icon: Shield },
          { label: "Publishers", count: users.filter(u => u.roles.includes("publisher")).length, icon: Shield },
        ].map(({ label, count, icon: Icon }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-4 text-center">
            <Icon className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-xl font-display font-bold text-foreground">{count}</p>
            <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground font-body py-12">Loading users...</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(user => (
            <div key={user.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-display font-bold text-primary">
                      {(user.display_name || "U")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-foreground truncate">
                        {user.display_name || "Unnamed User"}
                      </p>
                      <p className="text-[10px] font-body text-muted-foreground truncate">{user.user_id}</p>
                    </div>
                  </div>

                  {/* Roles */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {user.roles.map(role => (
                      <span
                        key={role}
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-body font-medium ${ROLE_COLORS[role] || ROLE_COLORS.user}`}
                      >
                        {role}
                        <button
                          onClick={() => removeRole(user.user_id, role)}
                          className="ml-0.5 hover:opacity-70"
                          title={`Remove ${role} role`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    ))}

                    {/* Add role button */}
                    {addingRole === user.user_id ? (
                      <div className="flex flex-wrap gap-1">
                        {ALL_ROLES.filter(r => !user.roles.includes(r)).map(role => (
                          <button
                            key={role}
                            onClick={() => addRole(user.user_id, role)}
                            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-body font-medium hover:brightness-110 transition-all ${ROLE_COLORS[role] || ROLE_COLORS.user}`}
                          >
                            + {role}
                          </button>
                        ))}
                        <button
                          onClick={() => setAddingRole(null)}
                          className="rounded-full border border-border px-2 py-0.5 text-[11px] font-body text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingRole(user.user_id)}
                        className="inline-flex items-center gap-0.5 rounded-full border border-dashed border-border px-2 py-0.5 text-[11px] font-body text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                      >
                        <Plus className="h-3 w-3" /> Add Role
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="py-12 text-center text-muted-foreground font-body">
              {search ? "No users match your search." : "No users found."}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
