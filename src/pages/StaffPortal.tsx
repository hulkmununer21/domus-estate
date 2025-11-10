import { Link } from "react-router-dom";
import { ClipboardList, Users, Wrench, Calendar, Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/SEO";
import logo from "@/assets/logo.png";

const StaffPortal = () => {
  const { logout } = useAuth();

  return (
    <>
      <SEO
        title="Staff Portal - Domus Servitia"
        description="Staff portal for managing tasks, maintenance schedules, property inspections, and client communications."
        canonical="https://domusservitia.co.uk/staff-portal"
      />
      <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <img src={logo} alt="Domus Servitia" className="h-10 rounded-lg" />
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
            Staff Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage tasks and lodger information
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Assigned Tasks
                  </p>
                  <p className="text-2xl font-bold text-foreground">8</p>
                </div>
                <div className="bg-accent/10 p-3 rounded-full">
                  <ClipboardList className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Managed Lodgers
                  </p>
                  <p className="text-2xl font-bold text-foreground">15</p>
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
                  <p className="text-sm text-muted-foreground mb-1">
                    Maintenance Jobs
                  </p>
                  <p className="text-2xl font-bold text-foreground">5</p>
                </div>
                <div className="bg-accent/10 p-3 rounded-full">
                  <Wrench className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Today's Appointments
                  </p>
                  <p className="text-2xl font-bold text-foreground">3</p>
                </div>
                <div className="bg-accent/10 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task List */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Today's Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      task: "Property Inspection",
                      property: "Modern City Centre Studio",
                      time: "10:00 AM",
                      status: "Pending",
                    },
                    {
                      task: "Update Lodger Information",
                      property: "John Smith - Riverside Apartment",
                      time: "2:00 PM",
                      status: "In Progress",
                    },
                    {
                      task: "Maintenance Follow-up",
                      property: "Executive Penthouse",
                      time: "4:30 PM",
                      status: "Pending",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium mb-1">{item.task}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.property}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium mb-1">{item.time}</p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            item.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Tasks
                </Button>
              </CardContent>
            </Card>

            {/* Lodger Management */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Recent Lodger Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: "John Smith",
                      action: "Information updated",
                      time: "2 hours ago",
                    },
                    {
                      name: "Sarah Johnson",
                      action: "Payment status verified",
                      time: "5 hours ago",
                    },
                    {
                      name: "Mike Brown",
                      action: "New complaint submitted",
                      time: "1 day ago",
                    },
                  ].map((update, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="font-medium">{update.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {update.action}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {update.time}
                      </p>
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
                <Button className="w-full bg-gradient-gold text-primary font-semibold">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Lodgers
                </Button>
                <Button variant="outline" className="w-full">
                  <Wrench className="h-4 w-4 mr-2" />
                  Schedule Maintenance
                </Button>
                <Button variant="outline" className="w-full">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>This Week's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="pb-3 border-b border-border">
                    <p className="text-sm font-medium mb-1">Monday</p>
                    <p className="text-xs text-muted-foreground">
                      3 property inspections
                    </p>
                  </div>
                  <div className="pb-3 border-b border-border">
                    <p className="text-sm font-medium mb-1">Wednesday</p>
                    <p className="text-xs text-muted-foreground">
                      2 lodger meetings
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Friday</p>
                    <p className="text-xs text-muted-foreground">
                      Weekly team meeting
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="pb-3 border-b border-border">
                    <p className="text-sm font-medium mb-1">New Task Assigned</p>
                    <p className="text-xs text-muted-foreground">
                      Property inspection required
                    </p>
                  </div>
                  <div className="pb-3 border-b border-border">
                    <p className="text-sm font-medium mb-1">
                      Maintenance Update
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Job completed at Executive Penthouse
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Message from Admin</p>
                    <p className="text-xs text-muted-foreground">
                      Review updated procedures
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default StaffPortal;
