import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  ClipboardList,
  Calendar,
  Settings,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SEO from "@/components/SEO";
import logo from "@/assets/logo.png";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

const AdminStaff = () => {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    title: "",
    department: "",
    employee_number: "",
  });

  useEffect(() => {
    fetchStaff();
    fetchScheduledTasks();
  }, []);

  // Fetch staff profiles and emails from auth.users
  const fetchStaff = async () => {
    // 1. Get staff_profiles
    const { data: staffProfiles, error } = await supabase
      .from("staff_profiles")
      .select("user_id,first_name,last_name,phone_number,title,department,employee_number,created_at");
    if (error || !staffProfiles) {
      setStaffList([]);
      return;
    }

    // 2. Get emails from auth.users
    const { data: authUsers } = await supabase
      .from("users")
      .select("id,email");

    // 3. Merge email into staffProfiles
    const staffWithEmail = staffProfiles.map((staff: any) => {
      const user = authUsers?.find((u: any) => u.id === staff.user_id);
      return { ...staff, email: user?.email || "" };
    });

    setStaffList(staffWithEmail);
  };

  const fetchScheduledTasks = async () => {
    const { data: inspections } = await supabase
      .from("inspections")
      .select("id,unit_id,scheduled_at,conducted_by_id,type,summary,condition_rating,created_at");
    const { data: maintenance } = await supabase
      .from("maintenance_tasks")
      .select("id,unit_id,assigned_staff_id,category,description,priority,status,scheduled_for,created_at");
    const { data: cleaning } = await supabase
      .from("cleaning_jobs")
      .select("id,unit_id,vendor_id,status,scheduled_at,notes,created_at");
    setScheduledTasks([
      ...(inspections || []),
      ...(maintenance || []),
      ...(cleaning || []),
    ]);
  };

  const filteredStaff = staffList.filter(
    staff =>
      `${staff.first_name} ${staff.last_name}`.toLowerCase().includes(search.toLowerCase())
      || staff.employee_number?.toLowerCase().includes(search.toLowerCase())
      || staff.phone_number?.toLowerCase().includes(search.toLowerCase())
      || staff.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Create Staff Handler using supabase.auth.signUp
  const handleCreateStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const first_name = (formData.get("first_name") as string).trim();
    const last_name = (formData.get("last_name") as string).trim();
    const email = (formData.get("email") as string).trim();
    const phone_number = (formData.get("phone") as string).trim();
    const department = formData.get("department") as string;
    const password = (formData.get("password") as string).trim();
    const title = department.charAt(0).toUpperCase() + department.slice(1);
    const employee_number = Math.floor(Math.random() * 1000000).toString();

    try {
      // 1. Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error || !data.user?.id) throw new Error(error?.message || "Failed to create user");
      const user_id = data.user.id;

      // 2. Insert into staff_profiles
      const { error: profileError } = await supabase.from("staff_profiles").insert([
        {
          user_id,
          first_name,
          last_name,
          phone_number,
          title,
          department,
          employee_number,
        },
      ]);
      if (profileError) throw new Error(profileError.message);

      // 3. Create notification
      await supabase.from("notifications").insert([
        {
          user_id,
          type: "welcome",
          title: "Account Created",
          body: "Your account has been created.",
          channel: "web",
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      ]);

      toast.success("Staff created successfully!");
      setShowCreateModal(false);
      fetchStaff();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Edit Staff Handler
  const handleEditStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      const { error } = await supabase
        .from("staff_profiles")
        .update({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          phone_number: editForm.phone_number,
          title: editForm.title,
          department: editForm.department,
          employee_number: editForm.employee_number,
        })
        .eq("user_id", selectedStaff.user_id);

      if (error) throw new Error(error.message);

      toast.success("Staff updated!");
      setShowEditModal(false);
      fetchStaff();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Delete Staff Handler
  const handleDeleteStaff = async (user_id: string) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;
    setFormLoading(true);
    try {
      // Remove from staff_profiles
      const { error } = await supabase.from("staff_profiles").delete().eq("user_id", user_id);
      if (error) throw new Error(error.message);

      toast.success("Staff deleted!");
      fetchStaff();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Open Edit Modal and set form state
  const openEditModal = (staff: any) => {
    setSelectedStaff(staff);
    setEditForm({
      first_name: staff.first_name,
      last_name: staff.last_name,
      phone_number: staff.phone_number,
      title: staff.title,
      department: staff.department,
      employee_number: staff.employee_number,
    });
    setShowEditModal(true);
  };

  return (
    <>
      <SEO
        title="Admin Staff Management - Domus Servitia"
        description="Manage staff accounts and scheduled tasks."
        canonical="https://domusservitia.co.uk/admin-staff"
      />
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <img src={logo} alt="Domus Servitia" className="h-10 rounded-lg" />
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Users className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Page Title */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
                Staff Management
              </h1>
              <p className="text-muted-foreground">
                Create, manage, and assign tasks to staff members.
              </p>
            </div>
            <Button
              className="bg-gradient-gold text-primary font-semibold"
              onClick={() => setShowCreateModal(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Staff</p>
                    <p className="text-2xl font-bold text-foreground">{staffList.length}</p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-full">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active</p>
                    <p className="text-2xl font-bold text-green-600">
                      {staffList.length}
                    </p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Scheduled Tasks</p>
                    <p className="text-2xl font-bold text-accent">
                      {scheduledTasks.length}
                    </p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-full">
                    <ClipboardList className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Staff List Section */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Staff Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-center gap-2">
                    <Input
                      placeholder="Search staff by name, employee number, phone, or email..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="max-w-xs"
                    />
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="py-2 px-2 text-left">Name</th>
                          <th className="py-2 px-2 text-left">Email</th>
                          <th className="py-2 px-2 text-left">Phone</th>
                          <th className="py-2 px-2 text-left">Title</th>
                          <th className="py-2 px-2 text-left">Department</th>
                          <th className="py-2 px-2 text-left">Employee #</th>
                          <th className="py-2 px-2 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStaff.map(staff => (
                          <tr key={staff.user_id} className="border-b border-border hover:bg-muted/40">
                            <td className="py-2 px-2">{staff.first_name} {staff.last_name}</td>
                            <td className="py-2 px-2">{staff.email}</td>
                            <td className="py-2 px-2">{staff.phone_number}</td>
                            <td className="py-2 px-2">{staff.title}</td>
                            <td className="py-2 px-2">{staff.department}</td>
                            <td className="py-2 px-2">{staff.employee_number}</td>
                            <td className="py-2 px-2 text-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditModal(staff)}
                                aria-label="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Delete"
                                onClick={() => handleDeleteStaff(staff.user_id)}
                                disabled={formLoading}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Scheduled Tasks Section */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Scheduled Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scheduledTasks.map(task => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {task.type ? `${task.type} - ${task.summary || task.category || ""}` : task.category || "Task"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Assigned to: {task.conducted_by_id || task.assigned_staff_id || task.vendor_id}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                            {task.status || "Scheduled"}
                          </span>
                          <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4 mr-1" />
                            Reschedule
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-gradient-gold text-primary font-semibold" onClick={() => setShowCreateModal(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Staff
                  </Button>
                  <Button variant="outline" className="w-full">
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Assign Task
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Staff Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Create Staff Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-card rounded-lg shadow-lg w-full max-w-md relative">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <span className="font-semibold text-lg">Add New Staff</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCreateModal(false)}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="px-6 py-4">
                <form className="space-y-4" onSubmit={handleCreateStaff}>
                  <div>
                    <label className="text-sm font-medium">First Name</label>
                    <Input className="w-full" name="first_name" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Name</label>
                    <Input className="w-full" name="last_name" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input className="w-full" type="email" name="email" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone Number</label>
                    <Input className="w-full" name="phone" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Department</label>
                    <Input className="w-full" name="department" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Password</label>
                    <Input className="w-full" type="password" name="password" required />
                  </div>
                  {formError && (
                    <div className="text-red-600 text-sm">{formError}</div>
                  )}
                  <Button
                    type="submit"
                    className="bg-gradient-gold text-primary font-semibold w-full"
                    disabled={formLoading}
                  >
                    {formLoading ? "Creating..." : "Create Staff"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Staff Modal */}
        {showEditModal && selectedStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-card rounded-lg shadow-lg w-full max-w-md relative">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <span className="font-semibold text-lg">Edit Staff</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowEditModal(false)}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="px-6 py-4">
                <form className="space-y-4" onSubmit={handleEditStaff}>
                  <div>
                    <label className="text-sm font-medium">First Name</label>
                    <Input
                      className="w-full"
                      value={editForm.first_name}
                      onChange={e => setEditForm({ ...editForm, first_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Name</label>
                    <Input
                      className="w-full"
                      value={editForm.last_name}
                      onChange={e => setEditForm({ ...editForm, last_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone Number</label>
                    <Input
                      className="w-full"
                      value={editForm.phone_number}
                      onChange={e => setEditForm({ ...editForm, phone_number: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      className="w-full"
                      value={editForm.title}
                      onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Department</label>
                    <Input
                      className="w-full"
                      value={editForm.department}
                      onChange={e => setEditForm({ ...editForm, department: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Employee #</label>
                    <Input
                      className="w-full"
                      value={editForm.employee_number}
                      onChange={e => setEditForm({ ...editForm, employee_number: e.target.value })}
                      required
                    />
                  </div>
                  {formError && (
                    <div className="text-red-600 text-sm">{formError}</div>
                  )}
                  <Button
                    type="submit"
                    className="bg-gradient-gold text-primary font-semibold w-full"
                    disabled={formLoading}
                  >
                    {formLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminStaff;